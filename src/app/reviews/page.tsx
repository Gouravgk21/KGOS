'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type DailyReview } from '@/db/database';
import { useReviewStore } from '@/store/useReviewStore';
import Card from '@/components/ui/Card';
import { Calendar, Plus, Trophy, Brain, ShieldAlert, Sparkles, CheckSquare, Save } from 'lucide-react';

export default function DailyReviewsPage() {
  const reviews = useLiveQuery(() => db.dailyReviews.orderBy('date').reverse().toArray()) || [];
  const { addReview, updateReview } = useReviewStore();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [energy, setEnergy] = useState(7);
  const [prioritiesInput, setPrioritiesInput] = useState('');
  const [winsInput, setWinsInput] = useState('');
  const [challengesInput, setChallengesInput] = useState('');
  const [learningsInput, setLearningsInput] = useState('');
  const [existingId, setExistingId] = useState<number | null>(null);

  // Load existing review when date changes
  useEffect(() => {
    async function loadReview() {
      const existing = await db.dailyReviews.where('date').equals(date).first();
      if (existing) {
        setExistingId(existing.id || null);
        setEnergy(existing.energyMorning || 7);
        setPrioritiesInput(existing.priorities?.join('\n') || '');
        setWinsInput(existing.wins?.join('\n') || '');
        setChallengesInput(existing.challenges?.join('\n') || '');
        setLearningsInput(existing.learnings?.join('\n') || '');
      } else {
        setExistingId(null);
        setEnergy(7);
        setPrioritiesInput('');
        setWinsInput('');
        setChallengesInput('');
        setLearningsInput('');
      }
    }
    loadReview();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      date,
      energyMorning: energy,
      priorities: prioritiesInput.split('\n').map(x => x.trim()).filter(Boolean),
      wins: winsInput.split('\n').map(x => x.trim()).filter(Boolean),
      challenges: challengesInput.split('\n').map(x => x.trim()).filter(Boolean),
      learnings: learningsInput.split('\n').map(x => x.trim()).filter(Boolean)
    };

    if (existingId !== null) {
      await updateReview(existingId, data);
      alert('Review updated successfully.');
    } else {
      await addReview(data);
      alert('Review recorded successfully.');
    }
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-400" />
          Daily Review System
        </h1>
        <p className="text-sm text-zinc-400">Complete morning setting and evening reflections to maintain focus, track wins, and synthesize learnings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal entry form */}
        <div className="lg:col-span-2">
          <Card header={
            <div className="flex justify-between items-center w-full">
              <span className="text-zinc-200 font-semibold">{existingId !== null ? 'Modify Reflection Journal' : 'Write Reflection Journal'}</span>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-350 outline-none focus:border-zinc-700"
              />
            </div>
          }>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Energy Level */}
              <div className="flex flex-col gap-1.5 border-b border-zinc-850 pb-4">
                <label className="text-xs text-zinc-400 font-medium flex justify-between">
                  <span>Morning Focus Energy Index</span>
                  <span className="font-bold text-indigo-400">{energy} / 10</span>
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={e => setEnergy(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* priorities */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> Daily Focus Priorities (One per line)
                </label>
                <textarea
                  value={prioritiesInput}
                  onChange={e => setPrioritiesInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none text-zinc-200 focus:border-zinc-700 h-20 resize-none font-sans"
                  placeholder="e.g. Complete hydrocolloid gelation trials&#10;Follow up with Kwality Confectionery lead"
                />
              </div>

              {/* Wins */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Daily Achievements / Wins (One per line)
                </label>
                <textarea
                  value={winsInput}
                  onChange={e => setWinsInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none text-zinc-200 focus:border-zinc-700 h-20 resize-none"
                  placeholder="e.g. Successfully stabilized kappa blend&#10;FSSAI study hour target completed"
                />
              </div>

              {/* Challenges */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Key Bottlenecks / Challenges (One per line)
                </label>
                <textarea
                  value={challengesInput}
                  onChange={e => setChallengesInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none text-zinc-200 focus:border-zinc-700 h-20 resize-none"
                  placeholder="e.g. Viscometer calibration offset by 2%"
                />
              </div>

              {/* Learnings */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Lessons Learned & Insights (One per line)
                </label>
                <textarea
                  value={learningsInput}
                  onChange={e => setLearningsInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none text-zinc-200 focus:border-zinc-700 h-20 resize-none"
                  placeholder="e.g. High shear mixing required for full hydration of Locust Bean Gum"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all"
              >
                <Save className="w-4 h-4" /> Save Journal Entry
              </button>
            </form>
          </Card>
        </div>

        {/* History of daily reviews */}
        <div className="flex flex-col gap-6">
          <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-400" /> Historical Reflections</span>}>
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => setDate(rev.date)}
                    className="p-3 border border-zinc-850 hover:border-zinc-750 bg-zinc-950/20 hover:bg-zinc-950/40 rounded-xl cursor-pointer transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-200 font-mono">{new Date(rev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Energy: {rev.energyMorning}/10
                      </span>
                    </div>

                    {rev.wins && rev.wins.length > 0 && (
                      <div className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-300">Top Win:</strong> {rev.wins[0]}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-550 text-xs">No reflections logged yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
