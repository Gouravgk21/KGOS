'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Goal } from '@/db/database';
import { useGoalStore } from '@/store/useGoalStore';
import Card from '@/components/ui/Card';
import { Compass, Plus, Target, Trash2, Edit, Calendar, Trophy, AlertCircle } from 'lucide-react';

const CATEGORIES: Goal['category'][] = ['10 Year', '5 Year', 'Annual', 'Quarterly', 'Monthly'];

const CATEGORY_COLORS: Record<Goal['category'], { border: string; bg: string; text: string }> = {
  '10 Year': { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  '5 Year': { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'Annual': { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  'Quarterly': { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Monthly': { border: 'border-pink-500/20', bg: 'bg-pink-500/10', text: 'text-pink-400' }
};

export default function LifePlanPage() {
  const goals = useLiveQuery(() => db.goals.toArray()) || [];
  const { addGoal, updateGoal, deleteGoal } = useGoalStore();

  const [activeTab, setActiveTab] = useState<Goal['category'] | 'All'>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState<Goal['category']>('Annual');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editId !== null) {
      await updateGoal(editId, { title, description, progress, category, dueDate });
      setEditId(null);
    } else {
      await addGoal({ title, description, progress, category, dueDate });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setProgress(0);
    setCategory('Annual');
    setDueDate('');
    setIsFormOpen(false);
  };

  const handleEdit = (goal: Goal) => {
    if (goal.id === undefined) return;
    setEditId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setProgress(goal.progress);
    setCategory(goal.category);
    setDueDate(goal.dueDate || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (id === undefined) return;
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  const handleProgressChange = async (id: number | undefined, value: number) => {
    if (id === undefined) return;
    await updateGoal(id, { progress: value });
  };

  const filteredGoals = goals.filter(
    (g) => activeTab === 'All' || g.category === activeTab
  );

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-500" />
            Life Plan & Horizons
          </h1>
          <p className="text-sm text-zinc-400">Track and align goals across multiple horizons from 10-year visions to monthly sprints.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Horizon Goal
        </button>
      </div>

      {isFormOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">{editId !== null ? 'Modify Goal' : 'Establish New Goal'}</span>}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Goal Statement</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                  placeholder="e.g. Complete FSSAI PhD Application"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Horizon Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Goal['category'])}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat} Goal</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Target Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Progress ({progress}%)</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-zinc-300 w-8 text-right">{progress}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Key Details & Milestones</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700 h-24 resize-none"
                placeholder="Break down specific steps, sub-goals, or motivation..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Goal
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs / Horizon Selectors */}
      <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-850 overflow-x-auto">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'All' ? 'bg-zinc-850 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          All Horizons
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === cat ? 'bg-zinc-850 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const colors = CATEGORY_COLORS[goal.category];
            return (
              <Card
                key={goal.id}
                header={
                  <div className="flex justify-between items-start gap-4 w-full">
                    <span className="text-zinc-200 font-semibold text-sm leading-snug">{goal.title}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-semibold rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {goal.category}
                    </span>
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  {goal.description && (
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 font-medium">Progress</span>
                      <span className="font-semibold text-zinc-300">{goal.progress}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleProgressChange(goal.id, parseInt(e.target.value))}
                        className="flex-1 accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-850 pt-3 text-[10px]">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{goal.dueDate || 'No target date'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
            <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-zinc-350 font-semibold text-sm">No Goals Established</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Select "Add Horizon Goal" to formulate concrete strategic objectives for this horizon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
