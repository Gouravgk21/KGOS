'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type HealthLog, type HealthGoal } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  Heart, Zap, Target, Smile, Moon, Dumbbell, Droplets, Weight,
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus,
  Edit3, X, Save, Sparkles, Activity, Flame
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

const last7Days = () => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const last30Days = () => {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

// ─── Slider Component ─────────────────────────────────────────────────────────

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  color?: string;
  invert?: boolean;
}

function SliderField({ label, value, min, max, step = 1, unit = '', onChange, color = '#00B4D8', invert = false }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayColor = invert
    ? pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#10b981'
    : pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-zinc-300">{label}</label>
        <span className="text-sm font-bold font-mono" style={{ color: displayColor }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, #27272a ${pct}%)`
        }}
      />
      <div className="flex justify-between text-[9px] text-zinc-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Vitality Gauge ────────────────────────────────────────────────────────────

function VitalityGauge({ score }: { score: number }) {
  const color = score > 70 ? '#10b981' : score > 50 ? '#eab308' : score > 30 ? '#f97316' : '#ef4444';
  const label = score > 70 ? 'OPTIMAL' : score > 50 ? 'GOOD' : score > 30 ? 'AT RISK' : 'CRITICAL';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" className="-rotate-90">
          <circle cx="72" cy="72" r="54" fill="none" stroke="#27272a" strokeWidth="10" />
          <circle
            cx="72" cy="72" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-zinc-100">{Math.round(score)}</span>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Vitality</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HealthOSPage() {
  const allLogs = useLiveQuery(() => db.healthLogs.orderBy('date').toArray()) ?? [];
  const healthGoals = useLiveQuery(() => db.healthGoals.toArray()) ?? [];

  // ── Today check-in form state
  const [energy, setEnergy] = useState(7);
  const [focus, setFocus] = useState(7);
  const [mood, setMood] = useState(7);
  const [stress, setStress] = useState(4);
  const [recovery, setRecovery] = useState(7);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [waterIntake, setWaterIntake] = useState(8);
  const [exercise, setExercise] = useState(30);
  const [weightKg, setWeightKg] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);

  // ── Goals modal
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalSleep, setGoalSleep] = useState('7.5');
  const [goalExercise, setGoalExercise] = useState('30');
  const [goalWater, setGoalWater] = useState('8');
  const [goalWeight, setGoalWeight] = useState('75');

  // ─── Derived data ─────────────────────────────────────────────────────────

  const todayStr = today();
  const todayLog = useMemo(() =>
    allLogs.find(l => l.date === todayStr), [allLogs, todayStr]);

  const sevenDayLogs = useMemo(() => {
    const days = last7Days();
    return days.map(d => {
      const log = allLogs.find(l => l.date === d);
      return {
        date: d,
        label: fmtDate(d),
        energy: log?.energy ?? log?.energyLevel ?? null,
        focus: log?.sleepQuality ?? null, // repurpose sleepQuality as focus
        mood: null as number | null,
        stress: null as number | null,
        sleep: log?.sleep ?? log?.sleepHours ?? null,
        water: log?.waterIntake ?? null,
        exercise: log?.exercise ?? null,
      };
    });
  }, [allLogs]);

  const thirtyDayLogs = useMemo(() => {
    const days = last30Days();
    return days.map(d => {
      const log = allLogs.find(l => l.date === d);
      return {
        date: d,
        label: fmtDate(d),
        energy: log?.energy ?? log?.energyLevel ?? null,
      };
    });
  }, [allLogs]);

  // ── 7-day averages
  const avgStats = useMemo(() => {
    const recent = allLogs.slice(-7);
    if (recent.length === 0) return { energy: 5, focus: 5, mood: 5, stress: 5, sleep: 6, water: 6, exercise: 20 };
    const avg = (arr: (number | undefined | null)[]) => {
      const valid = arr.filter(v => v != null) as number[];
      return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    };
    return {
      energy: avg(recent.map(l => l.energy ?? l.energyLevel)),
      focus: avg(recent.map(l => l.sleepQuality)),
      mood: avg(recent.map(l => l.energy)), // use energy as proxy
      stress: 4, // default
      sleep: avg(recent.map(l => l.sleep ?? l.sleepHours)),
      water: avg(recent.map(l => l.waterIntake)),
      exercise: avg(recent.map(l => l.exercise)),
    };
  }, [allLogs]);

  // ── Vitality / Burnout Score
  const vitalityScore = useMemo(() => {
    const { energy: e, sleep: s, focus: f, stress: st } = avgStats;
    const safeE = e || 5;
    const safeS = s || 6;
    const safeF = f || 5;
    const safeSt = st || 5;
    const score =
      (10 - safeSt) * 0.3 * 10 +
      safeE * 0.3 * 10 +
      (safeS / 8) * 10 * 0.2 * 10 +
      safeF * 0.2 * 10;
    return Math.min(100, Math.max(0, score));
  }, [avgStats]);

  // ── Load today's values into form when editing
  const openCheckin = useCallback(() => {
    if (todayLog) {
      setIsEditMode(true);
      setEnergy(todayLog.energy ?? todayLog.energyLevel ?? 7);
      setFocus(todayLog.sleepQuality ?? 7);
      setSleepHours(todayLog.sleep ?? todayLog.sleepHours ?? 7.5);
      setWaterIntake(todayLog.waterIntake ?? 8);
      setExercise(todayLog.exercise ?? 30);
      setWeightKg(todayLog.weight?.toString() ?? '');
    } else {
      setIsEditMode(false);
    }
    setShowCheckin(true);
  }, [todayLog]);

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const logData: Omit<HealthLog, 'id' | 'createdAt'> = {
      date: todayStr,
      energy,
      energyLevel: energy,
      sleepQuality: focus, // repurpose for focus
      sleep: sleepHours,
      sleepHours,
      waterIntake,
      exercise,
      weight: weightKg ? parseFloat(weightKg) : undefined,
    };

    try {
      if (todayLog?.id) {
        await db.healthLogs.update(todayLog.id, logData);
      } else {
        await db.healthLogs.add({ ...logData, createdAt: new Date().toISOString() });
      }
      setShowCheckin(false);
    } catch (err) {
      console.error('Failed to save health log:', err);
    }
  };

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    const goalsToUpsert: Array<Omit<HealthGoal, 'id' | 'createdAt'>> = [
      { metric: 'sleep', target: parseFloat(goalSleep) || 7.5, unit: 'hrs' },
      { metric: 'exercise', target: parseFloat(goalExercise) || 30, unit: 'min' },
      { metric: 'water', target: parseFloat(goalWater) || 8, unit: 'glasses' },
      { metric: 'weight', target: parseFloat(goalWeight) || 75, unit: 'kg' },
    ];
    for (const g of goalsToUpsert) {
      const existing = healthGoals.find(hg => hg.metric === g.metric);
      if (existing?.id) {
        await db.healthGoals.update(existing.id, g);
      } else {
        await db.healthGoals.add({ ...g, createdAt: new Date().toISOString() });
      }
    }
    setShowGoalsModal(false);
  };

  // ── AI Recommendations
  const recommendations = useMemo(() => {
    const recs: { icon: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];
    const { sleep, exercise, energy } = avgStats;
    const recentEnergy = allLogs.slice(-7).map(l => l.energy ?? l.energyLevel ?? 5);
    const trending = recentEnergy.length >= 3
      ? (recentEnergy[recentEnergy.length - 1] ?? 5) - (recentEnergy[0] ?? 5)
      : 0;

    if ((sleep || 0) < 6) recs.push({ icon: '🌙', text: 'Prioritize sleep. Aim for 7.5h by sleeping at 10pm and limiting screens after 9pm.', priority: 'high' });
    if ((exercise || 0) < 20) recs.push({ icon: '🏃', text: 'Add 20min morning walk. Schedule at 6:30am — consistency beats intensity.', priority: 'medium' });
    if ((avgStats.stress || 0) > 7) recs.push({ icon: '🧘', text: 'High stress detected. Add 10min Wim Hof breathing to your morning routine.', priority: 'high' });
    if (trending < -1) recs.push({ icon: '⚡', text: 'Energy declining over 7 days. Check nutrition, hydration, and sleep debt.', priority: 'medium' });
    if ((avgStats.water || 0) < 6) recs.push({ icon: '💧', text: 'Low hydration detected. Set hourly phone reminders to drink 300ml water.', priority: 'low' });
    if (recs.length === 0) recs.push({ icon: '✅', text: 'All metrics in range. Maintain current routine and increase challenge gradually.', priority: 'low' });
    return recs.slice(0, 4);
  }, [avgStats, allLogs]);

  // ── Goal progress bars
  const goalProgress = useMemo(() => {
    const getTarget = (metric: HealthGoal['metric'], def: number) =>
      healthGoals.find(g => g.metric === metric)?.target ?? def;
    return [
      { label: 'Sleep', actual: avgStats.sleep || 0, target: getTarget('sleep', 7.5), unit: 'h', color: '#3b82f6' },
      { label: 'Exercise', actual: avgStats.exercise || 0, target: getTarget('exercise', 30), unit: 'min', color: '#f59e0b' },
      { label: 'Water', actual: avgStats.water || 0, target: getTarget('water', 8), unit: 'gl', color: '#06b6d4' },
    ];
  }, [avgStats, healthGoals]);

  const todayMetrics = todayLog ? [
    { icon: '🔋', label: 'Energy', value: todayLog.energy ?? todayLog.energyLevel ?? '—', max: 10, color: '#10b981' },
    { icon: '🎯', label: 'Focus', value: todayLog.sleepQuality ?? '—', max: 10, color: '#3b82f6' },
    { icon: '😊', label: 'Mood', value: todayLog.energy ?? '—', max: 10, color: '#a855f7' },
    { icon: '🌙', label: 'Sleep', value: todayLog.sleep ?? todayLog.sleepHours ?? '—', max: 12, color: '#6366f1', unit: 'h' },
    { icon: '💪', label: 'Exercise', value: todayLog.exercise ?? '—', max: 120, color: '#f59e0b', unit: 'min' },
  ] : [];

  const tooltipStyle = { backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 11 };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Health OS
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Bio-performance tracking · Burnout detection · Vitality optimization
          </p>
        </div>
        <button
          onClick={openCheckin}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          {todayLog ? <Edit3 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          {todayLog ? 'Edit Today' : "Log Today's Check-in"}
        </button>
      </div>

      {/* ── Today's Check-in Panel ─────────────────────────────────────── */}
      {showCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <h2 className="text-zinc-100 font-bold text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-400" />
                {isEditMode ? 'Edit Today\'s Check-in' : 'Daily Health Check-in'}
                <span className="text-xs font-normal text-zinc-500 ml-1">{todayStr}</span>
              </h2>
              <button onClick={() => setShowCheckin(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCheckinSubmit} className="p-5 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SliderField label="⚡ Energy Level" value={energy} min={1} max={10} onChange={setEnergy} color="#10b981" />
                <SliderField label="🎯 Focus & Clarity" value={focus} min={1} max={10} onChange={setFocus} color="#3b82f6" />
                <SliderField label="😊 Mood" value={mood} min={1} max={10} onChange={setMood} color="#a855f7" />
                <SliderField label="😰 Stress (higher = worse)" value={stress} min={1} max={10} onChange={setStress} color="#ef4444" invert />
                <SliderField label="🔄 Recovery" value={recovery} min={1} max={10} onChange={setRecovery} color="#f59e0b" />
                <SliderField label="🌙 Sleep Hours" value={sleepHours} min={0} max={12} step={0.5} unit="h" onChange={setSleepHours} color="#6366f1" />
                <SliderField label="💧 Water Intake" value={waterIntake} min={0} max={16} unit=" gl" onChange={setWaterIntake} color="#06b6d4" />
                <SliderField label="💪 Exercise" value={exercise} min={0} max={120} unit=" min" onChange={setExercise} color="#f97316" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">⚖️ Weight (optional, kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  placeholder="e.g. 74.5"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 outline-none focus:border-rose-600"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCheckin(false)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg">
                  Cancel
                </button>
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg">
                  <Save className="w-3.5 h-3.5" />
                  {isEditMode ? 'Update Check-in' : 'Log Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Today's Stats Row ──────────────────────────────────────────── */}
      {todayLog ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {todayMetrics.map(m => (
            <div key={m.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">{m.icon}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{m.label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color: m.color }}>
                {m.value}{m.unit ?? (typeof m.value === 'number' && m.max === 10 ? '/10' : '')}
              </div>
              {typeof m.value === 'number' && (
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(m.value / m.max) * 100}%`, backgroundColor: m.color }} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-950 border border-dashed border-zinc-700 rounded-xl p-6 text-center">
          <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">No check-in logged for today. <button onClick={openCheckin} className="text-rose-400 underline font-medium">Log now →</button></p>
        </div>
      )}

      {/* ── Vitality Score + Burnout Alert ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center justify-center py-4">
          <VitalityGauge score={vitalityScore} />
        </Card>
        <div className="md:col-span-2 flex flex-col gap-3">
          {vitalityScore < 50 && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-300">⚠️ Burnout Risk Detected</p>
                <p className="text-xs text-red-400/80 mt-0.5">Vitality score is critically low. Consider reducing workload, adding recovery days, and prioritizing sleep this week.</p>
              </div>
            </div>
          )}
          <Card>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Health Recommendations
              </div>
              {recommendations.map((r, i) => (
                <div key={i} className={`flex gap-2 items-start text-xs py-2 px-3 rounded-lg border ${
                  r.priority === 'high' ? 'border-red-500/20 bg-red-500/5 text-red-300' :
                  r.priority === 'medium' ? 'border-amber-500/20 bg-amber-500/5 text-amber-300' :
                  'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                }`}>
                  <span className="text-base flex-shrink-0">{r.icon}</span>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── 7-Day Trend Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Energy + Focus */}
        <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400" />Energy & Focus — 7 Days</span>}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sevenDayLogs} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis dataKey="label" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} domain={[0, 10]} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Energy" connectNulls />
                <Line type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Focus" connectNulls strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sleep BarChart with target line */}
        <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-400" />Sleep Hours — 7 Days</span>}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDayLogs} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis dataKey="label" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} domain={[0, 12]} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={7.5} stroke="#6366f1" strokeDasharray="5 3" label={{ value: 'Target 7.5h', fill: '#6366f1', fontSize: 9, position: 'right' }} />
                <Bar dataKey="sleep" fill="#6366f1" name="Sleep (h)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mood + Stress */}
        <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><Smile className="w-4 h-4 text-purple-400" />Mood & Stress — 7 Days</span>}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sevenDayLogs} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis dataKey="label" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} domain={[0, 10]} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Mood" connectNulls />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Stress" connectNulls strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exercise */}
        <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><Dumbbell className="w-4 h-4 text-amber-400" />Exercise Minutes — 7 Days</span>}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDayLogs} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis dataKey="label" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="5 3" label={{ value: 'Target 30min', fill: '#f59e0b', fontSize: 9, position: 'right' }} />
                <Bar dataKey="exercise" fill="#f59e0b" name="Exercise (min)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 30-Day Energy Overview ─────────────────────────────────────── */}
      <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-400" />30-Day Energy Trend</span>}>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={thirtyDayLogs} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGrad30" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
              <XAxis dataKey="label" stroke="#555" fontSize={9} tickLine={false} interval={4} />
              <YAxis stroke="#555" fontSize={10} domain={[0, 10]} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} fill="url(#energyGrad30)" name="Energy" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Health Goals Panel ─────────────────────────────────────────── */}
      <Card
        header={
          <div className="flex justify-between items-center w-full">
            <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <Target className="w-4 h-4 text-rose-400" />Health Goals — 7-Day Progress
            </span>
            <button onClick={() => setShowGoalsModal(true)} className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors">
              <Edit3 className="w-3 h-3" />Edit Goals
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goalProgress.map(g => {
            const pct = Math.min(100, (g.actual / g.target) * 100);
            return (
              <div key={g.label} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-medium">{g.label}</span>
                  <span className="font-mono font-bold text-zinc-200">
                    {g.actual.toFixed(1)}{g.unit} <span className="text-zinc-600">/ {g.target}{g.unit}</span>
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#10b981' : pct >= 70 ? g.color : '#ef4444' }} />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>{pct >= 100 ? '✅ Goal Met' : `${Math.round(pct)}% achieved`}</span>
                  <span>7-day avg</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Goals Edit Modal ───────────────────────────────────────────── */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <h2 className="text-zinc-100 font-bold text-sm">Edit Health Goals</h2>
              <button onClick={() => setShowGoalsModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveGoals} className="p-5 flex flex-col gap-4">
              {[
                { label: 'Sleep Target (h/night)', value: goalSleep, set: setGoalSleep, placeholder: '7.5' },
                { label: 'Exercise Target (min/day)', value: goalExercise, set: setGoalExercise, placeholder: '30' },
                { label: 'Water Target (glasses/day)', value: goalWater, set: setGoalWater, placeholder: '8' },
                { label: 'Weight Target (kg)', value: goalWeight, set: setGoalWeight, placeholder: '75' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">{f.label}</label>
                  <input type="number" step="0.1" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 outline-none focus:border-rose-600" />
                </div>
              ))}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-800 text-zinc-400 rounded-lg">Cancel</button>
                <button type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg">
                  <Save className="w-3 h-3" />Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
