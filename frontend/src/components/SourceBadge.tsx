import React from 'react';
import { ExternalLink, CheckCircle2, BookOpen, Database, Globe } from 'lucide-react';

interface SourceBadgeProps {
  source: string;
  doi?: string | null;
  url?: string | null;
  isPeerReviewed?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, doi, url, isPeerReviewed = true }) => {
  const srcLower = source.toLowerCase();
  const isPubMed = srcLower.includes('pubmed');
  const isEuropePMC = srcLower.includes('europe pmc') || srcLower.includes('epmc');
  const targetUrl = url || (doi ? `https://doi.org/${doi}` : null);

  const getSourceClass = () => {
    if (isPubMed) return 'pubmed';
    if (isEuropePMC) return 'europepmc';
    return 'openalex';
  };

  const getSourceIcon = () => {
    if (isPubMed) return <BookOpen size={12} />;
    if (isEuropePMC) return <Globe size={12} />;
    return <Database size={12} />;
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <span className={`source-badge ${getSourceClass()}`}>
        {getSourceIcon()}
        {source}
      </span>

      {isPeerReviewed && (
        <span className="source-badge verified" title="Peer-reviewed scholarly article">
          <CheckCircle2 size={12} />
          Peer-Reviewed
        </span>
      )}

      {targetUrl && (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.75rem',
            textDecoration: 'none',
            opacity: 0.85,
            transition: 'opacity 0.2s',
          }}
          title={`Open external paper ${doi ? `DOI: ${doi}` : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {doi ? `doi:${doi.slice(0, 15)}...` : 'View Paper'}
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
};
