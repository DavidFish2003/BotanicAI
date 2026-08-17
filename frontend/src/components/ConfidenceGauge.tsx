import React from 'react';

interface ConfidenceGaugeProps {
  score: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  score,
  size = 42,
  strokeWidth = 4,
  showLabel = true,
}) => {
  const percentage = Math.round(Math.min(Math.max(score, 0), 1) * 100);

  // Representative color scheme
  let color = '#10b981'; // Emerald for High
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let labelText = 'High';

  if (percentage < 60) {
    color = '#f43f5e'; // Rose for Lower
    glowColor = 'rgba(244, 63, 94, 0.4)';
    labelText = 'Low';
  } else if (percentage < 80) {
    color = '#f59e0b'; // Amber for Moderate
    glowColor = 'rgba(245, 158, 11, 0.4)';
    labelText = 'Moderate';
  }

  const radius = (size - strokeWidth * 2) / 2;
  // Circumference for 240-degree arc or full 360 circle
  const circumference = 2 * Math.PI * radius;
  // Calculate stroke dash offset
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="confidence-gauge-wrapper"
      title={`Evidence Confidence: ${percentage}% (${labelText})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active progress arc with glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
              filter: `drop-shadow(0 0 4px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: `${Math.max(size * 0.28, 9)}px`,
            fontWeight: 700,
            color: '#f8fafc',
            userSelect: 'none',
          }}
        >
          {percentage}%
        </div>
      </div>

      {showLabel && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Confidence
          </span>
          <span style={{ fontSize: '0.76rem', color: color, fontWeight: 700 }}>
            {labelText}
          </span>
        </div>
      )}
    </div>
  );
};
