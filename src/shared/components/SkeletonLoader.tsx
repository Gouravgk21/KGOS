import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width = 'w-full', height = 'h-4' }: SkeletonProps) {
  return <div className={`skeleton ${width} ${height} ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="card flex flex-col gap-3" aria-busy="true" aria-label="Loading...">
      <Skeleton height="h-3" width="w-1/3" />
      <Skeleton height="h-8" width="w-2/3" />
      <Skeleton height="h-3" width="w-full" />
      <Skeleton height="h-3" width="w-4/5" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="metric-card flex flex-col gap-2" aria-busy="true">
      <Skeleton height="h-3" width="w-1/2" />
      <Skeleton height="h-8" width="w-2/3" />
      <Skeleton height="h-2" width="w-1/3" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height="h-4" />
        </td>
      ))}
    </tr>
  );
}
