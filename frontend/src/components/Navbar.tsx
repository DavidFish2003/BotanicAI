import React from 'react';
import { Sprout, Activity, Database, Sparkles } from 'lucide-react';
import type { HealthResponse } from '../types';
import { OnboardingTour } from './OnboardingTour';

interface NavbarProps {
  health?: HealthResponse | null;
  hasSearchResults?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ health: _health, hasSearchResults = false }) => {
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
        <div id="tour-db-sources" className="status-pill" title="Live Scientific Literature Databases Connected">
          <span className="status-indicator" />
          <Activity size={13} />
          <span>Literature Mining Online</span>
        </div>

        <div className="status-pill" title="Phytochemical Profiling Active">
          <Database size={13} style={{ color: 'var(--accent-mint)' }} />
          <span>Biochemistry Verified</span>
        </div>

        <div className="status-pill" title="Molecular Pharmacology Engine">
          <Sparkles size={13} style={{ color: 'var(--accent-mint)' }} />
          <span>Pharmacology Engine</span>
        </div>

        {/* Retrigger Tour Button */}
        <OnboardingTour hasSearchResults={hasSearchResults} />
      </div>
    </header>
  );
};
