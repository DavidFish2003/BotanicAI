import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '40%' }}>
          <div className="skeleton-shimmer" style={{ height: '36px', width: '80%' }} />
          <div className="skeleton-shimmer" style={{ height: '18px', width: '50%' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="skeleton-shimmer" style={{ height: '50px', width: '90px', borderRadius: '12px' }} />
          <div className="skeleton-shimmer" style={{ height: '50px', width: '90px', borderRadius: '12px' }} />
        </div>
      </div>

      <div className="skeleton-shimmer" style={{ height: '90px', width: '100%', borderRadius: '14px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
        <div className="skeleton-shimmer" style={{ height: '110px', width: '100%', borderRadius: '12px' }} />
        <div className="skeleton-shimmer" style={{ height: '110px', width: '100%', borderRadius: '12px' }} />
        <div className="skeleton-shimmer" style={{ height: '110px', width: '100%', borderRadius: '12px' }} />
      </div>
    </div>
  );
};
