import React from 'react';
import { ConfidenceGauge } from './ConfidenceGauge';

interface ConfidenceMeterProps {
  score: number;
  showLabel?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score, showLabel = true }) => {
  return <ConfidenceGauge score={score} showLabel={showLabel} />;
};

