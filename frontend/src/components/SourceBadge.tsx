import React from 'react';
import { ExternalLink, CheckCircle2, BookOpen, Database } from 'lucide-react';

interface SourceBadgeProps {
  source: string;
  doi?: string | null;
  url?: string | null;
  isPeerReviewed?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, doi, url, isPeerReviewed = true }) => {
  const isPubMed = source.toLowerCase().includes('pubmed');
  const targetUrl = url || (doi ? `https://doi.org/${doi}` : null);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <span className={`source-badge ${isPubMed ? 'pubmed' : 'openalex'}`}>
        {isPubMed ? <BookOpen size={12} /> : <Database size={12} />}
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
