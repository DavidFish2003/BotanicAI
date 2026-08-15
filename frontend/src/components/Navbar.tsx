import React from 'react';
import { Sprout, Activity, Database, Sparkles } from 'lucide-react';
import type { HealthResponse } from '../types';

interface NavbarProps {
  health: HealthResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({ health }) => {
  return (
    <header className="header-bar">
      <a href="/" className="brand-logo">
        <div className="brand-icon-wrapper">
          <Sprout size={24} style={{ color: 'var(--accent-mint)' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className="brand-title">BotanicAI</h1>
            <span className="brand-badge">Pharmacology Engine</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
            AI-Powered Botanical Literature & Phytochemistry Miner
          </p>
        </div>
      </a>

      <div className="header-status">
        <div className="status-pill" title="Live PubMed & OpenAlex Literature Miners">
          <span className="status-indicator" />
          <Activity size={13} />
          <span>Literature APIs Online</span>
        </div>

        <div className="status-pill" title={health?.redis_connected ? 'Redis Cache Connected' : 'In-Memory TTL Cache'}>
          <Database size={13} style={{ color: health?.redis_connected ? 'var(--accent-mint)' : 'var(--accent-amber)' }} />
          <span>{health?.cache_type || 'Active Cache'}</span>
        </div>

        <div className="status-pill" title="AI Entity & Phytochemical Extraction Pipeline">
          <Sparkles size={13} style={{ color: 'var(--accent-mint)' }} />
          <span>LLM / NLP Active</span>
        </div>
      </div>
    </header>
  );
};
