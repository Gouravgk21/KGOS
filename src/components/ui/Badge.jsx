import React from 'react';

export default function Badge({ children, variant = 'neutral', dot = false, dotColor, className = '' }) {
  const variantClass = `badge-${variant}`;
  const badgeClass = `badge ${variantClass} ${className}`.trim();

  return (
    <span className={badgeClass}>
      {dot && (
        <span 
          className="status-dot animate-pulse" 
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        />
      )}
      {children}
    </span>
  );
}
