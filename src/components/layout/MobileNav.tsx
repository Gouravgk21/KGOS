'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, Heart, UserPlus, FolderKanban } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/business/crm', label: 'CRM', icon: UserPlus },
    { path: '/self-mastery/health', label: 'Health', icon: Heart },
    { path: '/execution', label: 'Execution', icon: Zap }
  ];

  return (
    <div className="mobile-nav fixed bottom-0 left-0 right-0 h-[60px] bg-zinc-950 border-t border-zinc-800 flex z-[999] md:hidden">
      <div className="mobile-nav-items flex justify-between w-full h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`mobile-nav-item flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
                isActive ? 'text-blue-500 font-semibold' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
