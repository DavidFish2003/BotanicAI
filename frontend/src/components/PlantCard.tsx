import React, { useState } from 'react';
import type { PlantCardData } from '../types';
import { Leaf, FlaskConical, FileText, ChevronRight } from 'lucide-react';
import { ConfidenceGauge } from './ConfidenceGauge';

interface PlantCardProps {
  card: PlantCardData;
  onSelect: (card: PlantCardData) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ card, onSelect }) => {
  const [showAllCompounds, setShowAllCompounds] = useState(false);

  const getTagClass = (bio: string) => {
    const b = bio.toLowerCase();
    if (b.includes('antioxidant')) return 'tag-antioxidant';
    if (b.includes('anti-inflammatory') || b.includes('inflammation')) return 'tag-anti-inflammatory';
    if (b.includes('antimicrobial') || b.includes('antibacterial') || b.includes('antifungal') || b.includes('antiviral')) return 'tag-antimicrobial';
    if (b.includes('cytotoxic') || b.includes('anticancer') || b.includes('tumor')) return 'tag-cytotoxic';
    if (b.includes('neuroprotective')) return 'tag-neuroprotective';
    return '';
  };

  const visibleCompounds = showAllCompounds
    ? card.bioactive_compounds
    : card.bioactive_compounds.slice(0, 5);

  const hasExtraCompounds = card.bioactive_compounds.length > 5;

  return (
    <div className="plant-card">
      <div>
        {/* Top Header: Tissue Badge & Evidence Count */}
        <div className="card-header">
          <span className="card-tissue-badge">
            <Leaf size={12} />
            {card.plant_part}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Evidence</span>
            <span className="paper-count-badge" style={{ color: '#6ee7b7', fontWeight: 700 }}>
              <FileText size={13} />
              {card.paper_count} {card.paper_count === 1 ? 'paper' : 'papers'}
            </span>
          </div>
        </div>

        {/* Botanical Species Name */}
        <h3 className="card-species-name">{card.plant_name}</h3>

        {/* Extract types if any */}
        {card.extract_types && card.extract_types.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.4rem 0 0.85rem' }}>
            {card.extract_types.map((ext) => (
              <span
                key={ext}
                style={{
                  fontSize: '0.73rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {ext}
              </span>
            ))}
          </div>
        )}

        {/* Bioactivities */}
        <div className="bioactivity-tags-container">
          {card.bioactivities.map((bio) => (
            <span key={bio} className={`bio-tag ${getTagClass(bio)}`}>
              {bio}
            </span>
          ))}
        </div>

        {/* Active Phytochemicals Box */}
        {card.bioactive_compounds.length > 0 && (
          <div id="tour-results-phytochemistry" className="compounds-section">
            <div className="compounds-title">
              <FlaskConical size={12} style={{ color: '#34d399' }} />
              Active Phytochemicals ({card.bioactive_compounds.length})
            </div>
            <div className="compound-pills-list">
              {visibleCompounds.map((comp) => (
                <span key={comp} className="compound-pill">
                  {comp}
                </span>
              ))}
              {hasExtraCompounds && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllCompounds(!showAllCompounds);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#34d399',
                    fontSize: '0.73rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0.2rem 0.4rem',
                  }}
                >
                  {showAllCompounds ? 'Show less' : `+${card.bioactive_compounds.length - 5} more`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Area: Visual Confidence Gauge & Detail Button */}
      <div className="card-footer" style={{ marginTop: '0.75rem' }}>
        <div id="tour-confidence-gauge">
          <ConfidenceGauge score={card.confidence_score} size={38} strokeWidth={3.5} showLabel={true} />
        </div>

        <button
          id="tour-view-papers"
          type="button"
          className="view-evidence-btn"
          onClick={() => onSelect(card)}
        >
          <span>View Papers</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

