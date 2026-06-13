import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Sparkles, UserPlus, Heart } from 'lucide-react';

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Task', icon: CheckSquare, path: '/execution', state: { openAddTask: true } },
    { label: 'Add Lead', icon: UserPlus, path: '/business/crm', state: { openAddLead: true } },
    { label: 'Log Health', icon: Heart, path: '/self-mastery/health', state: { openLogHealth: true } },
    { label: 'Add Goal', icon: Sparkles, path: '/life-plan', state: { openAddGoal: true } }
  ];

  const handleAction = (act) => {
    setIsOpen(false);
    navigate(act.path, { state: act.state });
  };

  return (
    <div className="quick-actions relative" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {isOpen && (
        <div 
          className="quick-actions-menu flex flex-col gap-2 mb-3"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 8,
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {actions.map((act) => (
            <button
              key={act.label}
              className="quick-action-item flex items-center gap-3 w-full text-left"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                transition: 'background var(--transition-fast)'
              }}
              onClick={() => handleAction(act)}
            >
              <act.icon className="w-4 h-4 text-accent" />
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
      <button 
        className="quick-actions-trigger flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          color: 'white',
          boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          border: 'none',
          transition: 'transform var(--transition-fast)'
        }}
      >
        <Plus className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
