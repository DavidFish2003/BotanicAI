from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., description="Botanical name, common name, or pharmacological target query", min_length=1)
    tissue_filter: Optional[List[str]] = Field(default=None, description="Optional plant parts to filter by")
    bioactivity_filter: Optional[List[str]] = Field(default=None, description="Optional bioactivities to filter by")
    min_confidence: Optional[float] = Field(default=0.0, ge=0.0, le=1.0, description="Minimum extraction confidence score")
    limit: Optional[int] = Field(default=20, ge=1, le=50, description="Maximum number of papers to process")


class PaperRecord(BaseModel):
    id: str = Field(..., description="Unique paper identifier (DOI or PubMed ID or OpenAlex ID)")
    title: str = Field(..., description="Paper title")
    abstract: str = Field(..., description="Paper abstract text")
    doi: Optional[str] = Field(default=None, description="Digital Object Identifier")
    source: str = Field(..., description="Source repository (e.g. 'PubMed', 'OpenAlex')")
    year: Optional[int] = Field(default=None, description="Publication year")
    journal: Optional[str] = Field(default=None, description="Journal or venue name")
    authors: Optional[List[str]] = Field(default_factory=list, description="List of authors")
    url: Optional[str] = Field(default=None, description="Direct URL to paper or landing page")
    is_peer_reviewed: bool = Field(default=True, description="Whether paper is peer-reviewed")


class PhytoExtraction(BaseModel):
    plant_part: str = Field(default="Whole Plant", description="Identified plant tissue/part (e.g., Leaf, Root, Bark, Seed, Flower, Stem, Fruit, Rhizome, Aerial parts, Whole Plant)")
    bioactivity: List[str] = Field(default_factory=list, description="Pharmacological bioactivities (e.g., Antioxidant, Anti-inflammatory, Antimicrobial, Neuroprotective, Cytotoxic)")
    bioactive_compounds: List[str] = Field(default_factory=list, description="Extracted phytochemical compounds (e.g., Quercetin, Rosmarinic acid, Curcumin)")
    confidence_score: float = Field(default=0.8, ge=0.0, le=1.0, description="Extraction confidence score")
    extraction_method: str = Field(default="llm", description="Method used ('gpt-4o-mini' or 'nlp-heuristic')")
    mechanisms_of_action: Optional[List[str]] = Field(default_factory=list, description="Mechanisms of action mentioned in abstract")
    extract_type: Optional[str] = Field(default=None, description="Type of extract used (e.g. ethanolic extract, essential oil, aqueous extract)")


class PaperExtraction(BaseModel):
    paper: PaperRecord
    extraction: PhytoExtraction


class PlantCard(BaseModel):
    id: str = Field(..., description="Unique card ID based on plant and tissue")
    plant_name: str = Field(..., description="Plant species or common name")
    plant_part: str = Field(..., description="Tissue / plant part")
    bioactivities: List[str] = Field(default_factory=list, description="Aggregated unique bioactivities")
    bioactive_compounds: List[str] = Field(default_factory=list, description="Aggregated unique compounds")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Average confidence score across supporting papers")
    paper_count: int = Field(default=1, description="Number of supporting papers")
    papers: List[PaperExtraction] = Field(default_factory=list, description="Detailed supporting papers and extractions")
    extract_types: List[str] = Field(default_factory=list, description="Types of extracts tested (essential oil, ethanol, etc.)")
    primary_mechanisms: List[str] = Field(default_factory=list, description="Primary pharmacological mechanisms reported")


class FilterOptions(BaseModel):
    plant_parts: List[str]
    bioactivities: List[str]


class SearchResponse(BaseModel):
    query: str
    total_papers_found: int
    total_cards: int
    cards: List[PlantCard]
    filters_available: FilterOptions
    execution_time_ms: float
    cached: bool = False
    extraction_engine: str = "gpt-4o-mini"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    llm_configured: bool
    service: str = "BotanicAI Backend"
