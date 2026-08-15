import React from 'react';
import { Sprout, Sparkles, BookOpen, Layers, Dna } from 'lucide-react';
import type { SuggestedPlant } from '../types';

interface EmptyStateProps {
  suggestedPlants: SuggestedPlant[];
  onSelectPlant: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ suggestedPlants, onSelectPlant }) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '820px', margin: '0 auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
          border: '1px solid var(--border-focus)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <Sprout size={36} style={{ color: 'var(--accent-mint)' }} />
      </div>

      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
        Discover Botanical Pharmacology at Molecular Scale
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '36px', maxWidth: '640px', margin: '0 auto 36px auto' }}>
        Enter any medicinal plant, herb, or botanical binomial to query OpenAlex and PubMed literature, extract plant parts, bioactivities, and bioactive compound profiles with verified DOI badges.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          textAlign: 'left',
          marginBottom: '40px',
        }}
      >
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-mint)' }}>
            <Layers size={18} />
            <strong style={{ fontSize: '0.95rem' }}>1. Tissue-Specific Profiling</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Filter by Leaf, Root, Bark, Flower, Seed, Rhizome, or Essential oil extractions.
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
            <Dna size={18} />
            <strong style={{ fontSize: '0.95rem' }}>2. Phytochemical Mining</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Identifies active constituents (polyphenols, flavonoids, alkaloids, terpenes).
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-amber)' }}>
            <BookOpen size={18} />
            <strong style={{ fontSize: '0.95rem' }}>3. Verified DOI Badges</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Direct citations, PubMed PMIDs, OpenAlex records, and confidence metrics.
          </p>
        </div>
      </div>

      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
          Explore Popular Curated Botanical Queries:
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {suggestedPlants.map((plant) => (
            <button
              key={plant.query}
              type="button"
              className="quick-tag-btn"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              onClick={() => onSelectPlant(plant.query)}
            >
              <Sparkles size={13} style={{ color: 'var(--accent-mint)' }} />
              <strong>{plant.query}</strong>
              <span style={{ opacity: 0.65 }}>• {plant.common_name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
