'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { FlaskConical, Plus, Search, Beaker, Archive, CheckCircle, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';

interface NewFormulationForm {
  name: string;
  description: string;
  version: string;
  targetApplication: string;
  status: 'Draft' | 'Active';
}

export default function FormulationLab() {
  const formulations = useLiveQuery(() => db.formulations.toArray()) || [];
  const [filter, setFilter] = useState<'All' | 'Draft' | 'Active' | 'Archived'>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewFormulationForm>({
    name: '',
    description: '',
    version: '1.0',
    targetApplication: '',
    status: 'Draft',
  });

  const filtered = formulations.filter(
    (f) =>
      (filter === 'All' || f.status === filter) &&
      (f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.targetApplication.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!form.name.trim() || !form.targetApplication.trim()) return;
    const now = new Date().toISOString();
    await db.formulations.add({
      ...form,
      ingredientsList: JSON.stringify([]),
      costPerKg: 0,
      createdAt: now,
      updatedAt: now,
    });
    setIsModalOpen(false);
    setForm({ name: '', description: '', version: '1.0', targetApplication: '', status: 'Draft' });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-[#00B4D8]" />
            <span className="font-mono text-sm text-[#00B4D8] tracking-widest uppercase">KAFS Engine</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Formulation Lab
          </h1>
          <p className="text-zinc-400 mt-2 font-mono text-sm">
            Design, simulate, and optimize hydrocolloid systems.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Formulation
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[rgba(15,23,42,0.5)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
        <div className="flex gap-2 w-full md:w-auto">
          {['All', 'Draft', 'Active', 'Archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#006D77] text-white shadow-[0_0_10px_rgba(0,180,216,0.2)]'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00B4D8] text-sm transition-colors"
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((f) => (
          <Link key={f.id} href={`/formulation-lab/${f.id}`}>
            <div className="card hover:bg-[rgba(15,23,42,0.8)] transition-all cursor-pointer group flex flex-col h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-[#00B4D8] transition-colors">{f.name}</h3>
                  <div className="text-xs text-zinc-500 font-mono mt-1">v{f.version} • {new Date(f.updatedAt).toLocaleDateString()}</div>
                </div>
                {f.status === 'Active' && <CheckCircle className="w-5 h-5 text-[#16A34A]" />}
                {f.status === 'Draft' && <Clock className="w-5 h-5 text-[#F59E0B]" />}
                {f.status === 'Archived' && <Archive className="w-5 h-5 text-zinc-600" />}
              </div>

              {f.description && (
                <p className="text-xs text-zinc-500 font-mono line-clamp-2 mb-auto">{f.description}</p>
              )}

              <div className="mt-auto space-y-3 border-t border-zinc-800/50 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Application</span>
                  <span className="text-zinc-300 font-medium">{f.targetApplication}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-mono uppercase tracking-wider text-[10px]">Est. Cost/Kg</span>
                  <span className="text-[#D4A017] font-mono font-bold">{formatCurrency(f.costPerKg)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-xl">
            <Beaker className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-400 mb-2">No formulations found</h3>
            <p className="text-zinc-500 max-w-sm">Create a new formulation model or adjust your filters.</p>
            <button className="mt-4 btn-primary" onClick={() => { setFilter('All'); setSearch(''); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* New Formulation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[rgba(0,180,216,0.2)] rounded-xl shadow-2xl w-full max-w-lg animate-slide-up">
            <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#00B4D8]" />
                <h2 className="text-lg font-bold text-white">New Formulation</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1.5 block">Formulation Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ice Cream Stabilizer V3"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00B4D8] text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this formulation..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00B4D8] text-sm transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-mono uppercase mb-1.5 block">Version</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00B4D8] text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-mono uppercase mb-1.5 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'Draft' | 'Active' })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00B4D8] text-sm transition-colors"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1.5 block">Target Application *</label>
                <input
                  type="text"
                  value={form.targetApplication}
                  onChange={(e) => setForm({ ...form, targetApplication: e.target.value })}
                  placeholder="e.g. Ice Cream / Frozen Desserts"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00B4D8] text-sm transition-colors"
                />
              </div>
            </div>
            <div className="p-5 border-t border-[rgba(255,255,255,0.05)] flex justify-end gap-2 bg-zinc-900/30">
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button
                className="btn-primary disabled:opacity-50"
                onClick={handleCreate}
                disabled={!form.name.trim() || !form.targetApplication.trim()}
              >
                Create Formulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
