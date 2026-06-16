'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { Database, Plus, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function IngredientsDB() {
  const ingredients = useLiveQuery(() => db.ingredients.toArray()) || [];
  const [search, setSearch] = useState('');
  
  const filtered = ingredients.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-[#D4A017]" />
            <span className="font-mono text-sm text-[#D4A017] tracking-widest uppercase">KAFS Database</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Raw Materials Intel
          </h1>
        </div>
        <button className="btn-primary !bg-[#D4A017] hover:!bg-[#FBBF24]">
          <Plus className="w-4 h-4" /> Add Ingredient
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center bg-[rgba(15,23,42,0.5)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search raw materials..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A017] text-sm transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="card-elevated !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-500 uppercase font-mono bg-zinc-900/50 border-b border-[rgba(255,255,255,0.05)]">
              <tr>
                <th className="px-6 py-4">Ingredient Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Cost (per kg)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ing => (
                <tr key={ing.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-bold text-white group-hover:text-[#D4A017]">{ing.name}</td>
                  <td className="px-6 py-4"><span className="badge bg-zinc-800 border border-zinc-700">{ing.category}</span></td>
                  <td className="px-6 py-4 text-zinc-400">{ing.type}</td>
                  <td className="px-6 py-4 text-right font-mono text-[#D4A017]">{formatCurrency(ing.costPerKg)}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-success">Approved</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No ingredients found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
