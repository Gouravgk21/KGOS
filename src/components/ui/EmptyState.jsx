import React from 'react';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon text-muted" />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && onAction && (
        <Button variant="secondary" onClick={onAction} className="mt-4">
          {action}
        </Button>
      )}
    </div>
  );
}
