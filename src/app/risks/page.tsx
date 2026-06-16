'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db } from '@/db/database';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Plus, Trash2,
  Zap, TrendingDown, HeartPulse, Brain, Flame
} from 'lucide-react';

type RiskCategory = 'BURNOUT' | 'REVENUE' | 'HEALTH' | 'CAREER' | 'RESEARCH';
type RiskSeverity = 'CRITICAL' | 'WARNING' | 'STABLE';

interface SystemRisk {
  id: number;
  label: string;
  category: RiskCategory;
  severity: RiskSeverity;
  remedy: string;
  createdAt: string;
}

// We store risks in localStorage for now (no DB table) — ephemeral per session approach
const DEFAULT_RISKS: SystemRisk[] = [
  {
    id: 1,
    label: 'Burnout Threshold Approaching',
    category: 'BURNOUT',
    severity: 'WARNING',
    remedy: 'Reduce active target priorities. Ensure next 2 nights include minimum 7h sleep and add 20-min recovery blocks.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    label: 'FSSAI Exam Preparation Lag',
    category: 'CAREER',
    severity: 'CRITICAL',
    remedy: 'Mock scores dropped below 75% target threshold. Schedule 2 deep-focus study sessions today and tomorrow.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    label: 'Cash Flow Health Check',
    category: 'REVENUE',
    severity: 'STABLE',
    remedy: 'No immediate action. Strategic cash reserves cover next 6 months of KAFS operations.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    label: 'PhD Research Timeline Drift',
    category: 'RESEARCH',
    severity: 'WARNING',
    remedy: 'Literature review milestone is 2 weeks delayed. Reallocate 4 hours/week from admin tasks to research writing.',
    createdAt: new Date().toISOString(),
  },
];

const SEVERITY_CONFIG: Record<RiskSeverity, {
  label: string;
  badge: string;
  border: string;
  bg: string;
  icon: React.ElementType;
  dot: string;
}> = {
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    border: 'border-rose-500/25',
    bg: 'bg-rose-500/5',
    icon: Flame,
    dot: 'bg-rose-500 animate-pulse',
  },
  WARNING: {
    label: 'Warning',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    icon: AlertTriangle,
    dot: 'bg-amber-400',
  },
  STABLE: {
    label: 'Stable',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-zinc-800',
    bg: 'bg-zinc-950/30',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
};

const CATEGORY_ICONS: Record<RiskCategory, React.ElementType> = {
  BURNOUT: Brain,
  REVENUE: TrendingDown,
  HEALTH: HeartPulse,
  CAREER: Zap,
  RESEARCH: ShieldAlert,
};

const CATEGORIES: RiskCategory[] = ['BURNOUT', 'REVENUE', 'HEALTH', 'CAREER', 'RESEARCH'];

export default function RiskEnginePage() {
  const [risks, setRisks] = useState<SystemRisk[]>(DEFAULT_RISKS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Derived health data from IndexedDB for live signal
  const recentHealth = useLiveQuery(() =>
    db.healthLogs.orderBy('date').reverse().limit(7).toArray()
  ) ?? [];

  // Form state
  const [formLabel, setFormLabel] = useState('');
  const [formCategory, setFormCategory] = useState<RiskCategory>('BURNOUT');
  const [formSeverity, setFormSeverity] = useState<RiskSeverity>('WARNING');
  const [formRemedy, setFormRemedy] = useState('');

  const avgSleep = recentHealth.length
    ? (recentHealth.reduce((sum, h) => sum + (h.sleep ?? h.sleepHours ?? 0), 0) / recentHealth.length).toFixed(1)
    : null;

  const avgEnergy = recentHealth.length
    ? Math.round(recentHealth.reduce((sum, h) => sum + (h.energy ?? h.energyLevel ?? 5), 0) / recentHealth.length)
    : null;

  // Auto-derive burnout signal
  const sleepBurnout = avgSleep && parseFloat(avgSleep) < 6.5;
  const energyBurnout = avgEnergy && avgEnergy < 5;
  const burnoutSignal = sleepBurnout || energyBurnout;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) return;
    const newRisk: SystemRisk = {
      id: Date.now(),
      label: formLabel.trim(),
      category: formCategory,
      severity: formSeverity,
      remedy: formRemedy,
      createdAt: new Date().toISOString(),
    };
    setRisks([newRisk, ...risks]);
    setFormLabel('');
    setFormRemedy('');
    setIsAddOpen(false);
  };

  const handleDelete = (id: number) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const handleUpdateSeverity = (id: number, severity: RiskSeverity) => {
    setRisks(risks.map(r => r.id === id ? { ...r, severity } : r));
  };

  const filtered = filterSeverity === 'ALL' ? risks : risks.filter(r => r.severity === filterSeverity);

  const criticalCount = risks.filter(r => r.severity === 'CRITICAL').length;
  const warningCount = risks.filter(r => r.severity === 'WARNING').length;
  const stableCount = risks.filter(r => r.severity === 'STABLE').length;

  // Overall risk health score (100 = all stable)
  const riskScore = risks.length
    ? Math.round(100 - (criticalCount * 30 + warningCount * 10) / risks.length)
    : 100;

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            System Risk Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Real-time audit of burnout, financial, health, career, and research risks.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Flag Risk
        </button>
      </div>

      {/* Live Health Signals from IndexedDB */}
      {recentHealth.length > 0 && burnoutSignal && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-start gap-3">
          <Brain className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Live Burnout Signal Detected</span>
            <p className="text-sm text-zinc-200 mt-1">
              {sleepBurnout && `Avg sleep last 7 days: ${avgSleep}h (below 6.5h threshold). `}
              {energyBurnout && `Avg energy: ${avgEnergy}/10 (below threshold). `}
              Consider recovery protocol immediately.
            </p>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Risk Health Score', value: `${riskScore}%`, color: riskScore >= 70 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Critical Risks', value: criticalCount, color: 'text-rose-400' },
          { label: 'Warnings', value: warningCount, color: 'text-amber-400' },
          { label: 'Stable', value: stableCount, color: 'text-emerald-400' },
        ].map(k => (
          <Card key={k.label} header={null}>
            <div className="text-center py-1">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Form */}
      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Flag New System Risk</span>}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs text-zinc-400 font-medium">Risk Label *</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-rose-700"
                  placeholder="e.g. Cash runway shortfall"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as RiskCategory)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-rose-700"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Severity</label>
                <select
                  value={formSeverity}
                  onChange={e => setFormSeverity(e.target.value as RiskSeverity)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-rose-700"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="WARNING">Warning</option>
                  <option value="STABLE">Stable</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Recommended Remedy / Pivot</label>
              <textarea
                value={formRemedy}
                onChange={e => setFormRemedy(e.target.value)}
                rows={2}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-rose-700 resize-none"
                placeholder="What action should Kumar take to mitigate this risk?"
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
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white"
              >
                Flag Risk
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'CRITICAL', 'WARNING', 'STABLE'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors ${
              filterSeverity === sev
                ? 'bg-rose-700 border-rose-600 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(r => {
          const config = SEVERITY_CONFIG[r.severity];
          const CatIcon = CATEGORY_ICONS[r.category];
          return (
            <Card
              key={r.id}
              header={
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                    <span className="text-zinc-200 font-semibold text-sm leading-snug">{r.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded border uppercase flex-shrink-0 ml-2 ${config.badge}`}>
                    {r.severity}
                  </span>
                </div>
              }
            >
              <div className="flex flex-col gap-3 text-xs text-zinc-400">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <CatIcon className="w-3.5 h-3.5 text-zinc-500" />
                    Risk Domain
                  </span>
                  <span className="font-semibold text-zinc-300">{r.category}</span>
                </div>

                <div className={`border-t border-zinc-850 pt-3 p-2.5 rounded-lg ${config.bg} border ${config.border}`}>
                  <span className="text-[10px] text-zinc-500 font-bold block mb-1">
                    Recommended Remedy
                  </span>
                  <p className="leading-relaxed text-zinc-300">{r.remedy}</p>
                </div>

                {/* Severity Toggle */}
                <div className="flex gap-1.5 border-t border-zinc-850 pt-3">
                  {(['STABLE', 'WARNING', 'CRITICAL'] as RiskSeverity[]).map(s => (
                    <button
                      key={s}
                      onClick={() => handleUpdateSeverity(r.id, s)}
                      className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${
                        r.severity === s
                          ? SEVERITY_CONFIG[s].badge
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-900/20 border border-zinc-800 hover:border-rose-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
