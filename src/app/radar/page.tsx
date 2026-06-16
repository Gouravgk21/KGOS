'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db, type Opportunity } from '@/db/database';
import { useOpportunityStore } from '@/store/useOpportunityStore';
import { formatCurrency } from '@/utils/formatters';
import {
  Radar, Plus, Compass, Trash2, Search, Sparkles, TrendingUp
} from 'lucide-react';

const SOURCES: Opportunity['source'][] = [
  'Grants', 'Conferences', 'Recruiters', 'Partnerships', 'Customers', 'Export'
];

const SOURCE_COLORS: Record<Opportunity['source'], string> = {
  Grants:       'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Conferences:  'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Recruiters:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Partnerships: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Customers:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Export:       'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export default function OpportunityRadarPage() {
  const opportunities = useLiveQuery(() =>
    db.opportunities
      .orderBy('roiScore')
      .reverse()
      .toArray()
  ) ?? [];

  const { addOpportunity, deleteOpportunity } = useOpportunityStore();

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [formTitle, setFormTitle] = useState('');
  const [formSource, setFormSource] = useState<Opportunity['source']>('Customers');
  const [formROI, setFormROI] = useState('75');
  const [formAlignment, setFormAlignment] = useState('80');
  const [formEffort, setFormEffort] = useState('50');
  const [formRevenue, setFormRevenue] = useState('500000');
  const [formNotes, setFormNotes] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    await addOpportunity({
      title: formTitle.trim(),
      source: formSource,
      roiScore: parseInt(formROI) || 50,
      alignmentScore: parseInt(formAlignment) || 50,
      effortScore: parseInt(formEffort) || 50,
      revenueImpact: parseInt(formRevenue) || 0,
      notes: formNotes || undefined,
    });
    setFormTitle('');
    setFormNotes('');
    setIsAddOpen(false);
  };

  const filtered = opportunities.filter(o => {
    const matchSource = filterSource === 'ALL' || o.source === filterSource;
    const matchSearch = !searchQuery || o.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSource && matchSearch;
  });

  // Composite score: 40% ROI + 40% Alignment + 20% (inverted effort)
  const compositeScore = (o: Opportunity) =>
    Math.round(o.roiScore * 0.4 + o.alignmentScore * 0.4 + (100 - o.effortScore) * 0.2);

  const topOpp = filtered.length > 0
    ? filtered.reduce((best, o) => compositeScore(o) > compositeScore(best) ? o : best, filtered[0])
    : null;

  const totalRevenuePipeline = opportunities.reduce((sum, o) => sum + o.revenueImpact, 0);
  const avgROI = opportunities.length
    ? Math.round(opportunities.reduce((sum, o) => sum + o.roiScore, 0) / opportunities.length)
    : 0;

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Radar className="w-6 h-6 text-emerald-500 animate-pulse" />
            Opportunity Radar
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Score, rank, and capture high-value business, grant, and career opportunities.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Opportunity
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Opportunities', value: opportunities.length, color: 'text-emerald-400' },
          { label: 'Revenue Pipeline (INR)', value: formatCurrency(totalRevenuePipeline), color: 'text-amber-400' },
          { label: 'Avg ROI Score', value: `${avgROI}/100`, color: 'text-blue-400' },
        ].map(k => (
          <Card key={k.label} header={null}>
            <div className="text-center py-1">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Top Pick Alert */}
      {topOpp && (
        <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-500 block">
              Highest-Value Opportunity Right Now
            </span>
            <p className="text-sm font-semibold text-zinc-200 mt-1">{topOpp.title}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Composite Score: {compositeScore(topOpp)}/100 · {topOpp.source} ·{' '}
              {topOpp.revenueImpact ? `Est. ${formatCurrency(topOpp.revenueImpact)}` : 'No revenue estimate'}
            </p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Opportunity</span>}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Opportunity Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-emerald-600"
                  placeholder="e.g. ITC R&D Formulations Contract"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Source Type</label>
                <select
                  value={formSource}
                  onChange={e => setFormSource(e.target.value as Opportunity['source'])}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-emerald-600"
                >
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'ROI Score (1-100)', val: formROI, set: setFormROI },
                { label: 'Alignment Score (1-100)', val: formAlignment, set: setFormAlignment },
                { label: 'Effort Required (1-100)', val: formEffort, set: setFormEffort },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">{f.label}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-emerald-600"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Revenue Impact (INR)</label>
                <input
                  type="number"
                  value={formRevenue}
                  onChange={e => setFormRevenue(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-emerald-600"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Notes</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-emerald-600 resize-none"
                placeholder="Context, contacts involved, next action..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-700"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', ...SOURCES].map(src => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors ${
                filterSource === src
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards */}
      {filtered.length === 0 ? (
        <Card header={null}>
          <div className="text-center py-12 text-zinc-600 text-sm">
            No opportunities found. Add your first opportunity above.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(opp => {
            const score = compositeScore(opp);
            const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
            const scoreBg = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <Card
                key={opp.id}
                header={
                  <div className="flex justify-between items-start w-full gap-2">
                    <span className="text-zinc-200 font-semibold text-sm leading-snug">{opp.title}</span>
                    <span className={`text-[9px] font-mono tracking-wider border px-2 py-0.5 rounded flex-shrink-0 ${SOURCE_COLORS[opp.source]}`}>
                      {opp.source.toUpperCase()}
                    </span>
                  </div>
                }
              >
                <div className="flex flex-col gap-4 text-xs text-zinc-400">
                  {/* Composite Score */}
                  <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Compass className="w-3.5 h-3.5" /> Composite Score
                    </span>
                    <span className={`text-xl font-extrabold ${scoreColor}`}>{score}</span>
                  </div>

                  {/* Score bars */}
                  {[
                    { label: 'ROI Score', val: opp.roiScore, color: 'bg-emerald-500' },
                    { label: 'Alignment Index', val: opp.alignmentScore, color: 'bg-blue-500' },
                    { label: 'Effort Required', val: opp.effortScore, color: 'bg-rose-500' },
                  ].map(b => (
                    <div key={b.label} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span>{b.label}</span>
                        <span className="font-semibold text-zinc-300">{b.val}/100</span>
                      </div>
                      <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden">
                        <div className={`${b.color} h-full rounded-full transition-all`} style={{ width: `${b.val}%` }} />
                      </div>
                    </div>
                  ))}

                  {/* Revenue */}
                  {opp.revenueImpact > 0 && (
                    <div className="flex justify-between items-center border-t border-zinc-850 pt-3">
                      <span className="text-[10px] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Est. Revenue Impact
                      </span>
                      <span className="font-bold font-mono text-zinc-200">{formatCurrency(opp.revenueImpact)}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {opp.notes && (
                    <p className="text-[10px] text-zinc-500 border-t border-zinc-850 pt-2 leading-relaxed line-clamp-2">
                      {opp.notes}
                    </p>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => opp.id && deleteOpportunity(opp.id)}
                    className="self-end p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-900/20 border border-zinc-800 hover:border-rose-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
