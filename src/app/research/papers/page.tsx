'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ResearchPaper } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Microscope, Plus, FileText, ChevronDown, ChevronUp, Copy, ExternalLink,
  Search, Filter, BookOpen, Trash2, Edit2, Calendar, Clipboard, Check
} from 'lucide-react';

const TOPICS = [
  'Carrageenan Research',
  'Stabilizers Blending',
  'Patents Analysis',
  'General Food Tech',
  'Plant-based Emulsions',
  'Rheology & Texture'
];

export default function PapersLibraryPage() {
  const papers = useLiveQuery(() => db.researchPapers.toArray()) || [];

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [year, setYear] = useState('2026');
  const [doi, setDoi] = useState('');
  const [abstract, setAbstract] = useState('');
  const [topic, setTopic] = useState('Carrageenan Research');
  const [status, setStatus] = useState<ResearchPaper['status']>('Planned');
  const [citations, setCitations] = useState('0');

  // Bulk Import state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkDois, setBulkDois] = useState('');

  // Selected paper detail modal
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isCopiedBulk, setIsCopiedBulk] = useState(false);

  // Expanded card abstracts
  const [expandedPaperIds, setExpandedPaperIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedPaperIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const paperData: Omit<ResearchPaper, 'id' | 'createdAt'> = {
      title,
      authors,
      journal,
      year,
      doi,
      abstract,
      topic,
      status,
      citations: parseInt(citations) || 0
    };

    if (editId !== null) {
      await db.researchPapers.update(editId, paperData);
      setEditId(null);
    } else {
      await db.researchPapers.add({ ...paperData, createdAt: new Date().toISOString() });
    }

    // Reset Form
    setTitle('');
    setAuthors('');
    setJournal('');
    setYear('2026');
    setDoi('');
    setAbstract('');
    setTopic('Carrageenan Research');
    setStatus('Planned');
    setCitations('0');
    setIsModalOpen(false);
  };

  const handleEdit = (p: ResearchPaper) => {
    if (p.id === undefined) return;
    setEditId(p.id);
    setTitle(p.title);
    setAuthors(p.authors || '');
    setJournal(p.journal || '');
    setYear(p.year || '2026');
    setDoi(p.doi || '');
    setAbstract(p.abstract || '');
    setTopic(p.topic || 'Carrageenan Research');
    setStatus(p.status || 'Planned');
    setCitations(p.citations?.toString() || '0');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this literature record?')) {
      await db.researchPapers.delete(id);
      if (selectedPaper?.id === id) setSelectedPaper(null);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkDois.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    for (const rawLine of lines) {
      // Very basic parser or placeholder simulator
      let cleanDoi = rawLine;
      let mockTitle = `Imported Literature Ref: ${rawLine.substring(0, 15)}...`;
      if (rawLine.includes(';')) {
        const parts = rawLine.split(';');
        cleanDoi = parts[0].trim();
        mockTitle = parts[1]?.trim() || mockTitle;
      }

      await db.researchPapers.add({
        title: mockTitle,
        doi: cleanDoi,
        topic: 'General Food Tech',
        status: 'Planned',
        year: '2026',
        authors: 'Unknown Imported Author',
        journal: 'BioMed Central / Online Import',
        abstract: `Automatic index of DOI Reference: ${cleanDoi}. Ready for full text crawl or manual synthesis update.`,
        citations: 0,
        createdAt: new Date().toISOString()
      });
    }

    setBulkDois('');
    setIsBulkOpen(false);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAPACitation = (p: ResearchPaper) => {
    return `${p.authors || 'Gourav, K.'} (${p.year || '2026'}). ${p.title}. ${p.journal || 'KAFS Internal Press'}. ${p.doi ? `https://doi.org/${p.doi}` : ''}`;
  };

  // Extract unique years
  const availableYears = Array.from(new Set(papers.map(p => p.year).filter(Boolean))).sort();

  // Filter papers
  const filteredPapers = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.abstract && p.abstract.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.authors && p.authors.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopic === 'All' || p.topic === selectedTopic;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const matchesYear = selectedYear === 'All' || p.year === selectedYear;
    return matchesSearch && matchesTopic && matchesStatus && matchesYear;
  });

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-mono mb-1">
            <a href="/research" className="hover:underline">Research OS</a>
            <span>/</span>
            <span>Papers Library</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#00B4D8]" />
            LITERATURE DATABASE
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Master repository of academic journal papers, clinical trials, and prior art references.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="px-4 py-2 border border-slate-800 bg-[#0F172A] hover:bg-[#1A2332] text-xs rounded-lg font-semibold flex items-center gap-2 cursor-pointer text-slate-300"
          >
            Bulk DOI Import
          </button>
          <button
            onClick={() => { setEditId(null); setIsModalOpen(true); }}
            className="btn-primary text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Paper
          </button>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card header={<span className="text-xs font-mono tracking-widest text-[#D4A017] uppercase">Filter Library</span>}>
            <div className="flex flex-col gap-4">
              
              {/* Search input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search text..."
                    className="w-full bg-[#0B1220] border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs outline-none text-slate-200 focus:border-slate-700"
                  />
                </div>
              </div>

              {/* Topic */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Topic Domain</label>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                >
                  <option value="All">All Domains</option>
                  {TOPICS.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Review Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Planned">Planned</option>
                  <option value="Reading">Reading</option>
                  <option value="Summarized">Summarized</option>
                  <option value="Referenced">Referenced</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Publication Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                >
                  <option value="All">All Years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedTopic !== 'All' || selectedStatus !== 'All' || selectedYear !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTopic('All');
                    setSelectedStatus('All');
                    setSelectedYear('All');
                  }}
                  className="text-center text-xs text-[#00B4D8] hover:underline pt-2 cursor-pointer font-semibold"
                >
                  Reset Filters
                </button>
              )}

            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 text-xs">
            <h4 className="font-mono font-bold uppercase text-slate-400 tracking-wider">Index Metrics</h4>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400">Total Cataloged:</span>
              <span className="font-bold text-slate-100">{papers.length}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400">Filtered View:</span>
              <span className="font-bold text-[#00B4D8]">{filteredPapers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mean Citation Count:</span>
              <span className="font-bold text-[#D4A017]">
                {papers.length > 0 ? (papers.reduce((sum, p) => sum + (p.citations || 0), 0) / papers.length).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Papers Deck */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredPapers.map(p => {
              const isExpanded = expandedPaperIds.includes(p.id!);
              return (
                <div key={p.id} className="bg-[#0F172A] border border-slate-850 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-[#006D77]/20 border border-[#006D77]/30 text-[#00B4D8] rounded">
                          {p.topic}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider rounded border ${
                          p.status === 'Completed' || p.status === 'Referenced' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          p.status === 'Reading' || p.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-slate-100 font-serif leading-snug">{p.title}</h3>
                      <p className="text-xs text-slate-400 italic">By: {p.authors || 'Unknown'}</p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500 font-mono block">{p.journal || 'KAFS Press'}</span>
                      <span className="text-[#D4A017] font-semibold block">★ {p.citations || 0} Citations</span>
                      <span className="text-slate-400 font-mono">{p.year}</span>
                    </div>
                  </div>

                  {/* Abstract Preview / Expansion */}
                  {p.abstract && (
                    <div className="text-xs text-slate-400 leading-relaxed">
                      <p className={isExpanded ? '' : 'line-clamp-3'}>
                        {p.abstract}
                      </p>
                      
                      <button
                        onClick={() => toggleExpand(p.id!)}
                        className="text-[10px] text-[#00B4D8] hover:underline flex items-center gap-1 mt-1 font-mono cursor-pointer"
                      >
                        {isExpanded ? (
                          <>Collapse Abstract <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Read Full Abstract <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Footer control actions */}
                  <div className="flex justify-between items-center border-t border-slate-850 pt-3 mt-1 text-[11px]">
                    <div className="flex items-center gap-4">
                      {p.doi ? (
                        <a 
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00B4D8] hover:underline flex items-center gap-1 font-mono"
                        >
                          DOI Reference <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600 font-mono">No External Link</span>
                      )}
                      
                      <button
                        onClick={() => copyToClipboard(getAPACitation(p), p.id!)}
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono cursor-pointer"
                      >
                        {copiedId === p.id ? 'APA Copied!' : 'Copy APA Citation'}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPaper(p)}
                        className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded cursor-pointer font-mono"
                      >
                        Details Matrix
                      </button>
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id!)}
                        className="bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-red-400 px-2 py-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPapers.length === 0 && (
              <div className="bg-[#0F172A] border border-slate-850 p-12 text-center text-slate-400 rounded-xl">
                No literature cataloged matching criteria. Click "Add Paper" to catalog a paper.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PAPER ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {editId !== null ? 'Modify Literature Record' : 'Index New Research Literature'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSavePaper} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Paper Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-slate-700 outline-none"
                    placeholder="e.g. Synergistic effects of alginate mixtures"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Authors</label>
                  <input
                    type="text"
                    value={authors}
                    onChange={e => setAuthors(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-slate-700 outline-none"
                    placeholder="e.g. Kumar Gourav, A. Gupta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Journal</label>
                  <input
                    type="text"
                    value={journal}
                    onChange={e => setJournal(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                    placeholder="e.g. Food Hydrocolloids"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">DOI</label>
                  <input
                    type="text"
                    value={doi}
                    onChange={e => setDoi(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                    placeholder="e.g. 10.1016/..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Citations</label>
                  <input
                    type="number"
                    value={citations}
                    onChange={e => setCitations(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Topic Domain</label>
                  <select
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:border-zinc-700 outline-none"
                  >
                    {TOPICS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Review Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:border-zinc-700 outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Reading">Reading</option>
                    <option value="Summarized">Summarized</option>
                    <option value="Referenced">Referenced</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Full Abstract / Synthetic Notes</label>
                <textarea
                  value={abstract}
                  onChange={e => setAbstract(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 h-28 text-xs text-slate-200 focus:border-zinc-700 outline-none resize-none leading-relaxed font-mono"
                  placeholder="Paste abstract or outline key scientific equations and sensory properties here..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 text-xs rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary text-xs rounded font-semibold cursor-pointer"
                >
                  Save Literature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">Bulk DOI Reference Indexer</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleBulkImport} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">List of DOIs (One per line)</label>
                <textarea
                  value={bulkDois}
                  onChange={e => setBulkDois(e.target.value)}
                  rows={6}
                  placeholder="10.1016/j.jfoodhyd.2024.10892&#10;10.1111/1471-0307.13120&#10;10.56042/ijms.v52i02.7214"
                  className="bg-[#0B1220] border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 outline-none focus:border-slate-700"
                  required
                />
                <p className="text-[10px] text-slate-500 italic">
                  Note: You can add optional title label separated by semicolon, e.g. "10.1016/doi; Alginate Viscosity Study"
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsBulkOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Import References
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAPER MATRIX DETAIL MODAL */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 flex flex-col gap-4 shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-mono text-[#00B4D8] uppercase tracking-wider block">
                  {selectedPaper.topic} • {selectedPaper.year}
                </span>
                <h2 className="text-lg font-bold font-serif text-slate-200 mt-1">{selectedPaper.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedPaper(null)} 
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0B1220]/60 p-3 rounded-lg border border-slate-850">
                <div>
                  <span className="text-slate-500 font-mono block text-[9px]">AUTHORS</span>
                  <span className="font-semibold text-slate-300">{selectedPaper.authors || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block text-[9px]">JOURNAL</span>
                  <span className="font-semibold text-slate-300">{selectedPaper.journal || 'Internal'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block text-[9px]">CITATIONS</span>
                  <span className="font-semibold text-[#D4A017]">{selectedPaper.citations || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block text-[9px]">STATUS</span>
                  <span className="font-semibold text-slate-300">{selectedPaper.status}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-slate-200 font-mono uppercase text-[10px]">Academic Abstract</h4>
                <div className="bg-[#0B1220] p-3 rounded border border-slate-850 whitespace-pre-line leading-relaxed">
                  {selectedPaper.abstract || 'No abstract text logged.'}
                </div>
              </div>

              {/* simulated AI summary panel */}
              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-slate-200 font-mono uppercase text-[10px] flex items-center gap-1.5">
                  <span>AI Summary Synthesis</span>
                  <span className="bg-[#00B4D8]/10 text-[#00B4D8] px-1.5 py-0.5 rounded text-[8px]">GPT-4o Simulation</span>
                </h4>
                <div className="bg-[#1A2332]/40 p-4 border border-[#00B4D8]/20 rounded-lg text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                  {selectedPaper.abstract ? (
                    (() => {
                      const sents = selectedPaper.abstract.match(/[^.!?]+[.!?]+/g) || [selectedPaper.abstract];
                      const bullets = sents.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');
                      return `KEY FINDINGS:\n${bullets}\n\nKAFS TRANSLATIONAL UTILITY:\n• Formulates specific concentration bounds for ${selectedPaper.topic}.\n• Suggests optimal pasteurization cycles based on structural rheology parameters.`;
                    })()
                  ) : (
                    'No abstract text to synthesize AI Summary.'
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-2">
              <span className="text-[10px] font-mono text-slate-500">
                Created: {new Date(selectedPaper.createdAt || '').toLocaleDateString()}
              </span>
              
              <div className="flex gap-2">
                {selectedPaper.doi && (
                  <a
                    href={`https://doi.org/${selectedPaper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer text-xs"
                  >
                    Open DOI Publisher <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => copyToClipboard(getAPACitation(selectedPaper), selectedPaper.id!)}
                  className="btn-primary px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  {copiedId === selectedPaper.id ? 'Copied Citation!' : 'Copy Citation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
