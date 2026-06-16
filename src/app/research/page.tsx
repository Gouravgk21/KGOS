'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ResearchPaper, type KnowledgeNote } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Microscope, Plus, BookOpen, Award, GraduationCap, Trash2, Edit2, 
  ChevronRight, ArrowRight, Eye, Star, FileText, CheckCircle2, 
  Search, Filter, Briefcase, Calendar, Link as LinkIcon, DollarSign, Brain, FileCheck, Clipboard
} from 'lucide-react';

const TOPICS = [
  'Carrageenan Research',
  'Stabilizers Blending',
  'Patents Analysis',
  'General Food Tech',
  'Plant-based Emulsions',
  'Rheology & Texture'
];

const PUBLIC_PUBLICATIONS = [
  {
    title: 'Synergistic Gelation in Seaweed Polysaccharide Blends',
    journal: 'Journal of Food Hydrocolloids (Vol. 44)',
    year: '2024',
    authors: 'Kumar Gourav, R. Sharma, S. Nair',
    abstract: 'Investigation of structural synergy between Kappa-2 and Iota Carrageenan fractions. Modeled viscoelastic transitions under rapid temperature cooling cycles to maximize gel strength while reducing syneresis in plant-based milk products.',
    doi: '10.1016/j.jfoodhyd.2024.10892',
    citations: 24
  },
  {
    title: 'Predictive Viscosity Equations for Cocoa-Dairy Gels',
    journal: 'International Journal of Dairy Technology',
    year: '2025',
    authors: 'Kumar Gourav, S. Nair',
    abstract: 'Established a mathematical model predicting particle suspension stability of cocoa solids in milk matrices. Validated equations using automated viscometer data over a 60-day shelf-life window.',
    doi: '10.1111/1471-0307.13120',
    citations: 18
  },
  {
    title: 'Enzyme-Assisted Extraction of Rhodophyta Hydrocolloids',
    journal: 'Indian Journal of Marine Sciences',
    year: '2023',
    authors: 'Kumar Gourav, K. Gupta',
    abstract: 'Optimization study utilizing cellulose-based enzymes to break seaweed cell walls before extraction. Reported a 22% increase in polysaccharide yield with significantly lower heavy metal retention.',
    doi: '10.56042/ijms.v52i02.7214',
    citations: 8
  }
];

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<'papers' | 'projects' | 'phd' | 'publications'>('papers');
  
  // DEXIE Live Queries
  const papers = useLiveQuery(() => db.researchPapers.toArray()) || [];
  const projects = useLiveQuery(() => 
    db.knowledgeNotes.where('category').equals('Research').toArray()
  ) || [];
  
  // Extract project-tagged and phd-application notes
  const researchProjects = projects.filter(p => p.tags && p.tags.includes('project'));
  const phdApplications = projects.filter(p => p.tags && p.tags.includes('phd-application'));
  const scholarships = projects.filter(p => p.tags && p.tags.includes('scholarship'));

  // Stats
  const totalPapers = papers.length;
  const readingPapers = papers.filter(p => p.status === 'Reading').length;
  const summarizedPapers = papers.filter(p => p.status === 'Summarized').length;
  const activeProjectsCount = researchProjects.filter(p => {
    try {
      const data = JSON.parse(p.content || '{}');
      return data.status !== 'Published';
    } catch {
      return true;
    }
  }).length;
  const phdAppsCount = phdApplications.length;

  // TAB 1: PAPERS STATES & LOGIC
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperEditId, setPaperEditId] = useState<number | null>(null);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperJournal, setPaperJournal] = useState('');
  const [paperYear, setPaperYear] = useState('2026');
  const [paperDoi, setPaperDoi] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [paperTopic, setPaperTopic] = useState('Carrageenan Research');
  const [paperStatus, setPaperStatus] = useState<ResearchPaper['status']>('Planned');
  const [paperCitations, setPaperCitations] = useState('0');

  const [paperFilterTopic, setPaperFilterTopic] = useState('All');
  const [paperFilterStatus, setPaperFilterStatus] = useState('All');
  const [paperSearchQuery, setPaperSearchQuery] = useState('');

  // AI Summary simulation state
  const [aiSummaryPaperId, setAiSummaryPaperId] = useState<number | null>(null);
  const [aiSummaryContent, setAiSummaryContent] = useState('');

  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;

    const paperData: Omit<ResearchPaper, 'id' | 'createdAt'> = {
      title: paperTitle,
      authors: paperAuthors,
      journal: paperJournal,
      year: paperYear,
      doi: paperDoi,
      abstract: paperAbstract,
      topic: paperTopic,
      status: paperStatus,
      citations: parseInt(paperCitations) || 0
    };

    if (paperEditId !== null) {
      await db.researchPapers.update(paperEditId, paperData);
      setPaperEditId(null);
    } else {
      await db.researchPapers.add({ ...paperData, createdAt: new Date().toISOString() });
    }

    // Reset Form
    setPaperTitle('');
    setPaperAuthors('');
    setPaperJournal('');
    setPaperYear('2026');
    setPaperDoi('');
    setPaperAbstract('');
    setPaperTopic('Carrageenan Research');
    setPaperStatus('Planned');
    setPaperCitations('0');
    setIsPaperModalOpen(false);
  };

  const handleEditPaper = (p: ResearchPaper) => {
    if (p.id === undefined) return;
    setPaperEditId(p.id);
    setPaperTitle(p.title);
    setPaperAuthors(p.authors || '');
    setPaperJournal(p.journal || '');
    setPaperYear(p.year || '2026');
    setPaperDoi(p.doi || '');
    setPaperAbstract(p.abstract || '');
    setPaperTopic(p.topic || 'Carrageenan Research');
    setPaperStatus(p.status || 'Planned');
    setPaperCitations(p.citations?.toString() || '0');
    setIsPaperModalOpen(true);
  };

  const handleDeletePaper = async (id: number) => {
    if (confirm('Are you sure you want to delete this paper?')) {
      await db.researchPapers.delete(id);
    }
  };

  const generateAISummary = (p: ResearchPaper) => {
    if (!p.abstract) {
      setAiSummaryContent('No abstract available to generate AI Summary.');
      setAiSummaryPaperId(p.id || null);
      return;
    }
    // Client-side simulation: take first 3 sentences and format as bullet points
    const sentences = p.abstract.match(/[^.!?]+[.!?]+/g) || [p.abstract];
    const bulletPoints = sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');
    const finalSummary = `AI-GENERATED SYNTHESIS (SIMULATED GPT-4o):\n\nKey Core Findings:\n${bulletPoints}\n\nRelevance to KAFS:\n• Establishes baseline formulation bounds for ${p.topic}.\n• Highlights critical processing parameters for seaweed-derived stabilizers.`;
    
    setAiSummaryContent(finalSummary);
    setAiSummaryPaperId(p.id || null);
  };

  // TAB 2: PROJECTS STATES & LOGIC
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectJournal, setProjectJournal] = useState('');
  const [projectTimeline, setProjectTimeline] = useState('');
  const [projectStatus, setProjectStatus] = useState<'Idea' | 'Literature Review' | 'Experimenting' | 'Writing' | 'Submitted' | 'Published'>('Idea');
  const [projectEditId, setProjectEditId] = useState<number | null>(null);

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const projectData = {
      title: projectTitle,
      category: 'Research' as const,
      tags: ['project'],
      content: JSON.stringify({
        description: projectDesc,
        targetJournal: projectJournal,
        timeline: projectTimeline,
        status: projectStatus,
        linkedPapersCount: 0
      }),
      createdAt: new Date().toISOString()
    };

    if (projectEditId !== null) {
      await db.knowledgeNotes.update(projectEditId, {
        title: projectTitle,
        content: projectData.content
      });
      setProjectEditId(null);
    } else {
      await db.knowledgeNotes.add(projectData);
    }

    setProjectTitle('');
    setProjectDesc('');
    setProjectJournal('');
    setProjectTimeline('');
    setProjectStatus('Idea');
    setIsProjectModalOpen(false);
  };

  const handleEditProject = (note: KnowledgeNote) => {
    if (note.id === undefined) return;
    try {
      const data = JSON.parse(note.content || '{}');
      setProjectEditId(note.id);
      setProjectTitle(note.title);
      setProjectDesc(data.description || '');
      setProjectJournal(data.targetJournal || '');
      setProjectTimeline(data.timeline || '');
      setProjectStatus(data.status || 'Idea');
      setIsProjectModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // TAB 3: PhD TRACKER STATES & LOGIC
  const [isPhdModalOpen, setIsPhdModalOpen] = useState(false);
  const [uniName, setUniName] = useState('');
  const [uniCountry, setUniCountry] = useState('');
  const [uniProgram, setUniProgram] = useState('');
  const [uniDeadline, setUniDeadline] = useState('');
  const [uniProf, setUniProf] = useState('');
  const [uniEmail, setUniEmail] = useState('');
  const [uniStatus, setUniStatus] = useState<'Researching' | 'Contacted' | 'Applied' | 'Accepted' | 'Rejected'>('Researching');
  const [uniEditId, setUniEditId] = useState<number | null>(null);

  // Funding tracker states
  const [fundName, setFundName] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundDeadline, setFundDeadline] = useState('');
  const [fundStatus, setFundStatus] = useState('Applied');

  // Statement editor state
  const [statementText, setStatementText] = useState('Kumar Gourav - Statement of Purpose Draft. My research focus is on the molecular dynamics of carrageenan fractions and their synergistic gelation profiles with plant proteins. Over the next 5 years, I plan to develop next-generation food hydrocolloids that are resilient to thermal pasteurization and exhibit low syneresis. Kumar Advanced Food Systems (KAFS) serves as my private experimental lab...');
  
  const handleUniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniName.trim()) return;

    const uniData = {
      title: uniName,
      category: 'Research' as const,
      tags: ['phd-application'],
      content: JSON.stringify({
        country: uniCountry,
        program: uniProgram,
        deadline: uniDeadline,
        professor: uniProf,
        email: uniEmail,
        status: uniStatus
      }),
      createdAt: new Date().toISOString()
    };

    if (uniEditId !== null) {
      await db.knowledgeNotes.update(uniEditId, {
        title: uniName,
        content: uniData.content
      });
      setUniEditId(null);
    } else {
      await db.knowledgeNotes.add(uniData);
    }

    setUniName('');
    setUniCountry('');
    setUniProgram('');
    setUniDeadline('');
    setUniProf('');
    setUniEmail('');
    setUniStatus('Researching');
    setIsPhdModalOpen(false);
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName.trim()) return;

    const fundData = {
      title: fundName,
      category: 'Research' as const,
      tags: ['scholarship'],
      content: JSON.stringify({
        amount: fundAmount,
        deadline: fundDeadline,
        status: fundStatus
      }),
      createdAt: new Date().toISOString()
    };

    await db.knowledgeNotes.add(fundData);
    setFundName('');
    setFundAmount('');
    setFundDeadline('');
    setFundStatus('Applied');
  };

  // Publications tab calculations
  const myCompletedPapers = papers.filter(p => p.status === 'Completed' || p.status === 'Referenced');
  const allPubs = [...PUBLIC_PUBLICATIONS, ...myCompletedPapers.map(p => ({
    title: p.title,
    journal: p.journal || 'Internal KAFS Publications',
    year: p.year || '2026',
    authors: p.authors || 'Kumar Gourav',
    abstract: p.abstract || '',
    doi: p.doi || 'Internal Spec',
    citations: p.citations || 0
  }))];

  const totalCitations = allPubs.reduce((acc, curr) => acc + curr.citations, 0);
  
  // Simple h-index calculator: sort citations descending, find where citations >= index
  const sortedCits = allPubs.map(p => p.citations).sort((a, b) => b - a);
  let hIndex = 0;
  for (let i = 0; i < sortedCits.length; i++) {
    if (sortedCits[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }

  // Filter papers
  const filteredPapers = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(paperSearchQuery.toLowerCase()) || 
                          (p.abstract && p.abstract.toLowerCase().includes(paperSearchQuery.toLowerCase())) ||
                          (p.authors && p.authors.toLowerCase().includes(paperSearchQuery.toLowerCase()));
    const matchesTopic = paperFilterTopic === 'All' || p.topic === paperFilterTopic;
    const matchesStatus = paperFilterStatus === 'All' || p.status === paperFilterStatus;
    return matchesSearch && matchesTopic && matchesStatus;
  });

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">KAFS RESEARCH MATRIX</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 tracking-wider flex items-center gap-3">
            <Microscope className="w-8 h-8 text-[#00B4D8]" />
            RESEARCH OS
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Integrate literature, manage research projects, track PhD applications and index publication citations.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-[#0F172A] border border-slate-800 p-1.5 rounded-xl">
          {(['papers', 'projects', 'phd', 'publications'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-[#006D77] to-[#00B4D8] text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'phd' ? 'PhD Tracker' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDEBAR STATISTICS */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card header={<span className="text-xs font-mono tracking-widest text-[#D4A017] uppercase">System Overview</span>}>
            <div className="flex flex-col gap-4">
              <div className="border-l-2 border-[#00B4D8] pl-3 py-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Literature</span>
                <span className="text-2xl font-bold text-slate-100">{totalPapers} Papers</span>
              </div>
              <div className="border-l-2 border-[#D4A017] pl-3 py-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">In Progress reading</span>
                <span className="text-2xl font-bold text-slate-100">{readingPapers} Papers</span>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3 py-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Summarized & Synced</span>
                <span className="text-2xl font-bold text-slate-100">{summarizedPapers} Papers</span>
              </div>
              <div className="border-l-2 border-[#006D77] pl-3 py-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Projects</span>
                <span className="text-2xl font-bold text-slate-100">{activeProjectsCount} Milestones</span>
              </div>
              <div className="border-l-2 border-purple-500 pl-3 py-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">PhD Applications</span>
                <span className="text-2xl font-bold text-slate-100">{phdAppsCount} Saved</span>
              </div>
            </div>
          </Card>

          {/* Quick link shortcuts */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Quick Actions</h4>
            {activeTab === 'papers' && (
              <button 
                onClick={() => { setPaperEditId(null); setIsPaperModalOpen(true); }}
                className="w-full btn-primary text-xs text-center flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Literature Record
              </button>
            )}
            {activeTab === 'projects' && (
              <button 
                onClick={() => { setProjectEditId(null); setIsProjectModalOpen(true); }}
                className="w-full btn-primary text-xs text-center flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Research Project
              </button>
            )}
            {activeTab === 'phd' && (
              <button 
                onClick={() => { setUniEditId(null); setIsPhdModalOpen(true); }}
                className="w-full btn-primary text-xs text-center flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add University Target
              </button>
            )}
            <a 
              href="/research/papers"
              className="w-full border border-[#00B4D8]/20 bg-[#00B4D8]/5 text-[#00B4D8] hover:bg-[#00B4D8]/10 text-xs py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-center"
            >
              <FileText className="w-4 h-4" /> Open Papers Library →
            </a>
          </div>
        </div>

        {/* MAIN DISPLAY WORKSPACE */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* TAB 1: PAPERS VIEW */}
          {activeTab === 'papers' && (
            <div className="flex flex-col gap-6">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search titles, abstracts, authors..."
                    value={paperSearchQuery}
                    onChange={e => setPaperSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700"
                  />
                </div>
                <div>
                  <select
                    value={paperFilterTopic}
                    onChange={e => setPaperFilterTopic(e.target.value)}
                    className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                  >
                    <option value="All">All Topics</option>
                    {TOPICS.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={paperFilterStatus}
                    onChange={e => setPaperFilterStatus(e.target.value)}
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
              </div>

              {/* Papers Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredPapers.length > 0 ? (
                  filteredPapers.map(paper => (
                    <div key={paper.id} className="bg-[#0F172A] border border-slate-850 hover:border-slate-750 transition-all rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-[#006D77]/20 border border-[#006D77]/30 text-[#00B4D8] rounded">
                            {paper.topic}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider rounded border ${
                            paper.status === 'Completed' || paper.status === 'Referenced' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            paper.status === 'Reading' || paper.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {paper.status}
                          </span>
                          {paper.doi && (
                            <span className="text-[10px] text-slate-500 font-mono">DOI: {paper.doi}</span>
                          )}
                        </div>
                        
                        <h3 className="text-base font-bold text-slate-100 font-serif leading-snug">{paper.title}</h3>
                        <p className="text-xs text-slate-400 italic">Authors: {paper.authors || 'Unknown'}</p>
                        
                        {paper.abstract && (
                          <div className="text-xs text-slate-400 line-clamp-3 bg-[#0B1220]/50 p-3 rounded-lg border border-slate-850">
                            <strong>Abstract Preview:</strong> {paper.abstract}
                          </div>
                        )}

                        {aiSummaryPaperId === paper.id && (
                          <div className="text-xs bg-[#1A2332]/50 p-4 border border-[#00B4D8]/20 rounded-lg text-[#00B4D8] font-mono whitespace-pre-line animate-fade-in">
                            {aiSummaryContent}
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col justify-end md:justify-between items-end border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4 min-w-[140px] gap-2">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-500 block">Journal / Year</span>
                          <span className="text-xs font-semibold text-slate-300 block">{paper.journal || 'Internal'} • {paper.year}</span>
                          <span className="text-[10px] text-[#D4A017] font-mono mt-1 block">★ {paper.citations || 0} Citations</span>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          <button 
                            onClick={() => generateAISummary(paper)}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] px-2 py-1 rounded font-mono border border-slate-700 cursor-pointer flex items-center gap-1"
                          >
                            <Brain className="w-3 h-3 text-[#00B4D8]" /> AI Summary
                          </button>
                          <button 
                            onClick={() => handleEditPaper(paper)}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] p-1.5 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeletePaper(paper.id!)}
                            className="bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-red-400 text-[10px] p-1.5 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#0F172A] border border-slate-850 p-12 text-center text-slate-400 rounded-xl text-xs">
                    No papers found matching filters or search queries. Click "Add Literature" to insert record.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS KANBAN VIEW */}
          {activeTab === 'projects' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {(['Idea', 'Literature Review', 'Experimenting', 'Writing', 'Submitted', 'Published'] as const).map(stage => {
                  const stageProjects = researchProjects.filter(p => {
                    try {
                      return JSON.parse(p.content || '{}').status === stage;
                    } catch {
                      return false;
                    }
                  });

                  return (
                    <div key={stage} className="bg-[#0F172A] border border-slate-850 rounded-xl p-3 flex flex-col gap-3 min-h-[300px]">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">{stage}</span>
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {stageProjects.length}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[450px] scrollbar-thin">
                        {stageProjects.map(p => {
                          let details = { description: '', targetJournal: '', timeline: '' };
                          try {
                            details = JSON.parse(p.content || '{}');
                          } catch {}

                          return (
                            <div key={p.id} className="bg-[#0B1220] border border-slate-800 hover:border-slate-700 p-3 rounded-lg flex flex-col gap-2 transition-all">
                              <h4 className="text-xs font-bold text-slate-200 font-serif leading-tight">{p.title}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-2">{details.description}</p>
                              
                              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-850/50">
                                <span>{details.targetJournal || 'No Target'}</span>
                                <span>{details.timeline || 'No Date'}</span>
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1.5">
                                <button 
                                  onClick={() => handleEditProject(p)}
                                  className="text-[9px] text-[#00B4D8] hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={async () => {
                                    if(confirm('Delete this project milestone?')) await db.knowledgeNotes.delete(p.id!);
                                  }}
                                  className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PhD TRACKER VIEW */}
          {activeTab === 'phd' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Applications Table & List */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                <Card header={<span className="text-sm font-semibold text-slate-200">University Application Targets</span>}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest font-mono text-[9px]">
                          <th className="py-2.5 px-3">University</th>
                          <th className="py-2.5 px-3">Country</th>
                          <th className="py-2.5 px-3">Program / Prof</th>
                          <th className="py-2.5 px-3">Deadline</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phdApplications.map(app => {
                          let data = { country: '', program: '', deadline: '', professor: '', email: '', status: 'Researching' };
                          try { data = JSON.parse(app.content || '{}'); } catch {}

                          return (
                            <tr key={app.id} className="border-b border-slate-850 hover:bg-slate-900/40">
                              <td className="py-3 px-3 font-semibold text-slate-200">{app.title}</td>
                              <td className="py-3 px-3 text-slate-400">{data.country}</td>
                              <td className="py-3 px-3">
                                <span className="block text-slate-200">{data.program}</span>
                                <span className="block text-[10px] text-slate-500">Prof: {data.professor} ({data.email})</span>
                              </td>
                              <td className="py-3 px-3 text-amber-500 font-mono">{data.deadline || 'TBD'}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                                  data.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                                  data.status === 'Applied' ? 'bg-blue-500/10 text-blue-400' :
                                  data.status === 'Contacted' ? 'bg-amber-500/10 text-amber-400' :
                                  data.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {data.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setUniEditId(app.id!);
                                      setUniName(app.title);
                                      setUniCountry(data.country);
                                      setUniProgram(data.program);
                                      setUniDeadline(data.deadline);
                                      setUniProf(data.professor);
                                      setUniEmail(data.email);
                                      setUniStatus(data.status as any);
                                      setIsPhdModalOpen(true);
                                    }}
                                    className="text-[10px] text-[#00B4D8] hover:underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('Remove university target?')) await db.knowledgeNotes.delete(app.id!);
                                    }}
                                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {phdApplications.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500">
                              No PhD applications tracked. Click "Add University Target" to begin.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Timeline View of Deadlines */}
                <Card header={<span className="text-sm font-semibold text-slate-200">Deadlines & Timeline</span>}>
                  <div className="flex flex-col gap-3">
                    {phdApplications
                      .map(app => {
                        let data = { deadline: '', status: '' };
                        try { data = JSON.parse(app.content || '{}'); } catch {}
                        return { title: app.title, deadline: data.deadline, status: data.status };
                      })
                      .filter(a => a.deadline)
                      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                      .map((a, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-[#0B1220] border border-slate-850 p-3 rounded-lg">
                          <Calendar className="w-5 h-5 text-slate-500" />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-200 block">{a.title}</span>
                            <span className="text-[10px] text-slate-500">Deadline: {a.deadline} • Stage: {a.status}</span>
                          </div>
                          <span className="text-xs text-amber-400 font-mono">
                            {Math.ceil((new Date(a.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days Left
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>

              {/* Right Column: Statement SOP Editor & Scholarships */}
              <div className="flex flex-col gap-6">
                <Card header={<span className="text-sm font-semibold text-slate-200">Statement of Purpose Draft</span>}>
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={statementText}
                      onChange={e => setStatementText(e.target.value)}
                      className="w-full h-44 bg-[#0B1220] border border-slate-800 rounded-lg p-3 text-xs outline-none text-slate-300 focus:border-slate-700 leading-relaxed font-mono"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Characters: {statementText.length}</span>
                      <span>Words: {statementText.trim().split(/\s+/).filter(Boolean).length}</span>
                    </div>
                  </div>
                </Card>

                {/* Scholarship Tracker */}
                <Card header={<span className="text-sm font-semibold text-slate-200">Scholarship / Funding OS</span>}>
                  <form onSubmit={handleFundSubmit} className="flex flex-col gap-3 mb-4 pb-4 border-b border-slate-800">
                    <input
                      type="text"
                      placeholder="Scholarship Name"
                      value={fundName}
                      onChange={e => setFundName(e.target.value)}
                      className="w-full bg-[#0B1220] border border-slate-800 rounded p-2 text-xs text-slate-200"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Amount (e.g. $40k/yr)"
                        value={fundAmount}
                        onChange={e => setFundAmount(e.target.value)}
                        className="bg-[#0B1220] border border-slate-800 rounded p-2 text-xs text-slate-200"
                      />
                      <input
                        type="date"
                        value={fundDeadline}
                        onChange={e => setFundDeadline(e.target.value)}
                        className="bg-[#0B1220] border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <button type="submit" className="btn-primary py-1.5 text-xs">
                      Log Scholarship
                    </button>
                  </form>

                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {scholarships.map(s => {
                      let data = { amount: '', deadline: '', status: 'Applied' };
                      try { data = JSON.parse(s.content || '{}'); } catch {}

                      return (
                        <div key={s.id} className="p-2 border border-slate-850 bg-[#0B1220] rounded flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-slate-200 block">{s.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Amt: {data.amount} • Deadline: {data.deadline}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-400">
                            {data.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* TAB 4: PUBLICATIONS VIEW */}
          {activeTab === 'publications' && (
            <div className="flex flex-col gap-6">
              
              {/* Analytics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">TOTAL CITATIONS</span>
                  <span className="text-4xl font-serif font-bold text-[#D4A017]">{totalCitations}</span>
                </div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">H-INDEX SCORE</span>
                  <span className="text-4xl font-serif font-bold text-[#00B4D8]">{hIndex}</span>
                </div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">TOTAL PORTFOLIO</span>
                  <span className="text-4xl font-serif font-bold text-emerald-400">{allPubs.length} Works</span>
                </div>
              </div>

              {/* Publications List */}
              <div className="flex flex-col gap-4">
                <Card header={<span className="text-sm font-semibold text-slate-200">Catalog of Authored Works</span>}>
                  <div className="flex flex-col gap-6">
                    {allPubs.map((pub, idx) => (
                      <div key={idx} className="border-b border-slate-800 pb-5 last:border-0 last:pb-0 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#D4A017] uppercase tracking-wider block">
                              {pub.journal} • {pub.year}
                            </span>
                            <h3 className="text-base font-bold text-slate-100 font-serif mt-0.5">{pub.title}</h3>
                            <p className="text-xs text-slate-400 italic">Authors: {pub.authors}</p>
                          </div>
                          <span className="bg-[#D4A017]/10 text-[#D4A017] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            ★ {pub.citations} Citations
                          </span>
                        </div>
                        {pub.abstract && (
                          <p className="text-xs text-slate-400 bg-[#0B1220] border border-slate-850 p-3 rounded-lg leading-relaxed">
                            {pub.abstract}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">Reference Link/DOI: {pub.doi}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* PAPER ADD/EDIT MODAL */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {paperEditId !== null ? 'Modify Literature Record' : 'Index New Research Literature'}
              </h3>
              <button 
                onClick={() => setIsPaperModalOpen(false)} 
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handlePaperSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Paper Title</label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={e => setPaperTitle(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-slate-700 outline-none"
                    placeholder="e.g. Synergistic effects of alginate mixtures"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Authors</label>
                  <input
                    type="text"
                    value={paperAuthors}
                    onChange={e => setPaperAuthors(e.target.value)}
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
                    value={paperJournal}
                    onChange={e => setPaperJournal(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                    placeholder="e.g. Food Hydrocolloids"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Year</label>
                  <input
                    type="text"
                    value={paperYear}
                    onChange={e => setPaperYear(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">DOI</label>
                  <input
                    type="text"
                    value={paperDoi}
                    onChange={e => setPaperDoi(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                    placeholder="e.g. 10.1016/..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Citations</label>
                  <input
                    type="number"
                    value={paperCitations}
                    onChange={e => setPaperCitations(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-zinc-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Topic Domain</label>
                  <select
                    value={paperTopic}
                    onChange={e => setPaperTopic(e.target.value)}
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
                    value={paperStatus}
                    onChange={e => setPaperStatus(e.target.value as any)}
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
                  value={paperAbstract}
                  onChange={e => setPaperAbstract(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 h-28 text-xs text-slate-200 focus:border-zinc-700 outline-none resize-none leading-relaxed font-mono"
                  placeholder="Paste abstract or outline key scientific equations and sensory properties here..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPaperModalOpen(false)}
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

      {/* PROJECT ADD/EDIT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {projectEditId !== null ? 'Modify Research Project' : 'Log New Research Milestone'}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  placeholder="e.g. Rheological studies of Carrageenan Blends"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Description</label>
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 h-20 text-xs text-slate-200 resize-none"
                  placeholder="Objectives, methodologies..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Target Journal</label>
                  <input
                    type="text"
                    value={projectJournal}
                    onChange={e => setProjectJournal(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="e.g. Food Tech"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Target Date</label>
                  <input
                    type="text"
                    value={projectTimeline}
                    onChange={e => setProjectTimeline(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="e.g. Q3 2026"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Status Stage</label>
                <select
                  value={projectStatus}
                  onChange={e => setProjectStatus(e.target.value as any)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  <option value="Idea">Idea</option>
                  <option value="Literature Review">Literature Review</option>
                  <option value="Experimenting">Experimenting</option>
                  <option value="Writing">Writing</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PhD TRACKER TARGET MODAL */}
      {isPhdModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {uniEditId !== null ? 'Modify target University' : 'Index new target University'}
              </h3>
              <button onClick={() => setIsPhdModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleUniSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">University Name</label>
                <input
                  type="text"
                  value={uniName}
                  onChange={e => setUniName(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  placeholder="e.g. IIT Kharagpur"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Country</label>
                  <input
                    type="text"
                    value={uniCountry}
                    onChange={e => setUniCountry(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="e.g. India"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Program / Focus</label>
                  <input
                    type="text"
                    value={uniProgram}
                    onChange={e => setUniProgram(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="e.g. Food Technology"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Professor Name</label>
                  <input
                    type="text"
                    value={uniProf}
                    onChange={e => setUniProf(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="e.g. Dr. A. Sen"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Professor Email</label>
                  <input
                    type="email"
                    value={uniEmail}
                    onChange={e => setUniEmail(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="e.g. asen@iit.ac.in"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Deadline</label>
                  <input
                    type="date"
                    value={uniDeadline}
                    onChange={e => setUniDeadline(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Application Status</label>
                  <select
                    value={uniStatus}
                    onChange={e => setUniStatus(e.target.value as any)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                  >
                    <option value="Researching">Researching</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Applied">Applied</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsPhdModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
