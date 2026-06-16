'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type KnowledgeNote } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Lightbulb, Plus, Search, Brain, Tag, Trash2, Edit2, Calendar, 
  ArrowRight, Sparkles, AlertCircle, BarChart3, TrendingUp, CheckCircle2
} from 'lucide-react';

const IMPACT_LEVELS = ['Low', 'Medium', 'High'] as const;
const IDEA_CATEGORIES = ['Business', 'Research', 'Content', 'Personal'] as const;
const KANBAN_STAGES = ['Raw Idea', 'Developing', 'Validated', 'Executing', 'Done'] as const;

export default function IdeasPage() {
  const notes = useLiveQuery(() => 
    db.knowledgeNotes.where('category').equals('Ideas').toArray()
  ) || [];

  // Capture Idea Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaTags, setIdeaTags] = useState('');
  const [ideaImpact, setIdeaImpact] = useState<typeof IMPACT_LEVELS[number]>('Medium');
  const [ideaCategory, setIdeaCategory] = useState<typeof IDEA_CATEGORIES[number]>('Business');
  const [ideaStage, setIdeaStage] = useState<typeof KANBAN_STAGES[number]>('Raw Idea');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImpact, setFilterImpact] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  // Selected detail card
  const [selectedIdea, setSelectedIdea] = useState<KnowledgeNote | null>(null);

  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;

    const tagsArray = ideaTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const contentData = {
      description: ideaDesc,
      impact: ideaImpact,
      ideaCategory: ideaCategory,
      stage: ideaStage
    };

    const noteData = {
      title: ideaTitle,
      category: 'Ideas' as const,
      tags: tagsArray,
      content: JSON.stringify(contentData),
      createdAt: new Date().toISOString()
    };

    if (editId !== null) {
      await db.knowledgeNotes.update(editId, {
        title: ideaTitle,
        tags: tagsArray,
        content: noteData.content
      });
      setEditId(null);
    } else {
      await db.knowledgeNotes.add(noteData);
    }

    setIdeaTitle('');
    setIdeaDesc('');
    setIdeaTags('');
    setIdeaImpact('Medium');
    setIdeaCategory('Business');
    setIdeaStage('Raw Idea');
    setIsModalOpen(false);
  };

  const handleEdit = (note: KnowledgeNote) => {
    if (note.id === undefined) return;
    try {
      const data = JSON.parse(note.content || '{}');
      setEditId(note.id);
      setIdeaTitle(note.title);
      setIdeaDesc(data.description || '');
      setIdeaTags(note.tags.join(', '));
      setIdeaImpact(data.impact || 'Medium');
      setIdeaCategory(data.ideaCategory || 'Business');
      setIdeaStage(data.stage || 'Raw Idea');
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this idea from vault?')) {
      await db.knowledgeNotes.delete(id);
      if (selectedIdea?.id === id) setSelectedIdea(null);
    }
  };

  const updateStage = async (id: number, nextStage: typeof KANBAN_STAGES[number]) => {
    const note = await db.knowledgeNotes.get(id);
    if (!note) return;
    try {
      const data = JSON.parse(note.content || '{}');
      data.stage = nextStage;
      await db.knowledgeNotes.update(id, { content: JSON.stringify(data) });
      
      // Update selected detail card if open
      if (selectedIdea?.id === id) {
        const updated = await db.knowledgeNotes.get(id);
        if (updated) setSelectedIdea(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalIdeas = notes.length;
  
  const executingCount = notes.filter(n => {
    try { return JSON.parse(n.content || '{}').stage === 'Executing'; } catch { return false; }
  }).length;
  
  const doneCount = notes.filter(n => {
    try { return JSON.parse(n.content || '{}').stage === 'Done'; } catch { return false; }
  }).length;

  const executingPct = totalIdeas > 0 ? Math.round((executingCount / totalIdeas) * 100) : 0;

  // Filter ideas
  const filteredIdeas = notes.filter(n => {
    let data = { description: '', impact: '', ideaCategory: '', stage: '' };
    try { data = JSON.parse(n.content || '{}'); } catch {}

    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          data.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImpact = filterImpact === 'All' || data.impact === filterImpact;
    const matchesCategory = filterCategory === 'All' || data.ideaCategory === filterCategory;

    return matchesSearch && matchesImpact && matchesCategory;
  });

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Innovation Hub</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-[#00B4D8]" />
            IDEA ENGINE
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Capture, develop, and execute strategic insights before they fade.
          </p>
        </div>

        <button
          onClick={() => { setEditId(null); setIsModalOpen(true); }}
          className="btn-primary text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" /> Capture Idea
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#006D77]/20 text-[#00B4D8]">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Captured</span>
            <span className="text-2xl font-bold font-serif text-slate-100">{totalIdeas} Ideas</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#f97316]/20 text-[#f97316]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Currently executing</span>
            <span className="text-2xl font-bold font-serif text-slate-100">{executingCount} ({executingPct}%)</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Completed / Done</span>
            <span className="text-2xl font-bold font-serif text-slate-100">{doneCount} Ideas</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-col gap-1.5 justify-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search descriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0B1220] border border-slate-800 rounded text-xs outline-none text-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <select
              value={filterImpact}
              onChange={e => setFilterImpact(e.target.value)}
              className="bg-[#0B1220] border border-slate-800 text-[10px] text-slate-300 p-1 rounded outline-none"
            >
              <option value="All">All Impact</option>
              {IMPACT_LEVELS.map(imp => <option key={imp} value={imp}>{imp} Impact</option>)}
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-[#0B1220] border border-slate-800 text-[10px] text-slate-300 p-1 rounded outline-none"
            >
              <option value="All">All Categories</option>
              {IDEA_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {KANBAN_STAGES.map(stage => {
          const stageIdeas = filteredIdeas.filter(n => {
            try { return JSON.parse(n.content || '{}').stage === stage; } catch { return false; }
          });

          return (
            <div key={stage} className="bg-[#0F172A] border border-slate-850 rounded-2xl p-4 flex flex-col gap-4 min-h-[450px]">
              
              {/* Stage Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">{stage}</span>
                <span className="bg-[#0B1220] text-[#00B4D8] px-2 py-0.5 rounded text-[10px] font-bold border border-slate-800">
                  {stageIdeas.length}
                </span>
              </div>

              {/* Cards Deck */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] scrollbar-thin pr-1">
                {stageIdeas.map(idea => {
                  let data = { description: '', impact: 'Medium', ideaCategory: 'Business' };
                  try { data = JSON.parse(idea.content || '{}'); } catch {}

                  return (
                    <div 
                      key={idea.id} 
                      onClick={() => setSelectedIdea(idea)}
                      className="bg-[#0B1220] border border-slate-850 hover:border-slate-750 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col gap-2.5 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold font-serif text-slate-200 leading-snug flex-1">{idea.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          data.impact === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          data.impact === 'Medium' ? 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {data.impact}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {data.description}
                      </p>

                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-850/50 pt-2">
                        <span className="bg-slate-900 border border-slate-850 px-1 rounded text-[8px]">
                          {data.ideaCategory}
                        </span>
                        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}

                {stageIdeas.length === 0 && (
                  <div className="py-8 text-center text-slate-600 text-[10px] font-mono border border-dashed border-slate-850 rounded-xl">
                    No ideas in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* IDEA DETAIL MODAL DRAWER */}
      {selectedIdea && (() => {
        let data = { description: '', impact: 'Medium', ideaCategory: 'Business', stage: 'Raw Idea' as const };
        try { data = JSON.parse(selectedIdea.content || '{}'); } catch {}

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
              
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#00B4D8] uppercase tracking-wider block">
                    {data.ideaCategory} • {data.impact} Impact
                  </span>
                  <h3 className="text-lg font-bold font-serif text-slate-200 mt-1">{selectedIdea.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedIdea(null)} 
                  className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                
                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Core Description</span>
                  <p className="bg-[#0B1220] border border-slate-850 p-3 rounded-lg text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {data.description || 'No description logged.'}
                  </p>
                </div>

                {/* Tags */}
                {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedIdea.tags.map((t, idx) => (
                        <span key={idx} className="bg-slate-850 px-2 py-0.5 rounded text-slate-400 text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Workflow advancing selector */}
                <div className="flex flex-col gap-1.5 border-t border-slate-850 pt-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Advance Stage Workflow</span>
                  <div className="flex flex-wrap gap-1.5">
                    {KANBAN_STAGES.map(stage => (
                      <button
                        key={stage}
                        onClick={() => updateStage(selectedIdea.id!, stage)}
                        className={`px-2 py-1 rounded font-mono text-[9px] uppercase font-bold border transition-all cursor-pointer ${
                          data.stage === stage 
                            ? 'bg-[#00B4D8]/10 border-[#00B4D8]/30 text-[#00B4D8]' 
                            : 'bg-[#0B1220] border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Developing / Project link options */}
                <div className="flex gap-3 border-t border-slate-850 pt-3">
                  
                  <a
                    href={`/knowledge-os/notes?title=${encodeURIComponent(selectedIdea.title)}`}
                    className="flex-1 border border-[#00B4D8]/20 bg-[#00B4D8]/5 text-[#00B4D8] hover:bg-[#00B4D8]/10 text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-center"
                  >
                    <Edit2 className="w-4 h-4" /> Develop Note Draft
                  </a>

                  <button
                    onClick={async () => {
                      // Link to new research project note
                      const newProj = {
                        title: `Project: ${selectedIdea.title}`,
                        category: 'Research' as const,
                        tags: ['project', 'from-idea'],
                        content: JSON.stringify({
                          description: `Developed from captured idea: ${data.description}`,
                          targetJournal: 'KAFS Internal Spec',
                          timeline: 'Q4 2026',
                          status: 'Idea'
                        }),
                        createdAt: new Date().toISOString()
                      };
                      await db.knowledgeNotes.add(newProj);
                      
                      // Mark idea as Executing
                      await updateStage(selectedIdea.id!, 'Executing');
                      alert('Linked successfully! Created a corresponding research project card.');
                    }}
                    className="flex-1 bg-gradient-to-r from-[#006D77] to-[#00B4D8] text-white hover:brightness-110 text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" /> Link to Project
                  </button>

                </div>

              </div>

              <div className="flex justify-between items-center border-t border-slate-800 pt-3 mt-2 text-[10px] text-slate-500 font-mono">
                <span>Created: {new Date(selectedIdea.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(selectedIdea)} 
                    className="text-[#00B4D8] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedIdea.id!)} 
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Delete Idea
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* CAPTURE IDEA INPUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {editId !== null ? 'Modify Captured Idea' : 'Capture New Strategic Idea'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveIdea} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Idea Title</label>
                <input
                  type="text"
                  value={ideaTitle}
                  onChange={e => setIdeaTitle(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  placeholder="e.g. Kappa-Gel Stabilizer Blend Trial"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium font-mono">Category</label>
                  <select
                    value={ideaCategory}
                    onChange={e => setIdeaCategory(e.target.value as any)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none"
                  >
                    {IDEA_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium font-mono">Impact</label>
                  <select
                    value={ideaImpact}
                    onChange={e => setIdeaImpact(e.target.value as any)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none"
                  >
                    {IMPACT_LEVELS.map(imp => <option key={imp} value={imp}>{imp} Impact</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Stage</label>
                <select
                  value={ideaStage}
                  onChange={e => setIdeaStage(e.target.value as any)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none"
                >
                  {KANBAN_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={ideaTags}
                  onChange={e => setIdeaTags(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  placeholder="e.g. milk, stabilizer, low-cost"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Description / Notes</label>
                <textarea
                  value={ideaDesc}
                  onChange={e => setIdeaDesc(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 h-24 text-xs text-slate-200 focus:border-slate-700 outline-none resize-none leading-relaxed font-mono"
                  placeholder="Write details of the idea, potential formulas, yield predictions or next steps..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Capture Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
