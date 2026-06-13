import React from 'react';
import Card from '../ui/Card';
import { type LucideIcon } from 'lucide-react';

export interface ActivityItem {
  id?: number | string;
  text: string;
  time: string;
  icon?: LucideIcon;
  color?: string;
  colorDim?: string;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ items = [], maxItems = 5 }: ActivityFeedProps) {
  const visibleItems = items.slice(0, maxItems);

  if (visibleItems.length === 0) {
    return (
      <Card header={<span className="card-title">Recent Activity</span>}>
        <p className="text-sm text-zinc-500">No recent activity logged yet.</p>
      </Card>
    );
  }

  return (
    <Card header={<span className="card-title">Recent Activity</span>}>
      <div className="activity-feed flex flex-col gap-4">
        {visibleItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div className="activity-item flex items-start" key={item.id || idx}>
              <div 
                className="activity-dot flex items-center justify-center flex-shrink-0" 
                style={{ 
                  backgroundColor: item.colorDim || 'rgba(59, 130, 246, 0.15)',
                  color: item.color || '#3b82f6',
                  width: 28,
                  height: 28,
                  borderRadius: '50%'
                }}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
              </div>
              <div className="activity-content ml-3 flex-1">
                <p className="activity-text text-sm text-zinc-300">{item.text}</p>
                <span className="activity-time text-xs text-zinc-500 block mt-0.5">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
