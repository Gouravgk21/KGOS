'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ResearchPaper } from '@/db/database';
import { useResearchStore } from '@/store/useResearchStore';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import { 
  FileText, BookOpen, Mail, Calendar, Plus, 
  Trash2, Edit, CheckCircle2, AlertCircle, Sparkles, Send, 
  Clock, Play, ArrowRight, Save, Share2, Info, Search
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Types for local State persistence
interface LinkedInDraft {
  id: string;
  pillar: string;
  content: string;
  scheduledTime: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  createdAt: string;
}

interface GanttProject {
  id: string;
  title: string;
  type: 'Research Paper' | 'Newsletter' | 'LinkedIn Series' | 'Patent';
  stage: 'Outline' | 'Drafting' | 'Review' | 'Published';
  progress: number; // 0-100
  startDate: string;
  endDate: string;
}

const BRAND_PILLARS = [
  'Carrageenan Innovation',
  'Founder\'s Journey',
  'SaaS Engineering',
  'Supply Chain Resiliency',
  'Government Exam Strategy'
];

const NEWSLETTER_TEMPLATES = [
  {
    name: 'Weekly Hydrocolloid Digest',
    subject: 'Interactions #14: Synergistic Hydrocolloid Gelation and Dairy Rheology',
    body: `In this week's issue, we break down the molecular mechanisms of galactomannan coupling.

## Key Insights
1. **Kappa-I + LBG Synergy**: Helical junctions align to form a highly rigid crystalline structure, enhancing gel strength up to 4x.
2. **Viscosity Predictive Models**: Validating shear rate limits in cocoa-dairy solutions.
3. **Optimizing Batch Yields**: Saving 20%+ raw material costs by swapping stabilizers.

Read the full analysis in our literature vault.`
  },
  {
    name: 'Founder Systems Update',
    subject: 'Kumar\'s Log: The Architecture of Local-First SaaS Platforms',
    body: `System update for Kumar Gourav Operating System (KGOS) X 2031.

Reflections on building high-frequency telemetry tracking using local IndexedDB, synchronized asynchronously to Supabase cloud backends.

## Why Local-First Wins
- **0ms latency** on UI state mutations.
- **Resilient offline support** for field testing (e.g. at seaweed processing plants).
- **Reduced cloud roundtrip costs** for SaaS scale.

Stay tuned for the open-source blueprint.`
  },
  {
    name: 'Blank Draft',
    subject: 'KGOS Newsletter: [Subject]',
    body: 'Draft body goes here...'
  }
];

export default function PublicationOSPage() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const addNotification = useAppStore((state) => state.addNotification);
  
  // Dexie Research Papers
  const papers = useLiveQuery(() => db.researchPapers.toArray()) || [];
  const { addPaper, updatePaper, deletePaper } = useResearchStore();

  const [activeTab, setActiveTab] = useState<'ledger' | 'linkedin' | 'newsletter' | 'gantt'>('gantt');

  // ─── TAB 1: RESEARCH PAPERS LEDGER STATE ───
  const [paperSearch, setPaperSearch] = useState('');
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState<number | null>(null);
  
  const [paperTitle, setPaperTitle] = useState('');
  const [paperJournal, setPaperJournal] = useState('Nature Food');
  const [paperStatus, setPaperStatus] = useState<ResearchPaper['status']>('Planned');
  const [paperAuthors, setPaperAuthors] = useState('Kumar Gourav');
  const [paperSummary, setPaperSummary] = useState('');

  // ─── TAB 2: LINKEDIN STATE ───
  const [liPillar, setLiPillar] = useState(BRAND_PILLARS[0]);
  const [liContent, setLiContent] = useState('');
  const [liSchedule, setLiSchedule] = useState('2026-06-15T09:00');
  const [liDrafts, setLiDrafts] = useState<LinkedInDraft[]>([]);

  // ─── TAB 3: NEWSLETTER STATE ───
  const [nlSubject, setNlSubject] = useState(NEWSLETTER_TEMPLATES[0].subject);
  const [nlCategory, setNlCategory] = useState('Hydrocolloid Insights');
  const [nlContent, setNlContent] = useState(NEWSLETTER_TEMPLATES[0].body);
  const [nlSchedule, setNlSchedule] = useState('2026-06-18T10:00');
  const [isSendingNl, setIsSendingNl] = useState(false);
  const [nlSendProgress, setNlSendProgress] = useState(0);

  // ─── TAB 4: GANTT STATE ───
  const [ganttProjects, setGanttProjects] = useState<GanttProject[]>([]);
  const [selectedGanttProject, setSelectedGanttProject] = useState<GanttProject | null>(null);

  // Initial Seed for LinkedIn & Gantt (persisted in local state / localStorage)
  useEffect(() => {
    const cachedLi = localStorage.getItem('kgos_li_drafts');
    if (cachedLi) {
      setLiDrafts(JSON.parse(cachedLi));
    } else {
      const initialLi: LinkedInDraft[] = [
        {
          id: 'li-1',
          pillar: 'Carrageenan Innovation',
          content: 'Carrageenan is the unsung hero of dairy and plant-based milk rheology. Understanding how Kappa-II fraction binds with casein structures allows us to suspend cocoa solids without syneresis. Here is a breakdown of our recent rheology simulations...',
          scheduledTime: '2026-06-15T09:00',
          status: 'Scheduled',
          createdAt: new Date().toISOString()
        },
        {
          id: 'li-2',
          pillar: 'SaaS Engineering',
          content: 'Why WebApp latency is killing your operations. In KGOS 2031, we transitioned to a local IndexedDB-first design. All actions resolve instantly. Syncing happens in the background. Here is how we configured Dexie with Postgres Server Actions...',
          scheduledTime: '',
          status: 'Draft',
          createdAt: new Date().toISOString()
        }
      ];
      setLiDrafts(initialLi);
      localStorage.setItem('kgos_li_drafts', JSON.stringify(initialLi));
    }

    const cachedGantt = localStorage.getItem('kgos_gantt_projects');
    if (cachedGantt) {
      setGanttProjects(JSON.parse(cachedGantt));
    } else {
      const initialGantt: GanttProject[] = [
        {
          id: 'g-1',
          title: 'Synergistic Dairy Gel Rheology Paper',
          type: 'Research Paper',
          stage: 'Review',
          progress: 75,
          startDate: '2026-06-01',
          endDate: '2026-06-20'
        },
        {
          id: 'g-2',
          title: 'Weekly Hydrocolloid Newsletter #14',
          type: 'Newsletter',
          stage: 'Drafting',
          progress: 30,
          startDate: '2026-06-12',
          endDate: '2026-06-16'
        },
        {
          id: 'g-3',
          title: 'LinkedIn Systems Engineering Thread',
          type: 'LinkedIn Series',
          stage: 'Outline',
          progress: 15,
          startDate: '2026-06-14',
          endDate: '2026-06-25'
        },
        {
          id: 'g-4',
          title: 'Guar Gum Viscosity Patent filing',
          type: 'Patent',
          stage: 'Published',
          progress: 100,
          startDate: '2026-05-10',
          endDate: '2026-06-08'
        }
      ];
      setGanttProjects(initialGantt);
      localStorage.setItem('kgos_gantt_projects', JSON.stringify(initialGantt));
    }
  }, []);

  const saveLiDrafts = (updated: LinkedInDraft[]) => {
    setLiDrafts(updated);
    localStorage.setItem('kgos_li_drafts', JSON.stringify(updated));
  };

  const saveGanttProjects = (updated: GanttProject[]) => {
    setGanttProjects(updated);
    localStorage.setItem('kgos_gantt_projects', JSON.stringify(updated));
  };

  // ─── Research Ledger Logic ───
  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      const query = paperSearch.toLowerCase();
      return p.title.toLowerCase().includes(query) || p.topic.toLowerCase().includes(query);
    });
  }, [papers, paperSearch]);

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;

    const summaryDetails = `Authors: ${paperAuthors} | Journal: ${paperJournal}\n\nSynthesis:\n${paperSummary}`;

    if (editingPaperId !== null) {
      await updatePaper(editingPaperId, {
        title: paperTitle,
        topic: paperJournal,
        status: paperStatus,
        summary: summaryDetails
      });
      addNotification(`Updated Research Paper: ${paperTitle}`);
    } else {
      await addPaper({
        title: paperTitle,
        topic: paperJournal,
        status: paperStatus,
        summary: summaryDetails
      });
      addNotification(`Added Research Paper: ${paperTitle}`);

      // Add to Gantt automatically
      const newGantt: GanttProject = {
        id: `g-paper-${Date.now()}`,
        title: paperTitle,
        type: 'Research Paper',
        stage: paperStatus === 'Planned' ? 'Outline' : paperStatus === 'In Progress' ? 'Drafting' : 'Published',
        progress: paperStatus === 'Completed' ? 100 : paperStatus === 'In Progress' ? 50 : 10,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      saveGanttProjects([...ganttProjects, newGantt]);
    }

    // Reset Form
    setPaperTitle('');
    setPaperJournal('Nature Food');
    setPaperStatus('Planned');
    setPaperAuthors('Kumar Gourav');
    setPaperSummary('');
    setEditingPaperId(null);
    setIsAddingPaper(false);
  };

  const handleEditPaper = (paper: ResearchPaper) => {
    if (paper.id === undefined) return;
    setEditingPaperId(paper.id);
    setPaperTitle(paper.title);
    setPaperJournal(paper.topic);
    setPaperStatus(paper.status);

    const details = paper.summary || '';
    const authorsMatch = details.match(/Authors: (.*?) \|/);
    const summaryMatch = details.split('\n\nSynthesis:\n');

    setPaperAuthors(authorsMatch ? authorsMatch[1] : 'Kumar Gourav');
    setPaperSummary(summaryMatch.length > 1 ? summaryMatch[1] : details);
    setIsAddingPaper(true);
  };

  const handleDeletePaper = async (id: number | undefined) => {
    if (id === undefined) return;
    if (window.confirm('Are you sure you want to delete this paper ledger?')) {
      await deletePaper(id);
      addNotification('Deleted research paper record.');
    }
  };

  // ─── LinkedIn Composer Logic ───
  const wordCount = useMemo(() => {
    if (!liContent.trim()) return 0;
    return liContent.trim().split(/\s+/).length;
  }, [liContent]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const applyAIEnhancer = (action: 'hook' | 'hashtags' | 'formatting') => {
    if (!liContent.trim()) {
      alert('Please type some content first.');
      return;
    }

    let updated = liContent;
    if (action === 'hook') {
      const hooks: Record<string, string> = {
        'Carrageenan Innovation': '💡 Carrageenan is the absolute heart of dairy rheology. But most food tech startups get the synergistic coupling wrong. Here is why:\n\n',
        'Founder\'s Journey': '🚀 Building a SaaS platform at 3:00 AM while managing seaweed factory logistics in India. Systems emerge from interactions.\n\n',
        'SaaS Engineering': '⚡ LOCAL-FIRST beats Cloud API calls 10 out of 10 times. Here is how we configured our offline telemetry cache:\n\n',
        'Supply Chain Resiliency': '📦 Seaweed farming in Tamil Nadu has massive seasonal variability. Here is how we automated logistics forecasting:\n\n',
        'Government Exam Strategy': '📚 99% of aspirants fail government exams not because of knowledge, but due to system tracking. Our blueprint:\n\n'
      };
      const hookText = hooks[liPillar] || '✨ Critical insight for systems thinkers:\n\n';
      updated = hookText + updated;
    } else if (action === 'hashtags') {
      const hashtags: Record<string, string> = {
        'Carrageenan Innovation': '\n\n#FoodScience #FoodTechnology #Hydrocolloids #Carrageenan',
        'Founder\'s Journey': '\n\n#Entrepreneurship #FounderLife #BuildInPublic #StartupLife',
        'SaaS Engineering': '\n\n#SoftwareEngineering #NextJS #LocalFirst #Database',
        'Supply Chain Resiliency': '\n\n#SupplyChain #Logistics #AgriTech #Automation',
        'Government Exam Strategy': '\n\n#Exams #Productivity #SystemsThinking #GoalTracking'
      };
      updated = updated + (hashtags[liPillar] || '\n\n#KGOS #FounderIntelligence');
    } else if (action === 'formatting') {
      // Split paragraphs and add emoji spacing
      updated = updated.split('\n\n')
        .map((p, idx) => {
          if (idx === 0) return `👉 ${p}`;
          if (idx === 1) return `🔹 ${p}`;
          return `▪️ ${p}`;
        })
        .join('\n\n');
    }

    setLiContent(updated);
    addNotification(`AI: Applied ${action} optimization.`);
  };

  const handleQueueLinkedIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liContent.trim()) return;

    const newDraft: LinkedInDraft = {
      id: `li-${Date.now()}`,
      pillar: liPillar,
      content: liContent,
      scheduledTime: liSchedule || '',
      status: liSchedule ? 'Scheduled' : 'Draft',
      createdAt: new Date().toISOString()
    };

    const updated = [...liDrafts, newDraft];
    saveLiDrafts(updated);
    addNotification(`LinkedIn post added to queue: ${liPillar}`);
    setLiContent('');
  };

  const handlePublishLinkedInNow = (id: string) => {
    const updated = liDrafts.map(item => {
      if (item.id === id) {
        return { ...item, status: 'Published' as const, scheduledTime: '' };
      }
      return item;
    });
    saveLiDrafts(updated);
    addNotification('LinkedIn post published successfully!');
  };

  const handleDeleteLinkedIn = (id: string) => {
    const updated = liDrafts.filter(item => item.id !== id);
    saveLiDrafts(updated);
    addNotification('Removed LinkedIn draft.');
  };

  // ─── Newsletter Logic ───
  const handleLoadTemplate = (templateName: string) => {
    const template = NEWSLETTER_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setNlSubject(template.subject);
      setNlContent(template.body);
      addNotification(`Loaded template: ${templateName}`);
    }
  };

  const handleSendNewsletter = () => {
    if (isSendingNl) return;
    setIsSendingNl(true);
    setNlSendProgress(5);
    
    // Simulate compilation & sending progress
    const interval = setInterval(() => {
      setNlSendProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSendingNl(false);
            setNlSendProgress(0);
            addNotification(`Broadcast completed: ${nlSubject}`);
            
            // Add newsletter log to Gantt as Published
            const newNlGantt: GanttProject = {
              id: `g-nl-${Date.now()}`,
              title: nlSubject,
              type: 'Newsletter',
              stage: 'Published',
              progress: 100,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            };
            saveGanttProjects([...ganttProjects, newNlGantt]);
          }, 600);
          return 100;
        }
        return p + 15;
      });
    }, 200);
  };

  // ─── Gantt Project Planner Logic ───
  const handleGanttProgressChange = (id: string, progressVal: number) => {
    const updated = ganttProjects.map(proj => {
      if (proj.id === id) {
        let stage = proj.stage;
        if (progressVal === 100) stage = 'Published';
        else if (progressVal >= 60) stage = 'Review';
        else if (progressVal >= 20) stage = 'Drafting';
        else stage = 'Outline';

        return { ...proj, progress: progressVal, stage };
      }
      return proj;
    });
    saveGanttProjects(updated);
    if (selectedGanttProject?.id === id) {
      setSelectedGanttProject(updated.find(p => p.id === id) || null);
    }
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in text-[var(--text-primary)]">
      
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-[var(--border-primary)] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--accent-blue)] flex items-center gap-2">
            <Share2 className="w-7 h-7 text-[var(--accent-cyan)]" />
            Publication OS
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
            Research Articles Ledger · Newsletter Editor · LinkedIn Queue · Gantt Timeline
          </p>
        </div>

        {/* Tab Select */}
        <div className="flex gap-1 bg-white border border-[var(--border-glass)] p-1 rounded-lg shadow-sm">
          {[
            { id: 'gantt', label: 'Release Gantt', icon: Calendar },
            { id: 'ledger', label: 'Articles Ledger', icon: BookOpen },
            { id: 'linkedin', label: 'LinkedIn Queue', icon: Linkedin },
            { id: 'newsletter', label: 'Tech Newsletter', icon: Mail }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedGanttProject(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all ${
                activeTab === tab.id 
                  ? 'bg-[var(--accent-blue)] text-white font-semibold shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)]/20'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 4: RELEASE GANTT CALENDAR ── */}
      {activeTab === 'gantt' && (
        <div className="flex flex-col gap-6">
          <Card header={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-cyan)]" /> Publication Gantt Schedule
              </span>
              <span className="text-[10px] font-mono text-zinc-400">JUNE 2026 TIMELINE</span>
            </div>
          }>
            <div className="flex flex-col gap-6">
              
              {/* Gantt Timeline Visualization */}
              <div className="overflow-x-auto">
                <div className="min-w-[700px] border border-[var(--border-glass)] rounded-lg p-4 bg-[var(--bg-secondary)]/30">
                  
                  {/* Timeline Header (Days of June) */}
                  <div className="grid grid-cols-12 gap-1 border-b border-[var(--border-glass)] pb-2 text-[9px] font-mono text-zinc-400 text-center font-bold">
                    <div className="col-span-3 text-left">Publication Task</div>
                    <div>Jun 1-3</div>
                    <div>Jun 4-6</div>
                    <div>Jun 7-9</div>
                    <div>Jun 10-12</div>
                    <div>Jun 13-15</div>
                    <div>Jun 16-18</div>
                    <div>Jun 19-21</div>
                    <div>Jun 22-24</div>
                    <div>Jun 25-28</div>
                  </div>

                  {/* Gantt Bars */}
                  <div className="space-y-4 pt-3">
                    {ganttProjects.map(proj => {
                      // Color mapping by type
                      let barColor = 'bg-[var(--accent-cyan)]';
                      if (proj.type === 'Research Paper') barColor = 'bg-[var(--accent-blue)]';
                      if (proj.type === 'Newsletter') barColor = 'bg-amber-600';
                      if (proj.type === 'Patent') barColor = 'bg-emerald-600';

                      // Stage label styling
                      let stageBadge = 'border-zinc-400 text-zinc-650';
                      if (proj.stage === 'Published') stageBadge = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
                      if (proj.stage === 'Review') stageBadge = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                      if (proj.stage === 'Drafting') stageBadge = 'bg-blue-500/10 text-blue-700 border-blue-500/20';

                      return (
                        <div 
                          key={proj.id} 
                          onClick={() => setSelectedGanttProject(proj)}
                          className={`grid grid-cols-12 gap-1 items-center py-2 px-1.5 rounded transition-all cursor-pointer hover:bg-white/40 ${
                            selectedGanttProject?.id === proj.id ? 'bg-white shadow-sm border border-[var(--accent-cyan)]/30' : ''
                          }`}
                        >
                          {/* Task Info */}
                          <div className="col-span-3 text-xs flex flex-col">
                            <span className="font-bold font-serif text-[var(--text-primary)] leading-tight">{proj.title}</span>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">{proj.type}</span>
                          </div>

                          {/* Time Span representation bar */}
                          <div className="col-span-9 relative h-6 bg-[var(--border-glass)]/20 rounded border border-[var(--border-glass)] flex items-center">
                            
                            {/* Inner progress indicator */}
                            <div 
                              className={`h-full rounded-l transition-all ${barColor} flex items-center justify-end px-2`}
                              style={{ width: `${proj.progress}%` }}
                            >
                              {proj.progress > 15 && (
                                <span className="text-[9px] font-mono font-bold text-white leading-none">
                                  {proj.progress}%
                                </span>
                              )}
                            </div>
                            
                            {/* If progress is small, display progress outside the bar */}
                            {proj.progress <= 15 && (
                              <span className="text-[9px] font-mono font-bold text-zinc-500 pl-2">
                                {proj.progress}%
                              </span>
                            )}

                            {/* Stage indicator float */}
                            <span className={`absolute right-2 text-[9px] font-mono uppercase font-bold border px-1.5 py-0.25 rounded ${stageBadge}`}>
                              {proj.stage}
                            </span>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* Gantt Interactive Controller */}
              {selectedGanttProject && (
                <div className="border-t border-[var(--border-glass)] pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">Currently Editing Project</span>
                    <h3 className="font-serif text-lg font-bold text-[var(--accent-blue)]">{selectedGanttProject.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Adjust the current completeness. The system will dynamically re-categorize the pipeline stage.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold uppercase">Progress: {selectedGanttProject.progress}%</span>
                      <span className="font-semibold text-[var(--accent-blue)]">Stage: {selectedGanttProject.stage}</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={selectedGanttProject.progress}
                      onChange={e => handleGanttProgressChange(selectedGanttProject.id, parseInt(e.target.value))}
                      className="w-full accent-[var(--accent-blue)]"
                    />
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 1: RESEARCH ARTICLES LEDGER ── */}
      {activeTab === 'ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Write / Edit Article Form */}
          <div className="lg:col-span-1">
            <Card header={
              <span className="text-xs font-mono uppercase tracking-wider font-bold">
                {editingPaperId !== null ? 'Modify Article Register' : 'Register New Literature Paper'}
              </span>
            }>
              <form onSubmit={handleSavePaper} className="flex flex-col gap-4 text-xs">
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Research Title</label>
                  <input 
                    type="text" 
                    value={paperTitle} 
                    onChange={e => setPaperTitle(e.target.value)} 
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)]"
                    placeholder="e.g. Viscosity Transitions in Cocoa Suspension"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Target Journal / publisher</label>
                  <select 
                    value={paperJournal} 
                    onChange={e => setPaperJournal(e.target.value)}
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)]"
                  >
                    <option value="Nature Food">Nature Food</option>
                    <option value="Food Hydrocolloids">Food Hydrocolloids</option>
                    <option value="Journal of Dairy Science">Journal of Dairy Science</option>
                    <option value="International Journal of Food Science">Int. Journal of Food Science</option>
                    <option value="ResearchGate Archive">ResearchGate Archive</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Primary Authors</label>
                  <input 
                    type="text" 
                    value={paperAuthors} 
                    onChange={e => setPaperAuthors(e.target.value)} 
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Pipeline Stage</label>
                  <select 
                    value={paperStatus} 
                    onChange={e => setPaperStatus(e.target.value as any)}
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)]"
                  >
                    <option value="Planned">Planned / Outline</option>
                    <option value="In Progress">Drafting / Writing</option>
                    <option value="Completed">Peer Reviewed / Published</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Executive Synthesis / Abstract</label>
                  <textarea 
                    rows={4}
                    value={paperSummary} 
                    onChange={e => setPaperSummary(e.target.value)} 
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)]"
                    placeholder="Provide a synthesis of the research findings, gel characteristics, or key thixotropic data."
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-colors"
                  >
                    {editingPaperId !== null ? 'Save Changes' : 'Log Article'}
                  </button>
                  {editingPaperId !== null && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingPaperId(null);
                        setPaperTitle('');
                        setPaperSummary('');
                      }}
                      className="px-3 py-2 border border-[var(--border-glass)] hover:bg-[var(--bg-secondary)] font-mono text-[10px] uppercase rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            </Card>
          </div>

          {/* Table Ledger list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card header={
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Research Papers Database</span>
                
                {/* Search */}
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search articles..." 
                    value={paperSearch}
                    onChange={e => setPaperSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 border border-[var(--border-glass)] rounded bg-white text-xs outline-none focus:border-[var(--accent-cyan)]"
                  />
                </div>
              </div>
            }>
              <div className="overflow-x-auto text-xs">
                {filteredPapers.length === 0 ? (
                  <div className="text-center py-8 text-zinc-450 font-mono">
                    <Info className="w-6 h-6 mx-auto mb-2 text-zinc-350" />
                    NO ARTICLES RECORDED IN TELEMETRY
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-glass)] text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                        <th className="pb-2">Title</th>
                        <th className="pb-2">Target Journal</th>
                        <th className="pb-2">Pipeline Status</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]/40 text-[var(--text-primary)]">
                      {filteredPapers.map(paper => {
                        let statusColor = 'bg-blue-500/10 text-blue-700 border-blue-500/20';
                        if (paper.status === 'Completed') statusColor = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
                        if (paper.status === 'Planned') statusColor = 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20';

                        return (
                          <tr key={paper.id} className="hover:bg-[var(--bg-secondary)]/30">
                            <td className="py-3 pr-2">
                              <span className="font-bold font-serif text-[13px] block leading-tight">{paper.title}</span>
                              <span className="text-[9px] text-zinc-400 font-mono uppercase mt-0.5 block">
                                {paper.summary?.split(' | ')[0] || 'Author: Kumar Gourav'}
                              </span>
                            </td>
                            <td className="py-3 text-zinc-650 font-mono">{paper.topic}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${statusColor}`}>
                                {paper.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handleEditPaper(paper)}
                                  className="p-1 hover:bg-[var(--border-glass)] rounded text-zinc-600 transition-colors"
                                  title="Edit Paper"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePaper(paper.id)}
                                  className="p-1 hover:bg-rose-500/10 rounded text-rose-600 transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: LINKEDIN ARTICLE COMPOSER ── */}
      {activeTab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Editor Form */}
          <div className="lg:col-span-2">
            <Card header={
              <span className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn Post Draft Composer
              </span>
            }>
              <form onSubmit={handleQueueLinkedIn} className="flex flex-col gap-4 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[var(--text-secondary)]">Strategic Brand Pillar</label>
                    <select 
                      value={liPillar} 
                      onChange={e => setLiPillar(e.target.value)}
                      className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] text-xs"
                    >
                      {BRAND_PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[var(--text-secondary)]">Scheduled Release (Optional)</label>
                    <input 
                      type="datetime-local" 
                      value={liSchedule}
                      onChange={e => setLiSchedule(e.target.value)}
                      className="p-1.5 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] text-xs font-mono"
                    />
                  </div>
                </div>

                {/* AI Optimizers buttons */}
                <div className="flex flex-wrap gap-1.5 border-t border-[var(--border-glass)] pt-3 mt-1">
                  <span className="text-[10px] font-mono text-zinc-450 uppercase py-1 mr-2 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-[var(--accent-cyan)]" /> AI Helpers:
                  </span>
                  <button 
                    type="button" 
                    onClick={() => applyAIEnhancer('hook')}
                    className="px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-glass)] hover:bg-[var(--border-glass)]/20 text-[10px] font-mono uppercase rounded flex items-center gap-1"
                  >
                    🪄 Hook Builder
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyAIEnhancer('hashtags')}
                    className="px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-glass)] hover:bg-[var(--border-glass)]/20 text-[10px] font-mono uppercase rounded flex items-center gap-1"
                  >
                    🏷️ Insert Tags
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyAIEnhancer('formatting')}
                    className="px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-glass)] hover:bg-[var(--border-glass)]/20 text-[10px] font-mono uppercase rounded flex items-center gap-1"
                  >
                    📈 Format Readability
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                    <label className="font-semibold text-xs text-[var(--text-secondary)] uppercase">Draft Content Body</label>
                    <span>{liContent.length} / 3000 chars ({wordCount} words · {readingTime} min read)</span>
                  </div>
                  <textarea 
                    rows={8}
                    value={liContent} 
                    onChange={e => setLiContent(e.target.value)} 
                    className="p-3 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] font-sans text-xs leading-relaxed"
                    placeholder="Write a high-density, insight-driven LinkedIn post. Use the AI helpers to insert hooks or format paragraphs dynamically..."
                    maxLength={3000}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Queue Post Release
                  </button>
                </div>

              </form>
            </Card>
          </div>

          {/* Queue side ledger */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card header={
              <span className="text-xs font-mono uppercase tracking-wider font-bold">Release Queue / Log</span>
            }>
              <div className="flex flex-col gap-4">
                {liDrafts.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 font-mono text-xs">
                    NO DRAFTS SCHEDULED
                  </div>
                ) : (
                  liDrafts.map(draft => {
                    let statusColor = 'bg-zinc-500/10 text-zinc-650 border-zinc-500/20';
                    if (draft.status === 'Scheduled') statusColor = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                    if (draft.status === 'Published') statusColor = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';

                    return (
                      <div key={draft.id} className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg text-xs flex flex-col gap-2 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[var(--accent-blue)]">
                              {draft.pillar}
                            </span>
                            {draft.scheduledTime && (
                              <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">
                                Scheduled: {new Date(draft.scheduledTime).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className={`text-[8px] font-mono px-1 rounded uppercase border font-bold ${statusColor}`}>
                            {draft.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-normal font-sans italic bg-white/40 p-2 rounded border border-[var(--border-glass)]">
                          "{draft.content}"
                        </p>

                        <div className="flex justify-between items-center mt-1 border-t border-[var(--border-glass)]/60 pt-2 text-[10px]">
                          <button 
                            onClick={() => handleDeleteLinkedIn(draft.id)}
                            className="text-rose-600 hover:underline font-mono"
                          >
                            Delete
                          </button>
                          
                          {draft.status !== 'Published' && (
                            <button 
                              onClick={() => handlePublishLinkedInNow(draft.id)}
                              className="text-emerald-600 hover:underline font-mono font-bold flex items-center gap-0.5"
                            >
                              Publish Now <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* ── TAB 3: CONTENT NEWSLETTER BUILDER ── */}
      {activeTab === 'newsletter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Form */}
          <div className="flex flex-col gap-4">
            <Card header={
              <span className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                <Mail className="w-4 h-4 text-[var(--accent-cyan)]" /> Interactions Newsletter Composer
              </span>
            }>
              <div className="flex flex-col gap-4 text-xs">
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Load Template Preset</label>
                  <select 
                    onChange={e => handleLoadTemplate(e.target.value)}
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] text-xs"
                    defaultValue="Weekly Hydrocolloid Digest"
                  >
                    {NEWSLETTER_TEMPLATES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">Broadcast Subject</label>
                  <input 
                    type="text" 
                    value={nlSubject} 
                    onChange={e => setNlSubject(e.target.value)} 
                    className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] font-serif text-[13px] font-bold"
                    placeholder="Enter newsletter subject..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[var(--text-secondary)]">Focus Category</label>
                    <select 
                      value={nlCategory} 
                      onChange={e => setNlCategory(e.target.value)}
                      className="p-2 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] text-xs"
                    >
                      <option value="Hydrocolloid Insights">Hydrocolloid Insights</option>
                      <option value="Founder Musings">Founder Musings</option>
                      <option value="SaaS Deep-dives">SaaS Deep-dives</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[var(--text-secondary)]">Target Send Date/Time</label>
                    <input 
                      type="datetime-local" 
                      value={nlSchedule}
                      onChange={e => setNlSchedule(e.target.value)}
                      className="p-1.5 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[var(--text-secondary)] uppercase text-[10px] tracking-wider font-mono">Newsletter Content Body (Markdown supported)</label>
                  <textarea 
                    rows={12}
                    value={nlContent} 
                    onChange={e => setNlContent(e.target.value)} 
                    className="p-3 border border-[var(--border-glass)] rounded-md bg-white outline-none focus:border-[var(--accent-cyan)] font-mono text-xs leading-relaxed"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={handleSendNewsletter}
                    disabled={isSendingNl}
                    className="flex-1 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSendingNl ? 'Broadcasting...' : 'Broadcast Newsletter'}
                  </button>
                </div>

                {isSendingNl && (
                  <div className="mt-2 bg-[var(--border-glass)]/20 rounded p-3 border border-[var(--border-glass)] flex flex-col gap-2">
                    <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                      <span>SEND STATUS: DISPATCHING PIPELINE</span>
                      <span>{nlSendProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded overflow-hidden">
                      <div className="bg-[var(--accent-blue)] h-full transition-all" style={{ width: `${nlSendProgress}%` }} />
                    </div>
                  </div>
                )}

              </div>
            </Card>
          </div>

          {/* Email Preview */}
          <div>
            <Card header={
              <span className="text-xs font-mono uppercase tracking-wider font-bold">Email Inbox Preview</span>
            }>
              <div className="border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden text-xs">
                
                {/* Inbox Headers */}
                <div className="bg-zinc-50 border-b border-zinc-200 p-4 space-y-1.5 font-mono text-[10px] text-zinc-500">
                  <div className="flex justify-between">
                    <span>From: <b>Kumar Gourav</b> &lt;intel@kgos.ai&gt;</span>
                    <span className="text-[8px] text-zinc-400">SMTP RELAY: ACTIVE</span>
                  </div>
                  <div>To: <b>Subscriber Circle</b> &lt;subscribers@kgos.ai&gt;</div>
                  <div className="text-[var(--text-primary)] font-serif font-bold text-xs pt-1">
                    Subject: {nlSubject}
                  </div>
                </div>

                {/* Email Body Rendering */}
                <div className="p-6 min-h-[300px] flex flex-col justify-between font-sans leading-relaxed text-[var(--text-secondary)]">
                  <div>
                    {/* Branded Header Block */}
                    <div className="border-b-2 border-[var(--border-focus)] pb-3 mb-4 flex justify-between items-end">
                      <div>
                        <h2 className="text-xl font-serif font-bold text-[var(--accent-blue)]">INTERACTIONS</h2>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--border-focus)] font-bold">Kumar Gourav Science & Intel Journal</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-450 uppercase font-semibold">CATEGORY: {nlCategory}</span>
                    </div>

                    {/* Content text */}
                    <div className="space-y-3 whitespace-pre-wrap font-sans text-xs">
                      {nlContent}
                    </div>
                  </div>

                  {/* Branded Footer Block */}
                  <div className="border-t border-zinc-250 pt-4 mt-8 font-mono text-[8px] text-zinc-400 text-center uppercase tracking-widest">
                    <span>© 2026 KGOS X 2031 FOUNDER INTELLIGENCE PLATFORM. ALL RIGHTS RESERVED.</span>
                    <p className="mt-1 text-zinc-450">You are receiving this because you belong to Kumar Gourav's advisory and researcher circle.</p>
                  </div>

                </div>

              </div>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
