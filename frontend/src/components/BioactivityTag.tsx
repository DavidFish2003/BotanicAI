import React from 'react';
import { Activity, ShieldAlert, Heart, Brain, Flame, Sparkles } from 'lucide-react';

interface BioactivityTagProps {
  activity: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const BioactivityTag: React.FC<BioactivityTagProps> = ({ activity, onClick, isActive }) => {
  const getIcon = (act: string) => {
    const l = act.toLowerCase();
    if (l.includes('antioxidant')) return <Sparkles size={12} />;
    if (l.includes('anti-inflammatory') || l.includes('inflammation')) return <Flame size={12} />;
    if (l.includes('neuroprotective') || l.includes('anxiolytic') || l.includes('memory')) return <Brain size={12} />;
    if (l.includes('antimicrobial') || l.includes('antibacterial') || l.includes('antiviral')) return <ShieldAlert size={12} />;
    if (l.includes('cardioprotective')) return <Heart size={12} />;
    return <Activity size={12} />;
  };

  return (
    <span
      className={`bioactivity-pill ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
      }}
    >
      {getIcon(activity)}
      <span>{activity}</span>
    </span>
  );
};
