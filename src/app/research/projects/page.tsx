'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  Briefcase, Plus, Save, Sparkles, Filter, Search, Calendar,
  Clock, CheckCircle2, AlertCircle, ChevronRight, Clipboard, Beaker, Link2
} from 'lucide-react';

export default function ResearchProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [targetJournal, setTargetJournal] = useState('');
  const [projectStatus, setProjectStatus] = useState('Idea');
  const [timeline, setTimeline] = useState('');
  
  // Experiment logging states
  const [hypothesis, setHypothesis] = useState('');
  const [methodology, setMethodology] = useState('');
  const [results, setResults] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [linkedFormulationId, setLinkedFormulationId] = useState('');

  // Selected project drill-down
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Queries
  const formulations = useLiveQuery(() => db.formulations.toArray()) ?? [];
  const papers = useLiveQuery(() => db.researchPapers.toArray()) ?? [];
  const projects = useLiveQuery(async () => {
    const notes = await db.knowledgeNotes
      .where('category')
      .equals('Research')
      .toArray();

    return notes
      .filter(n => n.tags && n.tags.includes('project'))
      .map(n => {
        try {
          const payload = JSON.parse(n.content || '{}');
          return {
            id: n.id,
            title: n.title,
            description: payload.description || '',
            targetJournal: payload.targetJournal || '',
            status: payload.status || 'Idea',
            timeline: payload.timeline || '',
            hypothesis: payload.hypothesis || '',
            methodology: payload.methodology || '',
            results: payload.results || '',
            conclusions: payload.conclusions || '',
            linkedFormulationId: payload.linkedFormulationId || '',
            createdAt: n.createdAt
          };
        } catch (e) {
          return {
            id: n.id,
            title: n.title,
            description: n.content || '',
            targetJournal: '',
            status: 'Idea',
            timeline: '',
            hypothesis: '',
            methodology: '',
            results: '',
            conclusions: '',
            linkedFormulationId: '',
            createdAt: n.createdAt
          };
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }) ?? [];

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const payload = {
      description: projectDesc.trim(),
      targetJournal: targetJournal.trim(),
      status: projectStatus,
      timeline: timeline.trim(),
      hypothesis: hypothesis.trim(),
      methodology: methodology.trim(),
      results: results.trim(),
      conclusions: conclusions.trim(),
      linkedFormulationId
    };

    try {
      await db.knowledgeNotes.add({
        title: projectTitle.trim(),
        category: 'Research',
        content: JSON.stringify(payload),
        tags: ['project', 'research'],
        createdAt: new Date().toISOString()
      });

      // Reset form
      setProjectTitle('');
      setProjectDesc('');
      setTargetJournal('');
      setProjectStatus('Idea');
      setTimeline('');
      setHypothesis('');
      setMethodology('');
      setResults('');
      setConclusions('');
      setLinkedFormulationId('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to log project:', err);
    }
  };

  const handleUpdateStatus = async (proj: any, newStatus: string) => {
    const updatedPayload = {
      description: proj.description,
      targetJournal: proj.targetJournal,
      status: newStatus,
      timeline: proj.timeline,
      hypothesis: proj.hypothesis,
      methodology: proj.methodology,
      results: proj.results,
      conclusions: proj.conclusions,
      linkedFormulationId: proj.linkedFormulationId
    };

    await db.knowledgeNotes.update(proj.id, {
      content: JSON.stringify(updatedPayload)
    });

    if (selectedProject?.id === proj.id) {
      setSelectedProject({ ...selectedProject, status: newStatus });
    }
  };

  const handleUpdateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const updatedPayload = {
      description: selectedProject.description,
      targetJournal: selectedProject.targetJournal,
      status: selectedProject.status,
      timeline: selectedProject.timeline,
      hypothesis,
      methodology,
      results,
      conclusions,
      linkedFormulationId
    };

    await db.knowledgeNotes.update(selectedProject.id, {
      content: JSON.stringify(updatedPayload)
    });

    // Update local state
    setSelectedProject({
      ...selectedProject,
      hypothesis,
      methodology,
      results,
      conclusions,
      linkedFormulationId
    });

    // Reset log states
    setHypothesis('');
    setMethodology('');
    setResults('');
    setConclusions('');
    setLinkedFormulationId('');
  };

  const loadExperimentLogs = (proj: any) => {
    setSelectedProject(proj);
    setHypothesis(proj.hypothesis || '');
    setMethodology(proj.methodology || '');
    setResults(proj.results || '');
    setConclusions(proj.conclusions || '');
    setLinkedFormulationId(proj.linkedFormulationId || '');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <Beaker className="w-6 h-6 text-[#00B4D8]" /> RESEARCH PROJECTS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Manage experimental investigations, log lab hypotheses, and track publishing targets.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'CLOSE FORM' : 'START NEW PROJECT'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Projects Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Project Form */}
          {showForm && (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Plus className="w-4 h-4 text-[#00B4D8]" /> INITIALIZE RESEARCH PROTOCOL
              </span>
            }>
              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. VISCOSITY OF COCOA-DAIRY GELS"
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Target Journal / Publisher</label>
                    <input
                      type="text"
                      placeholder="e.g. Journal of Food Hydrocolloids"
                      value={targetJournal}
                      onChange={e => setTargetJournal(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Abstract / Description</label>
                    <input
                      type="text"
                      placeholder="Viscoelastic transitions modeled..."
                      value={projectDesc}
                      onChange={e => setProjectDesc(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Initial Status</label>
                    <select
                      value={projectStatus}
                      onChange={e => setProjectStatus(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
                    >
                      <option value="Idea">Idea</option>
                      <option value="Lit Review">Literature Review</option>
                      <option value="Experimenting">Experimenting</option>
                      <option value="Writing">Writing</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    SAVE PROTOCOL
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Active Projects Cards */}
          <div className="grid grid-cols-1 gap-4">
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 font-mono flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-700" />
                <p className="text-xs uppercase tracking-wider">No active research projects logged.</p>
                <p className="text-[10px] lowercase text-zinc-655">Log your initial concept above.</p>
              </div>
            ) : (
              projects.map(proj => (
                <div key={proj.id} className={`p-4 rounded-xl border transition-all ${
                  selectedProject?.id === proj.id ? 'border-[#00B4D8]/50 bg-zinc-900/40' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-750'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-sm font-display tracking-wide">{proj.title}</h3>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{proj.description}</p>
                    </div>
                    <select
                      value={proj.status}
                      onChange={e => handleUpdateStatus(proj, e.target.value)}
                      className="bg-zinc-900 border border-zinc-850 text-[#00B4D8] rounded px-2 py-0.5 text-[9px] focus:outline-none cursor-pointer"
                    >
                      <option value="Idea">Idea</option>
                      <option value="Lit Review">Lit Review</option>
                      <option value="Experimenting">Experimenting</option>
                      <option value="Writing">Writing</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500 pt-3 border-t border-zinc-900 mt-3">
                    <div>
                      <span className="text-zinc-600 block uppercase">Target Journal</span>
                      <span className="text-zinc-300 font-semibold block mt-0.5">{proj.targetJournal || '—'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block uppercase">Experiment Status</span>
                      <span className="text-zinc-300 block mt-0.5">{proj.hypothesis ? 'Logs Registered' : 'Empty Logbook'}</span>
                    </div>
                    <div className="flex justify-end items-end">
                      <button
                        onClick={() => loadExperimentLogs(proj)}
                        className="text-[#00B4D8] hover:text-white flex items-center gap-0.5 font-mono text-[9px] cursor-pointer"
                      >
                        OPEN LAB LOGBOOK <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Side: Experiment Logbook */}
        <div className="lg:col-span-1">
          {selectedProject ? (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
                <Clipboard className="w-4 h-4 text-[#D4A017]" /> LAB EXPERIMENTAL LOG
              </span>
            }>
              <form onSubmit={handleUpdateExperiment} className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Active Project Scope</span>
                  <span className="text-zinc-200 text-sm font-semibold block mt-0.5 uppercase tracking-wide font-display">{selectedProject.title}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Hypothesis</label>
                  <textarea
                    placeholder="Identify the core chemical or rheology question..."
                    value={hypothesis}
                    onChange={e => setHypothesis(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Methodology</label>
                  <textarea
                    placeholder="Viscometer cycles, cooling parameters, mixing speeds..."
                    value={methodology}
                    onChange={e => setMethodology(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Results</label>
                  <textarea
                    placeholder="Viscosity levels, syneresis index, gel strength..."
                    value={results}
                    onChange={e => setResults(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Conclusions</label>
                  <textarea
                    placeholder="Confirm synergy index or target optimizations..."
                    value={conclusions}
                    onChange={e => setConclusions(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Link KAFS Formulation</label>
                  <select
                    value={linkedFormulationId}
                    onChange={e => setLinkedFormulationId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] cursor-pointer"
                  >
                    <option value="">-- Select formulation blend --</option>
                    {formulations.map(form => (
                      <option key={form.id} value={form.id}>{form.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CLOSE LOG
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    SAVE LAB ENTRY
                  </button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-650 font-mono flex flex-col items-center gap-2">
              <Clipboard className="w-8 h-8 text-zinc-800" />
              <p className="text-xs uppercase tracking-wider">No active project logbook</p>
              <p className="text-[10px] lowercase text-zinc-650">Select "OPEN LAB LOGBOOK" on any project card.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
