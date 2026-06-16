import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-icon" aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button className="btn-ghost mt-2" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
