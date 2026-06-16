'use client';

import React, { useState } from 'react';
import { Search, Network, Info, Zap, Link as LinkIcon, Database, Check, AlertTriangle, Target } from 'lucide-react';

const HYDROCOLLOIDS = [
  {
    id: 'kappa-carrageenan',
    name: 'Kappa Carrageenan',
    type: 'Seaweed Extract',
    gelType: 'Thermoreversible, brittle gel',
    synergies: ['Locust Bean Gum (LBG)', 'Konjac Glucomannan'],
    applications: ['Dairy', 'Meat', 'Water Jellies'],
    solubility: 'Hot water (>70°C)',
    phStability: 'pH 4.0 - 10.0',
    charge: 'Anionic',
    color: '#00B4D8'
  },
  {
    id: 'iota-carrageenan',
    name: 'Iota Carrageenan',
    type: 'Seaweed Extract',
    gelType: 'Thermoreversible, elastic gel',
    synergies: ['Starch'],
    applications: ['Dairy Desserts', 'Toothpaste', 'Beverages'],
    solubility: 'Hot water (>70°C)',
    phStability: 'pH 4.0 - 10.0',
    charge: 'Anionic',
    color: '#006D77'
  },
  {
    id: 'cmc',
    name: 'Carboxymethyl Cellulose (CMC)',
    type: 'Cellulose Derivative',
    gelType: 'Non-gelling, thickener',
    synergies: ['Guar Gum'],
    applications: ['Beverages', 'Bakery', 'Ice Cream'],
    solubility: 'Cold/Hot water',
    phStability: 'pH 3.0 - 10.0',
    charge: 'Anionic',
    color: '#8B5CF6'
  },
  {
    id: 'guar-gum',
    name: 'Guar Gum',
    type: 'Seed Gum',
    gelType: 'Non-gelling, thickener',
    synergies: ['Xanthan Gum', 'CMC'],
    applications: ['Sauces', 'Ice Cream', 'Bakery'],
    solubility: 'Cold water',
    phStability: 'pH 1.0 - 10.5',
    charge: 'Neutral',
    color: '#16A34A'
  },
  {
    id: 'xanthan-gum',
    name: 'Xanthan Gum',
    type: 'Microbial Exopolysaccharide',
    gelType: 'Highly pseudoplastic thickener',
    synergies: ['Guar Gum', 'Locust Bean Gum', 'Konjac'],
    applications: ['Dressings', 'Sauces', 'Beverages', 'Gluten-Free'],
    solubility: 'Cold water',
    phStability: 'pH 1.0 - 13.0',
    charge: 'Anionic',
    color: '#D4A017'
  },
  {
    id: 'lbg',
    name: 'Locust Bean Gum (LBG)',
    type: 'Seed Gum',
    gelType: 'Non-gelling alone; forms gel with Xanthan/Kappa',
    synergies: ['Kappa Carrageenan', 'Xanthan Gum'],
    applications: ['Ice Cream', 'Cream Cheese', 'Pet Food'],
    solubility: 'Hot water (>85°C)',
    phStability: 'pH 3.0 - 10.0',
    charge: 'Neutral',
    color: '#EC4899'
  },
];

export default function HydrocolloidsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(HYDROCOLLOIDS[0]);

  const filtered = HYDROCOLLOIDS.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-[rgba(0,180,216,0.1)] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-[#8B5CF6]" />
            <span className="font-mono text-sm text-[#8B5CF6] tracking-widest uppercase">Intelligence Center</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Hydrocolloid Database
          </h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar List */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search hydrocolloids..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6] transition-colors font-mono text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-2">
            {filtered.map(hydro => (
              <div 
                key={hydro.id}
                onClick={() => setSelected(hydro)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selected.id === hydro.id 
                    ? 'bg-[rgba(139,92,246,0.1)] border-[#8B5CF6]' 
                    : 'bg-[rgba(15,23,42,0.6)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="font-bold text-zinc-200">{hydro.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1">{hydro.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          {selected && (
            <div className="card-elevated flex flex-col gap-6 animate-slide-up">
              
              <div className="flex items-start justify-between border-b border-[rgba(255,255,255,0.05)] pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ color: selected.color }}>{selected.name}</h2>
                  <div className="flex gap-2">
                    <span className="badge border border-zinc-700 bg-zinc-800 text-zinc-300">{selected.type}</span>
                    <span className="badge border border-zinc-700 bg-zinc-800 text-zinc-300">{selected.charge}</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center opacity-20" style={{ backgroundColor: selected.color }}>
                  <Database className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Properties */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-zinc-400" /> Physical Properties
                  </h3>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-3">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Gel Type</div>
                      <div className="text-sm text-zinc-200">{selected.gelType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Solubility</div>
                      <div className="text-sm text-zinc-200">{selected.solubility}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">pH Stability</div>
                      <div className="text-sm text-zinc-200">{selected.phStability}</div>
                    </div>
                  </div>
                </div>

                {/* Synergies */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[#00B4D8]" /> Synergies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.synergies.map(syn => (
                      <div key={syn} className="px-3 py-1.5 bg-[rgba(0,180,216,0.1)] border border-[rgba(0,180,216,0.2)] rounded text-[#00B4D8] text-sm font-medium flex items-center gap-2">
                        <Zap className="w-3 h-3" /> {syn}
                      </div>
                    ))}
                    {selected.synergies.length === 0 && (
                      <div className="text-zinc-500 text-sm italic">No major reported synergies.</div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 mt-6">
                    <Target className="w-4 h-4 text-[#16A34A]" /> Applications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.applications.map(app => (
                      <div key={app} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 text-sm flex items-center gap-2">
                        <Check className="w-3 h-3 text-[#16A34A]" /> {app}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Formulation Warnings */}
              <div className="mt-4 p-4 rounded-lg bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)]">
                <h4 className="flex items-center gap-2 text-[#FBBF24] font-bold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" /> Formulation Notes
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Always pre-blend {selected.name} with dry ingredients (like sugar) at a 1:3 ratio before dispersing in liquid to prevent lumping. 
                  {selected.solubility.includes('Hot') ? ` Ensure temperature reaches required threshold (${selected.solubility.match(/\d+°C/)?.[0] || '80°C'}) for full hydration.` : ''}
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
