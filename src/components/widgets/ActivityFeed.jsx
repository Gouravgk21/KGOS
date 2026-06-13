import React from 'react';
import Card from '../ui/Card';

export default function ActivityFeed({ items = [], maxItems = 5 }) {
  const visibleItems = items.slice(0, maxItems);

  if (visibleItems.length === 0) {
    return (
      <Card header={<span className="card-title">Recent Activity</span>}>
        <p className="text-sm text-secondary">No recent activity logged yet.</p>
      </Card>
    );
  }

  return (
    <Card header={<span className="card-title">Recent Activity</span>}>
      <div className="activity-feed">
        {visibleItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div className="activity-item" key={item.id || idx}>
              <div 
                className="activity-dot flex items-center justify-center" 
                style={{ 
                  backgroundColor: item.colorDim || 'rgba(59, 130, 246, 0.15)',
                  color: item.color || '#3b82f6',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  flexShrink: 0
                }}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
              </div>
              <div className="activity-content ml-3 flex-1">
                <p className="activity-text text-sm">{item.text}</p>
                <span className="activity-time text-xs text-muted block mt-0.5">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
