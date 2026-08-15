import React, { useEffect } from 'react';
import type { PlantCardData } from '../types';
import { SourceBadge } from './SourceBadge';
import { X, Leaf, FlaskConical, BookOpen, Download, ShieldCheck, Activity, Calendar } from 'lucide-react';

interface DetailModalProps {
  card: PlantCardData | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ card, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(card, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${card.plant_name}_${card.plant_part}_pharmacology.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="card-tissue-badge">
                <Leaf size={12} />
                {card.plant_part}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#34d399' }}>
                <ShieldCheck size={14} />
                <span>{(card.confidence_score * 100).toFixed(0)}% Confidence</span>
              </div>
            </div>
            <h2 style={{ fontSize: '1.7rem', color: '#fff', fontStyle: 'italic' }}>
              {card.plant_name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Pharmacological profile supported by {card.paper_count} peer-reviewed scientific {card.paper_count === 1 ? 'publication' : 'publications'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleExportJSON}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                color: '#6ee7b7',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Download structured pharmacological data as JSON"
            >
              <Download size={14} />
              Export JSON
            </button>

            <button type="button" className="modal-close-btn" onClick={onClose} title="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Aggregated Overview */}
          <div style={{ background: 'rgba(10, 24, 16, 0.7)', border: '1px solid rgba(52, 211, 153, 0.15)', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={15} style={{ color: '#10b981' }} /> Pharmacological Summary
            </h4>
            
            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Reported Bioactivities:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {card.bioactivities.map((bio) => (
                  <span key={bio} className="bio-tag" style={{ fontSize: '0.8rem' }}>
                    {bio}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Extracted Phytochemical Compounds:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {card.bioactive_compounds.map((comp) => (
                  <span key={comp} className="compound-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                    <FlaskConical size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Paper List */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} style={{ color: '#10b981' }} /> Supporting Scientific Publications ({card.papers.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {card.papers.map((item, idx) => (
                <div key={item.paper.id || idx} className="paper-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <SourceBadge
                      source={item.paper.source}
                      doi={item.paper.doi}
                      url={item.paper.url}
                      isPeerReviewed={item.paper.is_peer_reviewed}
                    />
                    {item.paper.year && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {item.paper.year}
                      </span>
                    )}
                  </div>

                  <h4 className="paper-title">{item.paper.title}</h4>

                  {item.paper.journal && (
                    <div style={{ fontSize: '0.82rem', color: '#34d399', fontStyle: 'italic' }}>
                      {item.paper.journal}
                    </div>
                  )}

                  {item.paper.authors && item.paper.authors.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Authors: {item.paper.authors.join(', ')}
                    </div>
                  )}

                  {/* Extraction notes for this paper */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {item.extraction.extract_type && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.1)', color: '#a7f3d0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Extract: {item.extraction.extract_type}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Confidence: {(item.extraction.confidence_score * 100).toFixed(0)}% ({item.extraction.extraction_method})
                    </span>
                  </div>

                  {/* Abstract */}
                  <div className="paper-abstract">
                    <p>{item.paper.abstract}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
