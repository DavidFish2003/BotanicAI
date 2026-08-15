import React from 'react';
import { useSearch } from '../hooks/useSearch';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { PlantCard } from '../components/PlantCard';
import { DetailModal } from '../components/DetailModal';
import {
  Leaf,
  FlaskConical,
  Database,
  Cpu,
  BookOpen,
  AlertCircle,
  Clock,
  Sparkles,
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
      {/* Header Branding */}
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="brand-badge">
          <Leaf size={14} />
          <span>Scientific Phytochemistry & Pharmacology</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, marginBottom: '0.8rem' }}>
          <span className="gradient-text">BotanicAI</span>{' '}
          <span style={{ fontWeight: 300, color: '#e2e8f0' }}>Search</span>
        </h1>

        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: '#94a3b8' }}>
          Mine scientific literature from <strong style={{ color: '#ecfdf5' }}>PubMed</strong> and{' '}
          <strong style={{ color: '#ecfdf5' }}>OpenAlex</strong> to extract structured phytopharmacological data,
          bioactivities, and active phytomolecules using LLMs.
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

      {/* Search Meta Stats Bar */}
      {searchResponse && !loading && (
        <div
          style={{
            maxWidth: '840px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.6rem 1rem',
            background: 'rgba(10, 24, 16, 0.4)',
            border: '1px solid rgba(52, 211, 153, 0.1)',
            borderRadius: '12px',
            fontSize: '0.82rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>
              Query: <em style={{ color: '#34d399' }}>"{searchResponse.query}"</em>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={13} style={{ color: '#6ee7b7' }} />
              {searchResponse.total_papers_found} papers analyzed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              {searchResponse.execution_time_ms} ms {searchResponse.cached && '(cached)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cpu size={13} style={{ color: '#38bdf8' }} />
            <span>Engine: {searchResponse.extraction_engine}</span>
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

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ marginTop: '2rem' }}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
            }}
          >
            <Sparkles size={18} />
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>
              Querying PubMed & OpenAlex & Running Pharmacological Extraction...
            </span>
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
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
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
              Dual Literature Mining
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Simultaneously searches PubMed (NCBI Entrez) and OpenAlex for pharmacological, phytochemistry, and bioactive compound publications.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
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
              Structured Phytochemistry
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Identifies active compounds (*quercetin, rosmarinic acid, curcumin*), extract types (essential oils, ethanolic extracts), and pharmacological mechanisms.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
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
              Tissue-Specific Grouping
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Automatically categorizes pharmacological data by plant morphology: leaves, roots, bark, seeds, flowers, rhizomes, and whole plant extracts.
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
};
