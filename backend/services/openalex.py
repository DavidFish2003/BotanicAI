import logging
import httpx
from typing import List, Optional, Dict
from models import PaperRecord

logger = logging.getLogger("botanic_ai.openalex")
OPENALEX_API_URL = "https://api.openalex.org/works"


def reconstruct_abstract(inverted_index: Optional[Dict[str, List[int]]]) -> str:
    """Reconstructs linear text from OpenAlex's abstract_inverted_index structure."""
    if not inverted_index or not isinstance(inverted_index, dict):
        return ""
    try:
        word_positions = []
        for word, positions in inverted_index.items():
            for pos in positions:
                word_positions.append((pos, word))
        word_positions.sort(key=lambda x: x[0])
        return " ".join(w for _, w in word_positions)
    except Exception as e:
        logger.warning(f"Failed to reconstruct abstract: {e}")
        return ""


async def search_openalex(query: str, limit: int = 15) -> List[PaperRecord]:
    """
    Queries OpenAlex for scholarly works relating to botanical pharmacology.
    Filters for papers that have abstracts available.
    """
    records: List[PaperRecord] = []
    search_query = f"{query} pharmacology OR phytochemistry OR bioactive OR extract"
    params = {
        "search": search_query,
        "filter": "has_abstract:true,type:article",
        "per_page": min(limit, 25),
        "sort": "relevance_score:desc",
        "mailto": "research@botanicai.local"
    }

    headers = {
        "User-Agent": "BotanicAI/1.3 (https://botanicai.local; mailto:research@botanicai.local)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPENALEX_API_URL, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"OpenAlex returned status code {resp.status_code}: {resp.text}")
                return []
            
            data = resp.json()
            results = data.get("results", [])
            
            for item in results:
                title = item.get("title") or ""
                abstract = reconstruct_abstract(item.get("abstract_inverted_index"))
                
                if len(abstract.strip()) < 40:
                    continue
                
                doi = item.get("doi")
                if doi and doi.startswith("https://doi.org/"):
                    doi = doi.replace("https://doi.org/", "")
                
                item_id = item.get("id") or (f"openalex_{doi}" if doi else f"openalex_{len(records)}")
                
                # Authors
                authors = []
                for authorship in item.get("authorships", []):
                    author_name = authorship.get("author", {}).get("display_name")
                    if author_name:
                        authors.append(author_name)
                
                # Journal / Source
                journal = None
                primary_loc = item.get("primary_location") or {}
                source = primary_loc.get("source") or {}
                if source:
                    journal = source.get("display_name")
                
                year = item.get("publication_year")
                landing_url = (f"https://doi.org/{doi}" if doi else None) or (primary_loc.get("landing_page_url"))
                
                records.append(
                    PaperRecord(
                        id=item_id,
                        title=title.strip(),
                        abstract=abstract.strip(),
                        doi=doi,
                        source="OpenAlex",
                        year=year,
                        journal=journal,
                        authors=authors[:5],
                        url=landing_url,
                        is_peer_reviewed=True
                    )
                )
                
    except Exception as e:
        logger.error(f"Error querying OpenAlex for '{query}': {e}", exc_info=True)

    return records
