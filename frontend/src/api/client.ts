import type { SearchRequest, SearchResponse, FilterOptions, HealthResponse } from '../types';

function getApiEndpoint(path: string): string {
  let rawBase = (import.meta.env.VITE_API_URL || '').trim();

  if (!rawBase) {
    if (import.meta.env.DEV) {
      return `http://localhost:8000${path}`;
    }
    return path;
  }

  // Remove trailing slashes
  rawBase = rawBase.replace(/\/+$/, '');

  // If user entered URL ending with /api (e.g. https://botanicai.onrender.com/api)
  if (rawBase.endsWith('/api') && path.startsWith('/api')) {
    rawBase = rawBase.slice(0, -4);
  }

  return `${rawBase}${path}`;
}

export async function searchPharmacology(req: SearchRequest): Promise<SearchResponse> {
  const url = getApiEndpoint('/api/search');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      if (res.status === 404 && !import.meta.env.VITE_API_URL) {
        throw new Error(
          'Backend 404: VITE_API_URL environment variable is missing on Netlify. Please set VITE_API_URL (e.g. https://your-backend.onrender.com) in Netlify Site Configuration -> Environment Variables and re-deploy.'
        );
      }
      const errorData = await res.json().catch(() => ({ detail: `Backend returned status ${res.status}` }));
      throw new Error(errorData.detail || `Search failed with status ${res.status}`);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
      throw new Error(
        `Unable to connect to backend (${url}). Make sure your backend service is online and VITE_API_URL is configured in Netlify.`
      );
    }
    throw err;
  }
}

export async function fetchFilters(): Promise<FilterOptions> {
  const url = getApiEndpoint('/api/filters');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch available filters');
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const url = getApiEndpoint('/api/health');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Backend health check failed');
  }
  return res.json();
}
