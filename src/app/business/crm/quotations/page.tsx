'use client';

import React from 'react';
import { FileText, Search, Plus, ExternalLink } from 'lucide-react';

export default function Quotations() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#D4A017]" />
            <span className="font-mono text-sm text-[#D4A017] tracking-widest uppercase">Commercial</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Quotations & Proposals
          </h1>
        </div>
        <button className="btn-primary !bg-[#D4A017] hover:!bg-[#FBBF24]">
          <Plus className="w-4 h-4" /> Create Quote
        </button>
      </div>

      <div className="card-elevated text-center py-20 flex flex-col items-center">
        <FileText className="w-16 h-16 text-[#D4A017] opacity-20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Quotations Found</h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-6">
          Create commercial proposals for your leads. Approved quotes automatically update pipeline forecasts.
        </p>
      </div>
    </div>
  );
}
