'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type KnowledgeNote } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Brain, Search, BookOpen, Lightbulb, FileText, Sparkles, ArrowRight,
  TrendingUp, Calendar, Compass, List, HelpCircle, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeOSDashboard() {
  const notes = useLiveQuery(() => db.knowledgeNotes.toArray()) || [];

  // Semantic query state
  const [qaInput, setQaInput] = useState('');
  const [qaResponse, setQaResponse] = useState('');
  const [qaLoading, setQaLoading] = useState(false);

  // Group notes by category / tags
  const noteItems = notes.filter(n => n.category === 'Notes' || (n.tags && !n.tags.includes('book') && !n.tags.includes('project') && !n.tags.includes('phd-application')));
  const ideaItems = notes.filter(n => n.category === 'Ideas' || (n.tags && n.tags.includes('idea')));
  const bookItems = notes.filter(n => n.tags && n.tags.includes('book'));

  const recentNotes = [...notes]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const handleSemanticQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;

    setQaLoading(true);
    setQaResponse('');

    setTimeout(() => {
      // Find matching keywords from notes database
      const queryLower = qaInput.toLowerCase();
      const matches = notes.filter(n => 
        n.title.toLowerCase().includes(queryLower) || 
        (n.content && n.content.toLowerCase().includes(queryLower))
      );

      setQaLoading(false);
      if (matches.length > 0) {
        const refs = matches.map(m => `[[${m.title}]]`).join(', ');
        setQaResponse(
          `AI RETRIEVAL REPORT (SIMULATED GPT-4o):\n\nI located ${matches.length} relevant context documents in your Second Brain:\n• The primary source is ${matches[0].title}, which highlights: "${matches[0].content?.substring(0, 120)}..."\n\nSynthesis of findings:\n• Your notes establish a core connection between these topics.\n• Key reference vectors: ${refs}\n\nSuggested next action:\n• Link these entities to your active PhD formulation projects.`
        );
      } else {
        setQaResponse(
          `AI RETRIEVAL REPORT (SIMULATED GPT-4o):\n\nNo direct matches found for "${qaInput}" in your local knowledge vault.\n\nSuggested action:\n• Initialize a new concept note for this topic in the Second Brain editor.\n• Query external literature databases using the Research OS module.`
        );
      }
    }, 1200);
  };

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Obsidian Cognitive Hub</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#00B4D8]" />
            KNOWLEDGE OS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your Second Brain digital twin. Retrieve conceptual notes, catalog reading lists, and execute ideas.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/knowledge-os/notes" className="hover:scale-[1.02] transition-transform">
          <Card className="h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">TOTAL NOTES</span>
                <span className="text-3xl font-bold font-serif text-[#00B4D8]">{noteItems.length} Files</span>
              </div>
              <FileText className="w-8 h-8 text-[#00B4D8]/20" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3 block flex items-center gap-1">
              Open editor workspace <ArrowUpRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>

        <Link href="/knowledge-os/ideas" className="hover:scale-[1.02] transition-transform">
          <Card className="h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">STRATEGIC IDEAS</span>
                <span className="text-3xl font-bold font-serif text-[#D4A017]">{ideaItems.length} Concepts</span>
              </div>
              <Lightbulb className="w-8 h-8 text-[#D4A017]/20" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3 block flex items-center gap-1">
              Open idea kanban board <ArrowUpRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>

        <Link href="/knowledge-os/books" className="hover:scale-[1.02] transition-transform">
          <Card className="h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">BOOKS LOGGED</span>
                <span className="text-3xl font-bold font-serif text-emerald-400">{bookItems.length} Titles</span>
              </div>
              <BookOpen className="w-8 h-8 text-emerald-400/20" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3 block flex items-center gap-1">
              Open reading lists tracker <ArrowUpRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>

        <Link href="/knowledge" className="hover:scale-[1.02] transition-transform">
          <Card className="h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">CONCEPT MAP</span>
                <span className="text-3xl font-bold font-serif text-purple-400">{notes.length} Nodes</span>
              </div>
              <Brain className="w-8 h-8 text-purple-400/20" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3 block flex items-center gap-1">
              Open concept relation graph <ArrowUpRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>
      </div>

      {/* Semantic QA and Recent Captures Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: AI Q&A Engine (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card header={
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00B4D8] animate-pulse" />
              Semantic Brain Retrieval Engine
            </span>
          }>
            <form onSubmit={handleSemanticQA} className="flex flex-col gap-4">
              <p className="text-xs text-slate-400">
                Ask a conceptual question to retrieve and synthesize relevant highlights across your entire notes archive.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qaInput}
                  onChange={e => setQaInput(e.target.value)}
                  placeholder="e.g. What is my formulation research on carrageenan and plant-milk stability?"
                  className="flex-1 bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={qaLoading}
                  className="btn-primary text-xs px-4 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {qaLoading ? 'Searching...' : 'Retrieve'}
                </button>
              </div>

              {qaResponse && (
                <div className="bg-[#1A2332]/50 border border-[#00B4D8]/20 p-4 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed relative animate-fade-in">
                  <button 
                    type="button"
                    onClick={() => setQaResponse('')}
                    className="absolute top-2 right-3 text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                  {qaResponse}
                </div>
              )}
            </form>
          </Card>

          {/* Quick Concept Navigation Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0F172A] border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
              <h4 className="text-xs font-bold font-serif text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#00B4D8]" /> 
                Second Brain Workflow
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When reading literature in <strong>Research OS</strong>, capture key quotes as notes and tag them as <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">#literature-ref</code>. Link them to active KAFS projects.
              </p>
            </div>
            <div className="bg-[#0F172A] border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
              <h4 className="text-xs font-bold font-serif text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#D4A017]" /> 
                Spaced Repetition
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use tags like <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">#exam-topic</code> in notes to link study material to your government exam preparation scheduler.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Recent Captures Directory (1/3 width) */}
        <div className="lg:col-span-1">
          <Card header={<span className="text-sm font-semibold text-slate-200">Recent Captures</span>}>
            <div className="flex flex-col gap-3">
              {recentNotes.map(note => (
                <div key={note.id} className="p-3 border border-slate-850 bg-[#0B1220]/60 rounded-xl flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{note.title}</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase flex-shrink-0">{note.category}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content || <em className="text-slate-650">Empty content</em>}
                  </p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-850/30 pt-1.5 mt-0.5">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <Link
                      href={
                        note.category === 'Ideas' ? '/knowledge-os/ideas' :
                        note.tags.includes('book') ? '/knowledge-os/books' :
                        '/knowledge-os/notes'
                      }
                      className="text-[#00B4D8] hover:underline flex items-center gap-0.5 font-bold"
                    >
                      Open <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
              
              {recentNotes.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No concept notes created yet.
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
