'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Microscope, Plus, BookOpen, Award, GraduationCap } from 'lucide-react';

interface Paper {
  id: number;
  title: string;
  authors: string;
  year: number;
  category: string;
  notes: string;
}

export default function ResearchPage() {
  const [papers, setPapers] = useState<Paper[]>([
    { id: 1, title: "Synergistic Gelation of Kappa-Carrageenan with Locust Bean Gum", authors: "K. Gourav, et al.", year: 2025, category: "Carrageenan", notes: "Excellent details on viscosity ratios and freeze-thaw stability parameters." },
    { id: 2, title: "Advanced Hydrocolloid Blending for Plant-based Dairy Alternatives", authors: "R. Sharma, K. Gourav", year: 2026, category: "Stabilizers", notes: "Outlines formulations targeting fat substitution and whey syneresis reduction." }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newCategory, setNewCategory] = useState('Carrageenan');
  const [newNotes, setNewNotes] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const paper: Paper = {
      id: Date.now(),
      title: newTitle,
      authors: newAuthors,
      year: parseInt(newYear) || 2026,
      category: newCategory,
      notes: newNotes
    };
    setPapers([paper, ...papers]);
    setNewTitle('');
    setNewAuthors('');
    setNewNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-blue-500" />
            Research OS
          </h1>
          <p className="text-sm text-zinc-400">Curate paper reviews, formulations research, patents, and track PhD milestones.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Literature
        </button>
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Log New Research Paper</span>}>
          <form onSubmit={handleAddPaper} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Paper Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Hydrocolloids viscosity dynamics"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Authors</label>
                <input 
                  type="text" 
                  value={newAuthors} 
                  onChange={e => setNewAuthors(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Kumar Gourav, R. Sen"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Publication Year</label>
                <input 
                  type="number" 
                  value={newYear} 
                  onChange={e => setNewYear(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                >
                  <option value="Carrageenan">Carrageenan Research</option>
                  <option value="Stabilizers">Stabilizers Blending</option>
                  <option value="Patents">Patents Analysis</option>
                  <option value="General">General Food Tech</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Synthesis & Key Insights</label>
              <textarea 
                value={newNotes} 
                onChange={e => setNewNotes(e.target.value)} 
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-250 focus:border-zinc-700 h-24 resize-none"
                placeholder="Synthesize formula ratios or regulatory concerns here..."
              />
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
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Review
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card header={<span className="text-zinc-200 font-semibold">Literature & Patents Library</span>}>
            <div className="flex flex-col gap-4">
              {papers.map((paper) => (
                <div key={paper.id} className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">{paper.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{paper.authors} • Published {paper.year}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded uppercase">
                      {paper.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850/50 mt-1">
                    {paper.notes}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* PhD Tracker */}
          <Card header={<span className="text-zinc-200 font-semibold">PhD Application Milestones</span>}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 border border-zinc-850 rounded-lg">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-zinc-200">Prepare SOP & Proposal</div>
                  <div className="text-[10px] text-zinc-500">Formulation target: Carrageenan structures</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Done</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-zinc-850 rounded-lg bg-zinc-950/40">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-zinc-200">Shortlist PhD Advisors</div>
                  <div className="text-[10px] text-zinc-500">Focus: IITs & NIFTEM faculty list</div>
                </div>
                <span className="text-[10px] text-amber-400 font-semibold">Active</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-zinc-850 rounded-lg bg-zinc-950/40">
                <Award className="w-4 h-4 text-zinc-500" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-zinc-200">Submit Abstract Draft</div>
                  <div className="text-[10px] text-zinc-500">Target journal: Food Chemistry</div>
                </div>
                <span className="text-[10px] text-zinc-500">Planned</span>
              </div>
            </div>
          </Card>

          {/* Conference Track */}
          <Card header={<span className="text-zinc-200 font-semibold">Upcoming Conferences</span>}>
            <div className="flex flex-col gap-3">
              <div className="py-2.5 border-b border-zinc-850">
                <div className="text-xs font-semibold text-zinc-200">International Hydrocolloids Conference</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Sept 12-16, 2026 • New Delhi</div>
              </div>
              <div className="py-2.5 last:border-none">
                <div className="text-xs font-semibold text-zinc-200">National Food Processing Summit</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Nov 04-06, 2026 • Mumbai</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
