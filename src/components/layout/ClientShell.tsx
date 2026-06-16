'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import CommandPalette from '../ui/CommandPalette';
import AIBar from '../ui/AIBar';
import QuickActions from '../widgets/QuickActions';
import { seedDatabase } from '@/db/seed';
import { useAppStore } from '@/store/useAppStore';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  // Seed database on mount
  useEffect(() => {
    seedDatabase().catch((err) => console.error('Seeding error:', err));
  }, []);

  // ⌘K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { isLocked, setLocked } = useAppStore();

  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      {/* Lock Overlay Screen */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#021E26]/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center text-white p-6">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm">
            {/* Elegant Monogram Logo */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#D4A017] animate-pulse">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.3" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="currentColor" strokeWidth="0.75" transform="rotate(35 50 50)" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="currentColor" strokeWidth="0.75" transform="rotate(-35 50 50)" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="currentColor" strokeWidth="0.75" transform="rotate(90 50 50)" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="currentColor" strokeWidth="0.75" transform="rotate(0 50 50)" />
            </svg>
            
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-extrabold tracking-[0.22em] text-white font-serif uppercase">KGOS 2031</h2>
              <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase mt-0.5 block">
                Kumar Gourav
              </span>
              <span className="text-[8px] text-[#00B4D8] font-mono tracking-[0.2em] uppercase mt-0.5 block font-bold">
                Operating System Locked
              </span>
            </div>

            <img 
              src="/avatar_kumar.png" 
              alt="Kumar Gourav" 
              className="w-20 h-20 rounded-full border border-[#D4A017] object-cover bg-zinc-800 shadow-[0_0_12px_rgba(212,160,23,0.25)]"
            />

            <button 
              onClick={() => setLocked(false)}
              className="mt-2 px-6 py-2.5 bg-[#D4A017] hover:bg-[#D4A017]/90 text-[#021E26] text-[10px] font-mono font-bold rounded-full transition-colors cursor-pointer shadow-md uppercase tracking-wider"
            >
              Unlock Console
            </button>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex flex-col h-full z-50">
        <Sidebar />
      </div>

      {/* Main Panel */}
      <div className="main-area flex-1 flex flex-col min-w-0 h-full relative">
        <Topbar onSearchOpen={() => setCmdOpen(true)} />
        
        {/* Scrollable content area */}
        {/* Add padding bottom to make room for AI Bar */}
        <div className="main-content flex-1 overflow-y-auto pb-[4rem] p-6 relative">
          {children}
        </div>
        
        {/* AI Dock */}
        <AIBar />
      </div>

      {/* Mobile Navigation - Mobile Only */}
      <div className="md:hidden z-50">
        <MobileNav />
      </div>

      {/* Floating UI Elements */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
