'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/store/useAppStore';

export default function SearchPalette() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const results = useGlobalSearch(query) || [];
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  // Handle escape & keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchOpen) return;

      if (e.key === 'Escape') {
        setSearchOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, results, selectedIndex]);

  const handleSelect = (item: any) => {
    setSearchOpen(false);
    setQuery('');
    window.location.href = item.path;
  };

  if (!searchOpen) return null;

  return (
    <div 
      className="search-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[15vh]" 
      ref={overlayRef} 
      onClick={(e) => e.target === overlayRef.current && setSearchOpen(false)}
    >
      <div className="search-palette w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        <div className="search-input-wrapper flex items-center px-4 py-3 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="search-input bg-transparent w-full text-sm border-none outline-none text-zinc-200 placeholder-zinc-500"
            placeholder="Search tasks, leads, projects, goals..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        {results.length > 0 ? (
          <div className="search-results overflow-y-auto max-h-80 py-2">
            {results.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`search-result px-4 py-2.5 cursor-pointer flex justify-between items-center transition-colors ${
                  index === selectedIndex ? 'bg-zinc-800' : 'hover:bg-zinc-850'
                }`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div>
                  <div className="font-medium text-sm text-zinc-200">{item.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</div>
                </div>
                <span className="badge bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 font-mono px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        ) : query.trim() !== '' ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No matching results found for "{query}"
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-zinc-500">
            Type something to search globally...
          </div>
        )}
      </div>
    </div>
  );
}
