'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Compass, BookOpen, Brain, Briefcase, FileText,
  FlaskConical, Target, DollarSign, Calendar, FilePlus
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Command Center',       icon: Compass,     href: '/',                      section: 'Navigation'    },
  { id: 'business',   label: 'Business OS',           icon: Briefcase,   href: '/business',              section: 'Navigation'    },
  { id: 'leads',      label: 'CRM Leads',             icon: Target,      href: '/business/crm/leads',    section: 'Navigation'    },
  { id: 'kafs',       label: 'Formulation Lab',       icon: FlaskConical,href: '/formulation-lab',       section: 'Navigation'    },
  { id: 'research',   label: 'Research OS',           icon: BookOpen,    href: '/research',              section: 'Navigation'    },
  { id: 'exams',      label: 'Exam OS',               icon: Brain,       href: '/exams',                 section: 'Navigation'    },
  { id: 'brand',      label: 'Brand OS',              icon: FileText,    href: '/brand/linkedin',        section: 'Navigation'    },
  { id: 'health',     label: 'Health OS',             icon: Target,      href: '/self-mastery/health',   section: 'Navigation'    },
  { id: 'finance',    label: 'Finance OS',            icon: DollarSign,  href: '/wealth',                section: 'Navigation'    },
  { id: 'new-lead',   label: 'Create New Lead',       icon: FilePlus,    href: '/business/crm/leads',    section: 'Quick Actions' },
  { id: 'new-note',   label: 'Add Knowledge Note',    icon: FilePlus,    href: '/knowledge-os/notes',    section: 'Quick Actions' },
  { id: 'new-paper',  label: 'Log Research Paper',    icon: FilePlus,    href: '/research',              section: 'Quick Actions' },
  { id: 'log-health', label: 'Daily Health Check-in', icon: Calendar,    href: '/self-mastery/health',   section: 'Quick Actions' },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

/**
 * Fuzzy match: checks if all characters of `query` appear in order in `str`.
 * Fast-paths through substring check first.
 */
function fuzzyMatch(str: string, query: string): boolean {
  if (!query) return true;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  // Fast path: exact substring
  if (s.includes(q)) return true;
  // Fuzzy: all chars of query appear in order
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const filteredItems: NavItem[] = useMemo(
    () => NAV_ITEMS.filter((item) => fuzzyMatch(item.label, query)),
    [query]
  );

  // Reset and focus when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  const navigateTo = useCallback(
    (item: NavItem) => {
      router.push(item.href);
      onClose();
    },
    [router, onClose]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            (prev - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1)
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            navigateTo(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigateTo, onClose]);

  if (!isOpen) return null;

  const activeDescendantId =
    filteredItems.length > 0 ? `cmd-item-${filteredItems[selectedIndex]?.id}` : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl mx-4 bg-[#0F172A] border border-[rgba(0,180,216,0.2)] rounded-xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[rgba(0,180,216,0.1)]">
          <Search className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            role="combobox"
            aria-expanded={filteredItems.length > 0}
            aria-controls="command-palette-listbox"
            aria-activedescendant={activeDescendantId}
            aria-autocomplete="list"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 font-sans text-lg"
            placeholder="Search commands, navigate, or ask AI..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd
            className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 font-mono border border-zinc-700"
            aria-label="Press Escape to close"
          >
            ESC
          </kbd>
        </div>

        {/* Live region for result count announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {query
            ? `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${query}"`
            : `${filteredItems.length} commands available`}
        </div>

        {/* Results */}
        <div
          ref={listboxRef}
          id="command-palette-listbox"
          role="listbox"
          aria-label="Commands"
          className="max-h-[60vh] overflow-y-auto p-2"
        >
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500" role="status">
              No results found for &ldquo;{query}&rdquo;.
              <br />
              Press Enter to ask ORACLE Agent.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.id}
                    id={`cmd-item-${item.id}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-[rgba(0,109,119,0.3)] border border-[rgba(0,180,216,0.3)]'
                        : 'hover:bg-zinc-800/50 border border-transparent'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => navigateTo(item)}
                    tabIndex={-1}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${isSelected ? 'text-[#00B4D8]' : 'text-zinc-400'}`}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}
                      >
                        {item.label}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">{item.section}</span>
                    </div>
                    {isSelected && (
                      <kbd
                        className="ml-auto px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono border border-zinc-700 text-zinc-400 flex-shrink-0"
                        aria-hidden="true"
                      >
                        ↵
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[rgba(0,180,216,0.08)] flex items-center gap-4 text-[10px] font-mono text-zinc-600">
          <span><kbd aria-hidden="true">↑↓</kbd> navigate</span>
          <span><kbd aria-hidden="true">↵</kbd> select</span>
          <span><kbd aria-hidden="true">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
