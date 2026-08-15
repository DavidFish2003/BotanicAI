import type { SearchRequest, SearchResponse, FilterOptions, HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function searchPharmacology(req: SearchRequest): Promise<SearchResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: `Backend returned status ${res.status}` }));
      throw new Error(errorData.detail || `Search failed with status ${res.status}`);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
      throw new Error(
        'Unable to connect to the BotanicAI backend. If deployed on Netlify, please ensure your Python backend URL is configured in Netlify Environment Variables (VITE_API_URL).'
      );
    }
    throw err;
  }
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
