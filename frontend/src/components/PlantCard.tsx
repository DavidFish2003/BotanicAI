import React, { useState } from 'react';
import type { PlantCardData } from '../types';
import { Leaf, FlaskConical, FileText, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';

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
        {/* Top Header: Tissue Badge & Confidence */}
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

        {/* Bioactive Compounds Box */}
        {card.bioactive_compounds.length > 0 && (
          <div className="compounds-section">
            <div className="compounds-title">
              <FlaskConical size={12} style={{ color: '#34d399' }} />
              Extracted Phytochemicals ({card.bioactive_compounds.length})
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

      {/* Footer Area: Confidence Meter & Detail Button */}
      <div>
        <div className="confidence-meter" title={`Pharmacological Extraction Confidence: ${(card.confidence_score * 100).toFixed(0)}%`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            <span>Confidence</span>
          </div>
          <div className="meter-track">
            <div
              className="meter-fill"
              style={{ width: `${Math.round(card.confidence_score * 100)}%` }}
            />
          </div>
          <span className="meter-text">{(card.confidence_score * 100).toFixed(0)}%</span>
        </div>

        <div className="card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
            <Sparkles size={12} style={{ color: '#10b981' }} />
            <span>LLM Structured Extraction</span>
          </div>

          <button
            type="button"
            className="view-evidence-btn"
            onClick={() => onSelect(card)}
          >
            <span>View Papers</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
