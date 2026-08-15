import type { SearchRequest, SearchResponse, FilterOptions, HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function searchPharmacology(req: SearchRequest): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorData.detail || `Search failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchFilters(): Promise<FilterOptions> {
  const res = await fetch(`${API_BASE}/api/filters`);
  if (!res.ok) {
    throw new Error('Failed to fetch available filters');
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error('Backend health check failed');
  }
  return res.json();
}
