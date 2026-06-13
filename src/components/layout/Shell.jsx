import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import SearchPalette from '../ui/SearchPalette';
import QuickActions from '../widgets/QuickActions';
import { seedDatabase } from '../../db/seed';

export default function Shell() {
  // Seed database on mount
  useEffect(() => {
    seedDatabase().catch((err) => console.error('Seeding error:', err));
  }, []);

  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex flex-col">
        <Sidebar />
      </div>

      {/* Main Panel */}
      <div className="main-area flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        
        {/* Scrollable content area */}
        <div className="main-content flex-1 overflow-y-auto pb-20 md:pb-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile Navigation - Mobile Only */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Floating UI Elements */}
      <QuickActions />
      <SearchPalette />
    </div>
  );
}
