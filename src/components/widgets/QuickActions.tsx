'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckSquare, Sparkles, UserPlus, Heart } from 'lucide-react';

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions = [
    { label: 'Add Task', icon: CheckSquare, path: '/execution?action=add-task' },
    { label: 'Add Lead', icon: UserPlus, path: '/business/crm?action=add-lead' },
    { label: 'Log Health', icon: Heart, path: '/self-mastery/health?action=log-health' },
    { label: 'Add Goal', icon: Sparkles, path: '/life-plan?action=add-goal' }
  ];

  const handleAction = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="quick-actions fixed bottom-20 md:bottom-6 right-6 z-[1000]">
      {isOpen && (
        <div 
          className="quick-actions-menu flex flex-col gap-1 mb-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-2xl"
        >
          {actions.map((act) => (
            <button
              key={act.label}
              className="quick-action-item flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              onClick={() => handleAction(act.path)}
            >
              <act.icon className="w-4 h-4 text-blue-500" />
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
      <button 
        className="quick-actions-trigger flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 border-none transition-transform active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
