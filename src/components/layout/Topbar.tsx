'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface TopbarProps {
  onSearchOpen?: () => void;
}

const ROUTE_NAMES: Record<string, string> = {
  'business': 'Business',
  'crm': 'CRM',
  'leads': 'Leads',
  'contacts': 'Contacts',
  'companies': 'Companies',
  'meetings': 'Meetings',
  'quotations': 'Quotations',
  'sales': 'Sales',
  'forecast': 'Forecast',
  'kafs': 'KAFS',
  'hydrocolloids': 'Hydrocolloids',
  'ingredients': 'Ingredients',
  'manufacturing': 'Manufacturing',
  'patents': 'Patents',
  'research': 'Research',
  'papers': 'Papers',
  'phd': 'PhD Tracker',
  'projects': 'Projects',
  'exams': 'Exams',
  'study-planner': 'Study Planner',
  'mock-tests': 'Mock Tests',
  'topics': 'Topics',
  'brand': 'Brand',
  'linkedin': 'LinkedIn',
  'content-calendar': 'Content Calendar',
  'analytics': 'Analytics',
  'self-mastery': 'Self Mastery',
  'health': 'Health OS',
  'habits': 'Habits',
  'wealth': 'Finance OS',
  'budget': 'Budget',
  'transactions': 'Transactions',
  'knowledge': 'Knowledge Graph',
  'knowledge-os': 'Knowledge OS',
  'notes': 'Notes',
  'books': 'Books',
  'ideas': 'Ideas',
  'relationships': 'Relationships',
  'document-intel': 'Documents',
  'settings': 'Automation',
  'ai-board': 'AI Agents',
  'executive': 'Executive',
  'reporting': 'Reporting',
  'formulation-lab': 'Formulation Lab',
};

const formatPathname = (path: string): string => {
  if (path === '/') return 'Command Center';
  return path
    .split('/')
    .filter(Boolean)
    .map(seg => ROUTE_NAMES[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '))
    .join(' › ');
};

export default function Topbar({ onSearchOpen }: TopbarProps) {
  const pathname = usePathname();
  const notifications = useAppStore((state) => state.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="topbar w-full" role="banner">
      {/* Left Section: Breadcrumbs */}
      <div className="flex-1 flex items-center">
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex text-sm font-mono text-zinc-500 uppercase tracking-widest"
        >
          {formatPathname(pathname)}
        </nav>
      </div>

      {/* Center Section: Global Search */}
      <div className="flex-1 max-w-lg flex justify-center">
        <button
          onClick={onSearchOpen}
          aria-label="Open command palette (⌘K)"
          aria-keyshortcuts="Meta+K"
          className="w-full flex items-center bg-[rgba(15,23,42,0.8)] border border-[rgba(0,180,216,0.15)] rounded-full px-4 py-1.5 text-sm text-zinc-400 hover:border-[#00B4D8] hover:bg-zinc-800 transition-all group"
        >
          <Search className="w-4 h-4 mr-2 text-zinc-500 group-hover:text-[#00B4D8] transition-colors" aria-hidden="true" />
          <span className="flex-1 text-left">Search KGOS...</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono border border-zinc-700" aria-hidden="true">⌘K</span>
        </button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {/* Quick Add Button */}
        <button
          onClick={onSearchOpen}
          aria-label="Quick add — open command palette"
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(0,180,216,0.1)] text-[#00B4D8] hover:bg-[rgba(0,180,216,0.2)] transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] border-2 border-[#0B1220]"
              aria-hidden="true"
            />
          )}
        </button>

        {/* AI Status */}
        <div
          role="status"
          aria-label="System status: active"
          className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(22,163,74,0.1)] border border-[rgba(22,163,74,0.2)]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-mono text-[#4ADE80] uppercase tracking-wider font-bold">SYSTEM ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
