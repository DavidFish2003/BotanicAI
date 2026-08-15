import React from 'react';
import { Sparkles } from 'lucide-react';

interface ConfidenceMeterProps {
  score: number;
  showLabel?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score, showLabel = true }) => {
  const percentage = Math.round(score * 100);
  
  let confClass = 'conf-high';
  let label = 'High Confidence';
  if (percentage < 70) {
    confClass = 'conf-low';
    label = 'Moderate';
  } else if (percentage < 85) {
    confClass = 'conf-med';
    label = 'Good Confidence';
  }

  return (
    <div className={`confidence-meter ${confClass}`} title={`LLM/NLP Extraction Confidence: ${percentage}%`}>
      <Sparkles size={12} />
      <span>{percentage}%</span>
      {showLabel && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{label}</span>}
    </div>
  );
};
