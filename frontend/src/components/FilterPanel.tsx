import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Activity } from 'lucide-react';

interface FilterPanelProps {
  availableParts: string[];
  selectedParts: string[];
  onTogglePart: (part: string) => void;
  availableBioactivities: string[];
  selectedBioactivities: string[];
  onToggleBioactivity: (bio: string) => void;
  minConfidence: number;
  onConfidenceChange: (val: number) => void;
  onResetFilters: () => void;
  totalCards: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  availableParts,
  selectedParts,
  onTogglePart,
  availableBioactivities,
  selectedBioactivities,
  onToggleBioactivity,
  minConfidence,
  onConfidenceChange,
  onResetFilters,
  totalCards,
}) => {
  const hasActiveFilters =
    selectedParts.length > 0 ||
    selectedBioactivities.length > 0 ||
    minConfidence > 0;

  return (
    <div className="filter-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SlidersHorizontal size={18} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Pharmacological & Tissue Filters
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
            ({totalCards} {totalCards === 1 ? 'record' : 'records'} matching)
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fda4af',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s',
            }}
          >
            <RotateCcw size={12} />
            Reset All
          </button>
        )}
      </div>

      {/* Tissue / Plant Part Filters */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="filter-group-title">
          <Filter size={14} /> Plant Tissue / Morphological Part
        </div>
        <div className="filter-chips-grid">
          {availableParts.map((part) => {
            const isActive = selectedParts.includes(part);
            return (
              <button
                key={part}
                type="button"
                className={`tissue-chip ${isActive ? 'active' : ''}`}
                onClick={() => onTogglePart(part)}
              >
                <span>{part}</span>
                {isActive && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bioactivity Filters */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="filter-group-title">
          <Activity size={14} /> Bioactivity Class
        </div>
        <div className="filter-chips-grid">
          {availableBioactivities.slice(0, 10).map((bio) => {
            const isActive = selectedBioactivities.includes(bio);
            return (
              <button
                key={bio}
                type="button"
                className={`tissue-chip ${isActive ? 'active' : ''}`}
                onClick={() => onToggleBioactivity(bio)}
                style={{ fontSize: '0.8rem' }}
              >
                <span>{bio}</span>
                {isActive && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confidence Score Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
            Min Confidence Score:
          </span>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
            style={{
              flex: 1,
              accentColor: '#10b981',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#34d399', fontWeight: 700, minWidth: '40px' }}>
            {(minConfidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
