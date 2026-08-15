import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PlantCardData, FilterOptions, SearchResponse } from '../types';
import { searchPharmacology, fetchFilters } from '../api/client';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);

  // Filters State
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    plant_parts: [
      'Leaf',
      'Root',
      'Bark',
      'Seed',
      'Flower',
      'Stem',
      'Fruit',
      'Rhizome',
      'Aerial Parts',
      'Bulb',
      'Whole Plant',
    ],
    bioactivities: [
      'Antioxidant',
      'Anti-inflammatory',
      'Antimicrobial',
      'Antibacterial',
      'Antifungal',
      'Neuroprotective',
      'Hepatoprotective',
      'Anticancer / Cytotoxic',
      'Analgesic',
      'Antidiabetic',
      'Cardioprotective',
    ],
  });

  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [selectedBioactivities, setSelectedBioactivities] = useState<string[]>([]);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [selectedCard, setSelectedCard] = useState<PlantCardData | null>(null);

  // Load available filters on mount
  useEffect(() => {
    fetchFilters()
      .then((data) => {
        if (data && data.plant_parts) {
          setFilterOptions(data);
        }
      })
      .catch((err) => {
        console.warn('Using default filter options:', err);
      });
  }, []);

  const executeSearch = useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.trim();
      if (!q) return;

      setLoading(true);
      setError(null);

      try {
        const resp = await searchPharmacology({
          query: q,
          limit: 20,
        });
        setSearchResponse(resp);
        if (resp.filters_available) {
          setFilterOptions(resp.filters_available);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to mine pharmacological literature. Please verify backend is running.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const togglePart = useCallback((part: string) => {
    setSelectedParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    );
  }, []);

  const toggleBioactivity = useCallback((bio: string) => {
    setSelectedBioactivities((prev) =>
      prev.includes(bio) ? prev.filter((b) => b !== bio) : [...prev, bio]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedParts([]);
    setSelectedBioactivities([]);
    setMinConfidence(0);
  }, []);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    if (!searchResponse || !searchResponse.cards) return [];

    return searchResponse.cards.filter((card) => {
      // Plant Part Filter
      if (selectedParts.length > 0) {
        const cardPart = card.plant_part.toLowerCase();
        const matchesPart = selectedParts.some((p) => p.toLowerCase() === cardPart);
        if (!matchesPart) return false;
      }

      // Bioactivity Filter
      if (selectedBioactivities.length > 0) {
        const matchesBio = selectedBioactivities.some((selBio) =>
          card.bioactivities.some((cb) => cb.toLowerCase().includes(selBio.toLowerCase()))
        );
        if (!matchesBio) return false;
      }

      // Confidence Filter
      if (minConfidence > 0 && card.confidence_score < minConfidence) {
        return false;
      }

      return true;
    });
  }, [searchResponse, selectedParts, selectedBioactivities, minConfidence]);

  return {
    query,
    setQuery,
    loading,
    error,
    searchResponse,
    filteredCards,
    filterOptions,
    selectedParts,
    selectedBioactivities,
    minConfidence,
    selectedCard,
    setSelectedCard,
    executeSearch,
    togglePart,
    toggleBioactivity,
    setMinConfidence,
    resetFilters,
  };
}
