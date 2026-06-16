'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Habit } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Flame, Plus, CheckCircle, RefreshCw, Sparkles, Trash2, Calendar, 
  Dumbbell, Brain, Briefcase, Award, Zap, Compass, Check
} from 'lucide-react';

const CATEGORIES = ['Health', 'Business', 'Learning', 'Personal'];

export default function HabitsTrackerPage() {
  const habits = useLiveQuery(() => db.habits.toArray()) || [];

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Learning');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI habit advisor advice state
  const [aiAdvice, setAiAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Auto seed starter habits
  React.useEffect(() => {
    const seedHabits = async () => {
      const count = await db.habits.count();
      if (count === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Seed 4 habits
        await db.habits.add({ name: 'Log Health Metrics', isActive: true, completedDates: [todayStr], createdAt: new Date().toISOString() });
        await db.habits.add({ name: '120-min Study Session', isActive: true, completedDates: [], createdAt: new Date().toISOString() });
        await db.habits.add({ name: 'KAFS Lab Trial', isActive: true, completedDates: [todayStr], createdAt: new Date().toISOString() });
        await db.habits.add({ name: 'LinkedIn Brand Composer', isActive: true, completedDates: [], createdAt: new Date().toISOString() });
      }
    };
    seedHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await db.habits.add({
      name: `${newHabitName} [${newHabitCategory}]`,
      isActive: true,
      completedDates: [],
      createdAt: new Date().toISOString()
    });

    setNewHabitName('');
    setNewHabitCategory('Learning');
    setIsModalOpen(false);
  };

  const handleToggleToday = async (habit: Habit) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(todayStr);

    let updatedDates = [...habit.completedDates];
    if (isCompletedToday) {
      updatedDates = updatedDates.filter(d => d !== todayStr);
    } else {
      updatedDates.push(todayStr);
    }

    await db.habits.update(habit.id!, { completedDates: updatedDates });
  };

  const handleDeleteHabit = async (id: number) => {
    if (confirm('Delete this habit tracking history?')) {
      await db.habits.delete(id);
    }
  };

  // Streaks calculation: consecutive days back from today or yesterday
  const getStreakData = (habit: Habit) => {
    const dates = [...habit.completedDates].sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) return { current: 0, best: 0 };

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];

    // Check if habit completed today or yesterday to continue streak
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return { current: 0, best: dates.length }; // streak broken
    }

    let streak = 0;
    let currentSearchDate = new Date(dates[0]);

    for (let i = 0; i < dates.length; i++) {
      const compareStr = currentSearchDate.toISOString().split('T')[0];
      if (dates.includes(compareStr)) {
        streak++;
        // decrement day
        currentSearchDate.setDate(currentSearchDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      current: streak,
      best: Math.max(streak, dates.length)
    };
  };

  // 30 Days Heatmap Grid calculations
  const heatmapDays = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // count how many habits were completed on this day
      const completionsCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
      days.push({
        dateStr,
        label: d.toLocaleDateString('en', { day: 'numeric', month: 'short' }),
        count: completionsCount
      });
    }
    return days;
  }, [habits]);

  // AI Habit Coach advice trigger
  const handleRequestAdvice = () => {
    setAdviceLoading(true);
    setTimeout(() => {
      setAdviceLoading(false);
      // Simulated custom advice based on habits completion
      const incomplete = habits.filter(h => !h.completedDates.includes(new Date().toISOString().split('T')[0]));
      
      if (incomplete.length > 0) {
        setAiAdvice(
          `AI HABIT ADVISOR (SIMULATED GPT-4o):\n\nStreak Protection Alert:\n• You have ${incomplete.length} pending habits today, including "${incomplete[0].name.split(' [')[0]}".\n\nPreservation Recommendation:\n• Don't break the chain. Scale down target scopes. Instead of a 120-minute study session, study for just 5 minutes today. Marking it complete preserves your mental momentum.\n• Stack habits: execute your brand composition immediately after reviewing your daily health dashboard logs.`
        );
      } else {
        setAiAdvice(
          `AI HABIT ADVISOR (SIMULATED GPT-4o):\n\nPerfect Velocity Matrix:\n• All active habits are logged completed for today!\n• Your current neuro-chain is fully optimized. Keep compounding at 1% daily.`
        );
      }
    }, 1000);
  };

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Self Mastery Hub</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Flame className="w-8 h-8 text-[#00B4D8]" />
            HABIT OS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build compounding momentum, monitor daily habit loops, and secure active streaks with AI recommendations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Habit Target
        </button>
      </div>

      {/* Heatmap Grid & Coach Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap Contribution Grid (2/3 width) */}
        <div className="lg:col-span-2">
          <Card header={<span className="text-xs font-mono tracking-widest text-[#D4A017] uppercase">Consistency Matrix (Last 30 Days)</span>}>
            <div className="flex flex-col gap-5 py-2">
              <div className="grid grid-cols-10 gap-2.5">
                {heatmapDays.map((day, idx) => {
                  // Determine green intensity based on completions count
                  let opacityClass = 'bg-slate-900 border-slate-850';
                  if (day.count === 1) opacityClass = 'bg-[#00B4D8]/20 border-[#00B4D8]/20 text-[#00B4D8]';
                  else if (day.count === 2) opacityClass = 'bg-[#00B4D8]/40 border-[#00B4D8]/30 text-white';
                  else if (day.count >= 3) opacityClass = 'bg-[#00B4D8] border-[#00B4D8]/50 text-[#0B1220]';

                  return (
                    <div 
                      key={idx}
                      className={`h-11 rounded-lg border flex flex-col justify-center items-center text-[10px] font-mono font-bold transition-all ${opacityClass}`}
                      title={`${day.count} habits completed on ${day.dateStr}`}
                    >
                      <span>{day.dateStr.split('-')[2]}</span>
                      <span className="text-[7px] font-sans font-normal opacity-70">{day.label.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-850/40 pt-3">
                <div className="flex gap-2 items-center">
                  <span>Less completions</span>
                  <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800" />
                  <span className="w-3.5 h-3.5 rounded bg-[#00B4D8]/20" />
                  <span className="w-3.5 h-3.5 rounded bg-[#00B4D8]/50" />
                  <span className="w-3.5 h-3.5 rounded bg-[#00B4D8]" />
                  <span>More completions</span>
                </div>
                <span>Heatmap Grid</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Habit Coach advice */}
        <div className="lg:col-span-1">
          <Card header={
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00B4D8] animate-pulse" />
              AI Habit Coach
            </span>
          }>
            <div className="flex flex-col gap-4 text-xs">
              <p className="text-slate-400">
                Facing low energy or time constraints? Get a custom recommendation to protect your daily chains.
              </p>
              
              <button
                onClick={handleRequestAdvice}
                disabled={adviceLoading}
                className="w-full bg-[#0F172A] border border-slate-800 hover:bg-slate-800 py-2.5 rounded-lg font-mono text-[10px] text-slate-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {adviceLoading ? 'Consulting Advisor...' : 'Consult Habit Coach'}
              </button>

              {aiAdvice && (
                <div className="bg-[#1A2332]/50 border border-[#00B4D8]/20 p-4 rounded-xl text-xs font-mono text-[#00B4D8] whitespace-pre-line leading-relaxed relative animate-fade-in">
                  <button 
                    onClick={() => setAiAdvice('')}
                    className="absolute top-2 right-3 text-slate-500 hover:text-slate-350"
                  >
                    ✕
                  </button>
                  {aiAdvice}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* Habit Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active habits checklist (2/3 width) */}
        <div className="lg:col-span-2">
          <Card header={<span className="text-sm font-semibold text-slate-200">Compounding Habit Checklist</span>}>
            <div className="flex flex-col gap-3">
              {habits.map(habit => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isCompletedToday = habit.completedDates.includes(todayStr);
                const streaks = getStreakData(habit);

                return (
                  <div 
                    key={habit.id}
                    className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 transition-all ${
                      isCompletedToday 
                        ? 'bg-slate-900 border-[#00B4D8]/20 shadow-sm' 
                        : 'bg-[#0F172A] border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleToday(habit)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                          isCompletedToday 
                            ? 'bg-[#00B4D8]/10 border-[#00B4D8]/30 text-[#00B4D8]' 
                            : 'bg-[#0B1220] border-slate-800 text-slate-700 hover:border-slate-700'
                        }`}
                      >
                        {isCompletedToday && <Check className="w-4 h-4 font-bold" />}
                      </button>
                      
                      <div>
                        <span className={`text-xs font-bold font-serif block ${
                          isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-200'
                        }`}>
                          {habit.name.split(' [')[0]}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">
                          Category: {habit.name.includes('[') ? habit.name.split('[')[1].replace(']', '') : 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Streak badge */}
                      <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full text-orange-400 font-mono text-[10px]">
                        <Flame className="w-3.5 h-3.5 fill-orange-400 stroke-none" />
                        <span>{streaks.current}d</span>
                      </div>

                      <button
                        onClick={() => handleDeleteHabit(habit.id!)}
                        className="text-slate-650 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No habits cataloged. Add habit targets above.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-1">
          <Card header={<span className="text-xs font-mono tracking-widest text-[#00B4D8] uppercase">Consistency Rules</span>}>
            <div className="flex flex-col gap-3.5 text-xs text-slate-400 leading-relaxed">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-[#D4A017] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Never miss twice:</strong> Missing one day is an accident. Missing two days is the start of a new bad habit.
                </p>
              </div>
              <div className="flex gap-3">
                <Compass className="w-5 h-5 text-[#00B4D8] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Syllabus alignment:</strong> Connect study habits to FSSAI mock tests. Logging sessions updates progress.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* CREATE HABIT DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">Track New Habit Target</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Habit Description</label>
                <input
                  type="text"
                  placeholder="e.g. Read 1 Scientific Paper"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Category</label>
                <select
                  value={newHabitCategory}
                  onChange={e => setNewHabitCategory(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-350 outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
