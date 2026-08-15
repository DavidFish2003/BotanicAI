export interface PaperRecord {
  id: string;
  title: string;
  abstract: string;
  doi?: string | null;
  source: string; // "PubMed" | "OpenAlex"
  year?: number | null;
  journal?: string | null;
  authors?: string[];
  url?: string | null;
  is_peer_reviewed: boolean;
}

export interface PhytoExtraction {
  plant_part: string;
  bioactivity: string[];
  bioactive_compounds: string[];
  confidence_score: number;
  extraction_method: string;
  mechanisms_of_action?: string[];
  extract_type?: string | null;
  notes?: string | null;
}

export interface PaperExtraction {
  paper: PaperRecord;
  extraction: PhytoExtraction;
}

export interface PlantCardData {
  id: string;
  plant_name: string;
  plant_part: string;
  bioactivities: string[];
  bioactive_compounds: string[];
  confidence_score: number;
  paper_count: number;
  papers: PaperExtraction[];
  extract_types: string[];
  primary_mechanisms: string[];
}

export interface FilterOptions {
  plant_parts: string[];
  bioactivities: string[];
}

export interface SearchRequest {
  query: string;
  tissue_filter?: string[];
  bioactivity_filter?: string[];
  min_confidence?: number;
  limit?: number;
}

export interface SearchResponse {
  query: string;
  total_papers_found: number;
  total_cards: number;
  cards: PlantCardData[];
  filters_available: FilterOptions;
  execution_time_ms: number;
  cached: boolean;
  extraction_engine: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  llm_configured: boolean;
  service: string;
  redis_connected?: boolean;
  cache_type?: string;
}

export interface SuggestedPlant {
  query: string;
  common_name: string;
  category?: string;
}
