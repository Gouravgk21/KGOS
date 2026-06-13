'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Radar, Sparkles, TrendingUp, Compass, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Opportunity {
  id: number;
  title: string;
  category: 'BUSINESS' | 'EXAM' | 'GRANT' | 'NETWORKING';
  roi: number; // 1-10
  alignment: number; // 1-10
  potentialValue?: number;
}

export default function OpportunityRadarPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    { id: 1, title: "Heritage Foods Formulations Supply Agreement", category: "BUSINESS", roi: 9, alignment: 10, potentialValue: 850000 },
    { id: 2, title: "FSSAI Junior Analyst Notification", category: "EXAM", roi: 7, alignment: 8 },
    { id: 3, title: "DBT Food Ingredients Research Grant 2026", category: "GRANT", roi: 8, alignment: 9, potentialValue: 1500000 }
  ]);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'BUSINESS' | 'EXAM' | 'GRANT' | 'NETWORKING'>('BUSINESS');
  const [newROI, setNewROI] = useState('8');
  const [newAlignment, setNewAlignment] = useState('9');
  const [newValue, setNewValue] = useState('500000');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const opp: Opportunity = {
      id: Date.now(),
      title: newName,
      category: newCategory,
      roi: parseInt(newROI) || 5,
      alignment: parseInt(newAlignment) || 5,
      potentialValue: newValue ? parseInt(newValue) : undefined
    };
    setOpportunities([opp, ...opportunities]);
    setNewName('');
    setIsAddOpen(false);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Radar className="w-6 h-6 text-emerald-500 animate-pulse" />
            Opportunity Radar
          </h1>
          <p className="text-sm text-zinc-400">Identify, score, and rank incoming B2B contracts, government exam vacancies, and academic grants by ROI and strategic value.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Opportunity
        </button>
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Opportunity</span>}>
          <form onSubmit={handleAddOpportunity} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Opportunity Name / Title</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. ITC R&D Formulation contract"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Opportunity Type</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value as any)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="BUSINESS">Business Contract</option>
                  <option value="EXAM">Government Exam</option>
                  <option value="GRANT">Research Grant</option>
                  <option value="NETWORKING">Networking / Outreach</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">ROI Potential (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={newROI} 
                  onChange={e => setNewROI(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Strategic Alignment (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={newAlignment} 
                  onChange={e => setNewAlignment(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Est. Revenue Value (INR)</label>
                <input 
                  type="number" 
                  value={newValue} 
                  onChange={e => setNewValue(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Track Opportunity
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp) => {
          const score = Math.round(((opp.roi + opp.alignment) / 20) * 100);
          return (
            <Card key={opp.id} header={
              <div className="flex justify-between items-center w-full">
                <span className="text-zinc-200 font-semibold">{opp.title}</span>
                <span className="text-[9px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                  {opp.category}
                </span>
              </div>
            }>
              <div className="flex flex-col gap-4 text-xs text-zinc-400">
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Compass className="w-3.5 h-3.5" /> Core Diagnostic Score
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400">{score}%</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span>Return on Time Investment (ROI)</span>
                    <span className="font-semibold text-zinc-300">{opp.roi}/10</span>
                  </div>
                  <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${opp.roi * 10}%` }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span>Strategic Alignment Index</span>
                    <span className="font-semibold text-zinc-300">{opp.alignment}/10</span>
                  </div>
                  <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${opp.alignment * 10}%` }} />
                  </div>
                </div>

                {opp.potentialValue && (
                  <div className="flex justify-between items-center border-t border-zinc-850 pt-3">
                    <span className="text-[10px] text-zinc-500">Est. Strategic Worth</span>
                    <span className="font-bold font-mono text-zinc-200">{formatCurrency(opp.potentialValue)}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
