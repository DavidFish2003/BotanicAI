import time
import os
import re
import asyncio
import logging
from typing import List, Dict
from collections import defaultdict

from fastapi import APIRouter, HTTPException
from models import (
    SearchRequest, SearchResponse, PlantCard,
    PaperRecord, PaperExtraction, FilterOptions
)
from services.openalex import search_openalex
from services.pubmed import search_pubmed
from services.llm_extractor import extract_phyto_data
from services.cache import search_cache
from api.filters import STANDARD_PLANT_PARTS, STANDARD_BIOACTIVITIES

logger = logging.getLogger("botanic_ai.search")
router = APIRouter(prefix="/api", tags=["Search"])


def normalize_title(title: str) -> str:
    """Normalizes title string for deduplication."""
    return re.sub(r"[^a-zA-Z0-9]", "", title.lower())


def deduplicate_papers(papers: List[PaperRecord]) -> List[PaperRecord]:
    """Deduplicates paper records by DOI or normalized title."""
    seen_dois = set()
    seen_titles = set()
    unique_papers: List[PaperRecord] = []

    for paper in papers:
        # Check DOI
        if paper.doi:
            doi_clean = paper.doi.strip().lower()
            if doi_clean in seen_dois:
                continue
            seen_dois.add(doi_clean)

        # Check Title
        norm_title = normalize_title(paper.title)
        if norm_title:
            if norm_title in seen_titles:
                continue
            seen_titles.add(norm_title)

        unique_papers.append(paper)

    return unique_papers


def aggregate_into_cards(query: str, paper_extractions: List[PaperExtraction]) -> List[PlantCard]:
    """
    Groups paper extractions by plant tissue/part and builds rich aggregated PlantCards.
    """
    grouped: Dict[str, List[PaperExtraction]] = defaultdict(list)

    for item in paper_extractions:
        part = item.extraction.plant_part or "Whole Plant"
        grouped[part].append(item)

    cards: List[PlantCard] = []

    # Clean query display name
    clean_plant_name = query.strip().title()

    for part, items in grouped.items():
        bioactivities_set = set()
        compounds_set = set()
        extract_types_set = set()
        mechanisms_set = set()
        total_conf = 0.0

        for it in items:
            for b in it.extraction.bioactivity:
                if b:
                    bioactivities_set.add(b)
            for c in it.extraction.bioactive_compounds:
                if c:
                    compounds_set.add(c)
            if it.extraction.extract_type:
                extract_types_set.add(it.extraction.extract_type)
            if it.extraction.mechanisms_of_action:
                for m in it.extraction.mechanisms_of_action:
                    mechanisms_set.add(m)
            total_conf += it.extraction.confidence_score

        avg_confidence = round(total_conf / len(items), 2) if items else 0.8

        card_id = f"{re.sub(r'[^a-zA-Z0-9]', '_', clean_plant_name.lower())}_{part.lower().replace(' ', '_')}"

        cards.append(
            PlantCard(
                id=card_id,
                plant_name=clean_plant_name,
                plant_part=part,
                bioactivities=sorted(list(bioactivities_set)),
                bioactive_compounds=sorted(list(compounds_set)),
                confidence_score=avg_confidence,
                paper_count=len(items),
                papers=items,
                extract_types=sorted(list(extract_types_set)),
                primary_mechanisms=sorted(list(mechanisms_set))[:5]
            )
        )

    # Sort cards by paper count descending, then confidence descending
    cards.sort(key=lambda c: (c.paper_count, c.confidence_score), reverse=True)
    return cards


@router.post("/search", response_model=SearchResponse)
async def search_botanical_pharmacology(req: SearchRequest):
    """
    Core search endpoint:
    1. Queries OpenAlex and PubMed in parallel
    2. Deduplicates paper records
    3. Extracts structured phytopharmacology records via LLM/NLP
    4. Aggregates records into interactive PlantCards grouped by plant part
    """
    start_time = time.time()
    query_clean = req.query.strip()
    if not query_clean:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Check Cache
    cache_key = f"{query_clean.lower()}"
    cached_data = search_cache.get(cache_key)
    
    if cached_data is not None:
        cards: List[PlantCard] = cached_data.get("cards", [])
        total_papers = cached_data.get("total_papers", 0)
        
        # Apply filters to cached cards
        filtered_cards = filter_cards(cards, req)
        
        elapsed = round((time.time() - start_time) * 1000, 1)
        return SearchResponse(
            query=query_clean,
            total_papers_found=total_papers,
            total_cards=len(filtered_cards),
            cards=filtered_cards,
            filters_available=FilterOptions(
                plant_parts=STANDARD_PLANT_PARTS,
                bioactivities=STANDARD_BIOACTIVITIES
            ),
            execution_time_ms=elapsed,
            cached=True,
            extraction_engine="gpt-4o-mini" if os.getenv("OPENAI_API_KEY") else "nlp-heuristic"
        )

    # Concurrently search OpenAlex and PubMed
    limit_per_source = max(5, req.limit // 2)
    openalex_task = asyncio.create_task(search_openalex(query_clean, limit=limit_per_source))
    pubmed_task = asyncio.create_task(search_pubmed(query_clean, limit=limit_per_source))

    results = await asyncio.gather(openalex_task, pubmed_task, return_exceptions=True)
    
    raw_papers: List[PaperRecord] = []
    for res in results:
        if isinstance(res, list):
            raw_papers.extend(res)
        elif isinstance(res, Exception):
            logger.error(f"External API search error: {res}")

    # Deduplicate
    unique_papers = deduplicate_papers(raw_papers)
    
    if not unique_papers:
        elapsed = round((time.time() - start_time) * 1000, 1)
        return SearchResponse(
            query=query_clean,
            total_papers_found=0,
            total_cards=0,
            cards=[],
            filters_available=FilterOptions(
                plant_parts=STANDARD_PLANT_PARTS,
                bioactivities=STANDARD_BIOACTIVITIES
            ),
            execution_time_ms=elapsed,
            cached=False,
            extraction_engine="gpt-4o-mini" if os.getenv("OPENAI_API_KEY") else "nlp-heuristic"
        )

    # Run extraction
    extractions = await extract_phyto_data(unique_papers)

    # Combine into PaperExtraction objects
    paper_extractions: List[PaperExtraction] = []
    for paper, ext in zip(unique_papers, extractions):
        paper_extractions.append(PaperExtraction(paper=paper, extraction=ext))

    # Aggregate into PlantCards
    cards = aggregate_into_cards(query_clean, paper_extractions)

    # Cache full aggregated cards
    search_cache.set(cache_key, {
        "cards": cards,
        "total_papers": len(unique_papers)
    })

    # Apply request filters
    filtered_cards = filter_cards(cards, req)

    elapsed = round((time.time() - start_time) * 1000, 1)
    return SearchResponse(
        query=query_clean,
        total_papers_found=len(unique_papers),
        total_cards=len(filtered_cards),
        cards=filtered_cards,
        filters_available=FilterOptions(
            plant_parts=STANDARD_PLANT_PARTS,
            bioactivities=STANDARD_BIOACTIVITIES
        ),
        execution_time_ms=elapsed,
        cached=False,
        extraction_engine="gpt-4o-mini" if os.getenv("OPENAI_API_KEY") else "nlp-heuristic"
    )


def filter_cards(cards: List[PlantCard], req: SearchRequest) -> List[PlantCard]:
    """Applies tissue, bioactivity, and confidence filters to cards."""
    filtered = cards

    # Tissue filter
    if req.tissue_filter:
        req_parts_lower = [p.lower() for p in req.tissue_filter]
        filtered = [c for c in filtered if c.plant_part.lower() in req_parts_lower]

    # Bioactivity filter
    if req.bioactivity_filter:
        req_bio_lower = [b.lower() for b in req.bioactivity_filter]
        filtered = [
            c for c in filtered
            if any(b.lower() in req_bio_lower for b in c.bioactivities)
        ]

    # Min confidence
    if req.min_confidence and req.min_confidence > 0:
        filtered = [c for c in filtered if c.confidence_score >= req.min_confidence]

    return filtered
