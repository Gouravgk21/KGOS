'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, FlaskConical, BookOpen, Brain,
  Heart, DollarSign, Users, Settings, Crown, MoreHorizontal, X
} from 'lucide-react';

const PRIMARY_TABS = [
  { name: 'Home',     href: '/',                    icon: LayoutDashboard },
  { name: 'Business', href: '/business/crm/leads',  icon: Briefcase },
  { name: 'KAFS',     href: '/kafs',                icon: FlaskConical },
  { name: 'Research', href: '/research',            icon: BookOpen },
  { name: 'More',     href: null,                   icon: MoreHorizontal },
] as const;

const MORE_LINKS = [
  { name: 'Executive',  href: '/executive',              icon: Crown },
  { name: 'Exams',      href: '/exams',                  icon: Brain },
  { name: 'Health',     href: '/self-mastery/health',    icon: Heart },
  { name: 'Finance',    href: '/wealth',                 icon: DollarSign },
  { name: 'Network',    href: '/relationships',          icon: Users },
  { name: 'AI Agents',  href: '/ai-board',               icon: Crown },
  { name: 'Settings',   href: '/settings',               icon: Settings },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* More Menu Sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="More navigation options"
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-[var(--bg-elevated)] border-t border-[var(--border-accent)] rounded-t-2xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">
                All Modules
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(0,180,216,0.08)] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(0,180,216,0.15)] transition-colors"
                aria-label="Close more menu"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MORE_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  ((link.href as string) !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-[10px] transition-all ${
                      isActive
                        ? 'bg-[rgba(0,180,216,0.15)] text-[#00B4D8]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-[10px] font-mono font-medium text-center leading-tight">
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[80] bg-[rgba(11,18,32,0.97)] backdrop-blur-md border-t border-[var(--border-subtle)] flex items-stretch md:hidden"
        aria-label="Primary navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isMore = tab.href === null;
          const isActive =
            !isMore &&
            tab.href !== null &&
            (pathname === tab.href ||
              (tab.href !== '/' && pathname.startsWith(tab.href)));

          if (isMore) {
            return (
              <button
                key="more"
                onClick={() => setMoreOpen(true)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-2 transition-colors ${
                  moreOpen
                    ? 'text-[#00B4D8]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                aria-label="More navigation options"
                aria-expanded={moreOpen}
                aria-haspopup="dialog"
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                  {tab.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.name}
              href={tab.href!}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-2 transition-colors relative ${
                isActive
                  ? 'text-[#00B4D8]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.name}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#00B4D8]"
                  aria-hidden="true"
                />
              )}
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
