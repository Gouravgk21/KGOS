import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useSearch';
import { useAppStore } from '../../store/useAppStore';

export default function SearchPalette() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const results = useGlobalSearch(query) || [];
  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  // Handle escape & keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  const handleSelect = (item) => {
    setSearchOpen(false);
    setQuery('');
    // Navigate using browser location
    window.location.href = item.path;
  };

  if (!searchOpen) return null;

  return (
    <div 
      className="search-overlay" 
      ref={overlayRef} 
      onClick={(e) => e.target === overlayRef.current && setSearchOpen(false)}
    >
      <div className="search-palette flex flex-col">
        <div className="search-input-wrapper flex items-center px-4 py-3 border-b border-glass">
          <Search className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="search-input bg-transparent w-full text-base border-none outline-none text-primary"
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
                className={`search-result px-5 py-3 clickable flex justify-between items-center ${
                  index === selectedIndex ? 'bg-card-hover' : ''
                }`}
                style={index === selectedIndex ? { backgroundColor: 'var(--bg-card-hover)' } : undefined}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div>
                  <div className="font-medium text-sm text-primary">{item.title}</div>
                  <div className="text-xs text-secondary mt-0.5">{item.subtitle}</div>
                </div>
                <span className="badge badge-neutral text-xxs font-mono uppercase tracking-wider">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        ) : query.trim() !== '' ? (
          <div className="p-8 text-center text-sm text-secondary">
            No matching results found for "{query}"
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-secondary">
            Type something to search globally...
          </div>
        )}
      </div>
    </div>
  );
}
