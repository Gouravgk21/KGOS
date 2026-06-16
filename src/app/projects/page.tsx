'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Project } from '@/db/database';
import { useProjectStore } from '@/store/useProjectStore';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import KPICard from '@/components/ui/KPICard';
import { 
  FolderKanban, Plus, Trash2, Edit2, Calendar, Target, 
  Search, Sliders, ChevronDown, CheckCircle, Clock,
  Zap, Compass, TrendingUp, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { key: 'Business', label: 'Business' },
  { key: 'Research', label: 'Research' },
  { key: 'Career', label: 'Career' },
  { key: 'Government Exams', label: 'Gov Exams' },
  { key: 'Brand', label: 'Brand & Content' },
  { key: 'AI', label: 'AI Services' },
  { key: 'Personal', label: 'Personal Development' }
];

const PRIORITIES = [
  { key: 'CRITICAL', label: 'Critical', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { key: 'HIGH', label: 'High', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { key: 'MEDIUM', label: 'Medium', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { key: 'LOW', label: 'Low', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
];

const STATUSES = [
  { key: 'NOT_STARTED', label: 'Not Started' },
  { key: 'PLANNING', label: 'Planning' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'WAITING', label: 'On Hold' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'ARCHIVED', label: 'Archived' }
];

const PUBLIC_PROJECTS = [
  {
    title: 'Clean Label Dairy Viscosity Blend (KAFS-V4)',
    category: 'RHEOLOGY',
    desc: 'Developed a synergistic Carrageenan-pectin gel matrix replacing modified starches in commercial chocolate milk beverages. Optimized formulation to prevent cocoa settling and fat separation across a 60-day distribution cycle.',
    status: 'ACTIVE',
    scale: '12 Regional Dairies',
    progress: 90
  },
  {
    title: '50L Stabilizer Blending & Pilot Mixing Line',
    category: 'ENGINEERING',
    desc: 'Designed and installed a semi-automated 50-liter batch dry blender and viscometer loop. Integrated temperature controls to systematically audit gel strength variability in pilot scale production.',
    status: 'COMPLETED',
    scale: 'R&D Laboratory Install',
    progress: 100
  },
  {
    title: 'Seaweed Quality Index Audit System',
    category: 'LOGISTICS',
    desc: 'Implemented an inbound raw material testing standard scoring moisture levels, purity indices, and gelling yields. Allows real-time optimization of stabilizer formulations based on raw material batch variations.',
    status: 'PLANNING',
    scale: '3 Pacific Sourcing Nodes',
    progress: 45
  },
  {
    title: 'FSSAI Stabilizer Dossiers Submission',
    category: 'COMPLIANCE',
    desc: 'Authored and filed safety assessment records under Category 12.2 regulations. Ensured all Clean-Label stabilizer blends meet national food regulatory requirements.',
    status: 'COMPLETED',
    scale: 'National Food Safety Board',
    progress: 100
  }
];

export default function ProjectsPage() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const projects = useLiveQuery(() => db.projects.toArray()) ?? [];
  const { addProject, updateProject, deleteProject } = useProjectStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formObjective, setFormObjective] = useState('');
  const [formCategory, setFormCategory] = useState('Business');
  const [formPriority, setFormPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [formStatus, setFormStatus] = useState<Project['status']>('PLANNING');
  const [formProgress, setFormProgress] = useState('0');
  const [formDueDate, setFormDueDate] = useState('');

  // Private Computations
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'ACTIVE').length;
    const planning = projects.filter(p => p.status === 'PLANNING').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const avgProgress = total > 0 
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total) 
      : 0;

    return { total, active, planning, completed, avgProgress };
  }, [projects]);

  // Private Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const title = p.title || p.name || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchQuery, selectedCategory, selectedStatus]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      await addProject({
        title: formTitle.trim(),
        name: formTitle.trim(),
        objective: formObjective.trim() || undefined,
        description: formObjective.trim() || undefined,
        category: formCategory,
        priority: formPriority,
        status: formStatus,
        progress: Number(formProgress),
        dueDate: formDueDate || undefined
      });

      // Clear fields
      setFormTitle('');
      setFormObjective('');
      setFormCategory('Business');
      setFormPriority('MEDIUM');
      setFormStatus('PLANNING');
      setFormProgress('0');
      setFormDueDate('');
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  };

  const handleProgressChange = async (id: number, progressVal: number) => {
    try {
      const updates: Partial<Project> = { progress: progressVal };
      if (progressVal === 100) {
        updates.status = 'COMPLETED';
      }
      await updateProject(id, updates);
    } catch (err) {
      console.error('Failed to update project progress:', err);
    }
  };

  const handleStatusChange = async (id: number, statusVal: Project['status']) => {
    try {
      const updates: Partial<Project> = { status: statusVal };
      if (statusVal === 'COMPLETED') {
        updates.progress = 100;
      }
      await updateProject(id, updates);
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this project? All associated tasks will be unlinked or removed.')) return;
    try {
      await deleteProject(id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // ─── Public View (isLoggedIn === false) ───
  if (!isLoggedIn) {
    const publicFiltered = PUBLIC_PROJECTS.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="min-h-screen bg-[#F9F8F5] text-[#2E3A47] pb-24">
        
        {/* Subheader */}
        <section className="bg-[#1B2B3B] text-[#F9F8F5] py-16 px-6 md:px-12 relative overflow-hidden border-b border-[#F9F8F5]/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,107,110,0.12),transparent_70%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4892A] font-bold">PROJECTS SHOWCASE // LEDGER</span>
            <h1 className="text-3xl md:text-4xl font-serif tracking-wider uppercase">
              Engineering & Systems Ledger
            </h1>
            <p className="text-xs font-mono text-[#F9F8F5]/60 uppercase tracking-widest max-w-xl">
              Showcasing pilot formulation blenders, seaweed supply chains, and FSSAI safety filings.
            </p>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="py-8 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1B2B3B]/5 p-4 rounded-xl border border-[#1B2B3B]/10">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#2E3A47]/40" />
              <input
                type="text"
                placeholder="Search projects database..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F9F8F5] border border-[#1B2B3B]/10 rounded-lg text-xs text-[#2E3A47] outline-none focus:border-[#C4892A] font-mono"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'RHEOLOGY', 'ENGINEERING', 'LOGISTICS', 'COMPLIANCE'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[9px] font-mono tracking-widest uppercase transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-[#1B2B3B] text-[#F9F8F5] shadow-sm'
                      : 'text-[#2E3A47]/60 hover:text-[#2E3A47]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Cards Grid */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto">
          {publicFiltered.length === 0 ? (
            <div className="text-center py-16 border border-[#1B2B3B]/10 rounded-xl font-mono text-xs text-[#2E3A47]/40 bg-[#F9F8F5]">
              No projects found matching the filter parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {publicFiltered.map((p, idx) => (
                <div key={idx} className="bg-[#F9F8F5] border border-[#1B2B3B]/10 rounded-xl p-6 shadow-sm hover:border-[#C4892A]/40 transition-all flex flex-col justify-between gap-6">
                  <div>
                    {/* Header line */}
                    <div className="flex justify-between items-start gap-4">
                      <span className="px-2.5 py-1 rounded bg-[#3A6B6E]/10 text-[#3A6B6E] text-[9px] font-mono tracking-widest uppercase font-bold">
                        {p.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-bold ${
                        p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#1B2B3B] mt-4 leading-tight">
                      {p.title}
                    </h3>

                    <p className="text-xs text-[#2E3A47]/80 leading-relaxed font-serif mt-2.5">
                      {p.desc}
                    </p>
                  </div>

                  {/* Footer details */}
                  <div className="border-t border-[#1B2B3B]/5 pt-4 flex flex-col gap-4">
                    {/* Progress slider representation */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] font-mono text-[#2E3A47]/40 uppercase tracking-widest">
                        <span>Milestone Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#1B2B3B]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C4892A]" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-[#2E3A47]/50">
                      <span>SCALE: {p.scale}</span>
                      <a href="/contact" className="text-[#3A6B6E] font-bold flex items-center gap-1 hover:underline">
                        Inquire Details <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    );
  }

  // ─── Private View (isLoggedIn === true) ───
  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-500" />
            Projects OS
          </h1>
          <p className="text-sm text-zinc-400">Coordinate client pilots, study groups, content campaigns, and automations.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Total Projects" value={stats.total} icon={FolderKanban} />
        <KPICard label="Active Status" value={stats.active} icon={Zap} trend="positive" trendValue="Live" />
        <KPICard label="In Planning" value={stats.planning} icon={Compass} />
        <KPICard label="Completed" value={stats.completed} icon={CheckCircle} />
        <KPICard label="Avg Progress" value={`${stats.avgProgress}%`} icon={TrendingUp} />
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Initiate New Project Blueprint</span>}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Project Name</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Kappa formulations mix optimization"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>

              <div className="flex grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Category Domain</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700 cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Initial Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700 cursor-pointer"
                >
                  {STATUSES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Progress % ({formProgress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formProgress}
                  onChange={e => setFormProgress(e.target.value)}
                  className="w-full accent-indigo-500 bg-zinc-850 h-2 rounded-lg cursor-pointer mt-3"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Target Due Date</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={e => setFormDueDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Strategic Objective / Scope Description</label>
              <textarea
                value={formObjective}
                onChange={e => setFormObjective(e.target.value)}
                placeholder="Detail the target outcomes, formulation metrics, or core study chapters..."
                rows={3}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Assemble Blueprint
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects registry..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs text-zinc-200 outline-none focus:border-zinc-700 font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs text-zinc-400 outline-none focus:border-zinc-750 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs text-zinc-400 outline-none focus:border-zinc-750 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 border border-zinc-850/80 rounded-xl text-xs text-zinc-500 font-mono bg-zinc-950/20">
          No records match active filter arguments.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((p) => {
            const priorityObj = PRIORITIES.find(pr => pr.key === p.priority);
            const statusObj = STATUSES.find(st => st.key === p.status);
            const title = p.title || p.name || 'Untitled Project';

            return (
              <div key={p.id} className="border border-zinc-850 bg-zinc-950/20 hover:border-zinc-750 transition-all rounded-xl p-5 flex flex-col justify-between gap-5">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {p.category}
                      </span>
                      {priorityObj && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded uppercase ${priorityObj.color}`}>
                          {priorityObj.label}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500">
                      ID: #{p.id}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-200 mt-3.5">
                    {title}
                  </h3>

                  {p.objective && (
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-3">
                      {p.objective}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3.5 pt-3.5 border-t border-zinc-850/60">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Progress Status</span>
                    <span className="text-zinc-300 font-bold">{p.progress || 0}%</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={p.progress || 0}
                    onChange={e => handleProgressChange(p.id!, Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-zinc-850 h-1 rounded cursor-pointer"
                  />

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">Status:</span>
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id!, e.target.value as any)}
                        className="px-2 py-0.5 bg-zinc-950 border border-zinc-850 rounded text-[10px] text-zinc-400 outline-none cursor-pointer"
                      >
                        {STATUSES.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.dueDate && (
                        <span className="text-[10px] font-mono text-zinc-650 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.dueDate}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(p.id!)}
                        className="p-1.5 text-zinc-550 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
