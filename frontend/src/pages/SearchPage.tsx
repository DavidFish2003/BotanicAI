import React from 'react';
import { useSearch } from '../hooks/useSearch';
import { Navbar } from '../components/Navbar';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { PlantCard } from '../components/PlantCard';
import { DetailModal } from '../components/DetailModal';
import { OnboardingTour } from '../components/OnboardingTour';
import {
  Leaf,
  FlaskConical,
  Database,
  AlertCircle,
  Search,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const {
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
  } = useSearch();

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar hasSearchResults={!!searchResponse} />

      {/* Header Branding */}
      <header style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <OnboardingTour hasSearchResults={!!searchResponse} />
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 800, marginBottom: '0.8rem' }}>
          <span className="gradient-text">BotanicAI</span>
          <span style={{ fontWeight: 400, color: '#e2e8f0' }}>: The Search Engine For Plant Biochemistry</span>
        </h1>

        <p style={{ maxWidth: '740px', margin: '0 auto', fontSize: '1.08rem', color: '#94a3b8', lineHeight: 1.6 }}>
          Scan through over 500 million papers and find pharmacological data on any plant in seconds
        </p>
      </header>

      {/* Main Search Component */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={executeSearch}
        isLoading={loading}
      />

      {/* Error Message */}
      {error && (
        <div
          style={{
            maxWidth: '840px',
            margin: '1.5rem auto',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            color: '#fecdd3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} style={{ color: '#f43f5e', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Literature Mining Error</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{error}</div>
          </div>
        </div>
      )}

      {/* Filter Panel (when we have results or options) */}
      {searchResponse && (
        <FilterPanel
          availableParts={filterOptions.plant_parts}
          selectedParts={selectedParts}
          onTogglePart={togglePart}
          availableBioactivities={filterOptions.bioactivities}
          selectedBioactivities={selectedBioactivities}
          onToggleBioactivity={toggleBioactivity}
          minConfidence={minConfidence}
          onConfidenceChange={setMinConfidence}
          onResetFilters={resetFilters}
          totalCards={filteredCards.length}
        />
      )}

      {/* Loading Progress Bar & Skeletons */}
      {loading && (
        <div style={{ marginTop: '2rem' }}>
          <div className="search-loading-container">
            <div className="search-progress-track">
              <div className="search-progress-bar" />
            </div>
          </div>

          <div className="results-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="skeleton"
                style={{
                  height: '320px',
                  borderRadius: '18px',
                  border: '1px solid rgba(52, 211, 153, 0.1)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && filteredCards.length > 0 && (
        <div className="results-grid">
          {filteredCards.map((card) => (
            <PlantCard key={card.id} card={card} onSelect={setSelectedCard} />
          ))}
        </div>
      )}

      {/* Empty State when no results match active filters */}
      {!loading && searchResponse && filteredCards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(10, 24, 16, 0.4)',
            borderRadius: '18px',
            border: '1px dashed rgba(52, 211, 153, 0.2)',
            maxWidth: '600px',
            margin: '2rem auto',
          }}
        >
          <Search size={40} style={{ color: '#64748b', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
            No matching cards for current filters
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            Try clearing your tissue or bioactivity filters to view all mined records.
          </p>
          <button
            type="button"
            className="search-btn"
            style={{ margin: '0 auto', fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
            onClick={resetFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Initial Hero / Welcome State */}
      {!loading && !searchResponse && (
        <div
          style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div id="tour-db-sources-fallback" className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '1rem',
              }}
            >
              <Database size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem' }}>
              Millions of Papers, One Click
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
              BotanicAI scans across 6 major research databases—including PubMed, OpenAlex, and bioRxiv—to pull the exact scientific data you need. Replace dozens of open browser tabs with one instant query.
            </p>
          </div>

          <div id="tour-phytochemistry-fallback" className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
                marginBottom: '1rem',
              }}
            >
              <FlaskConical size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem' }}>
              Precise Phytochemistry
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
              Plants contain thousands of molecules. BotanicAI automatically isolates the specific active compounds (like curcumin or quercetin) and links them directly to their observed health and biological effects.
            </p>
          </div>

          <div id="tour-morphology-filter-fallback" className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7',
                marginBottom: '1rem',
              }}
            >
              <Leaf size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem' }}>
              Plant Morphology Filtering
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
              Not every part of a plant does the same thing. BotanicAI categorizes research directly by plant anatomy, showing you exactly what active compounds live in the leaves, roots, bark, seeds, or flowers.
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
};
