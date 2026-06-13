'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Topbar() {
  const { setSearchOpen } = useAppStore();
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (pathname === '/') return <span className="text-zinc-400">Dashboard</span>;
    const segments = pathname.split('/').filter(Boolean);
    return (
      <span className="flex items-center gap-1 text-sm text-zinc-500">
        <span className="capitalize text-zinc-500">KGOS</span>
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            <span className="mx-1 text-zinc-600">/</span>
            <span className="capitalize font-semibold text-zinc-200">{seg.replace(/-/g, ' ')}</span>
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="topbar h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6">
      <div className="topbar-left flex items-center">
        <div className="topbar-breadcrumb">
          {getBreadcrumbs()}
        </div>
      </div>
      
      <div className="topbar-right flex items-center gap-4">
        <div className="topbar-date hidden md:block text-xs text-zinc-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        
        <button 
          className="topbar-search-trigger flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all gap-2" 
          onClick={() => setSearchOpen(true)}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search everything...</span>
          <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400 border border-zinc-700">⌘K</kbd>
        </button>

        <button className="topbar-btn relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>
      </div>
    </div>
  );
}
