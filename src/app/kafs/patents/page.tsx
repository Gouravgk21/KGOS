'use client';

import React from 'react';
import { FileBadge, Search, Globe, AlertCircle } from 'lucide-react';

export default function PatentIntel() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileBadge className="w-5 h-5 text-[#EC4899]" />
            <span className="font-mono text-sm text-[#EC4899] tracking-widest uppercase">IP Strategy</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Patent Intelligence
          </h1>
        </div>
      </div>

      <div className="card-elevated text-center py-20 flex flex-col items-center">
        <Globe className="w-16 h-16 text-[#EC4899] opacity-20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Global IP Scanner Offline</h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-6">
          Connect to WIPO or Google Patents API to fetch live patent data. Currently tracking 4 white space opportunities locally.
        </p>
        <button className="btn-primary !bg-[#EC4899] hover:!bg-[#F472B6]">
          <Search className="w-4 h-4" /> Manual Search
        </button>
      </div>
    </div>
  );
}
