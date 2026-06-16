'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  GraduationCap, Plus, Save, Sparkles, Filter, Search, Calendar,
  Clock, CheckCircle2, AlertCircle, ChevronRight, Mail, Award, BookOpen, Edit2
} from 'lucide-react';

export default function PhDTrackerPage() {
  const [showUnivForm, setShowUnivForm] = useState(false);
  const [univName, setUnivName] = useState('');
  const [programName, setProgramName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [deadline, setDeadline] = useState('');
  const [appStatus, setAppStatus] = useState('Researching');
  const [scholarshipName, setScholarshipName] = useState('');
  const [scholarshipStatus, setScholarshipStatus] = useState('Not Applied');

  // SOP Editor States
  const [sopDraft, setSopDraft] = useState('');
  const [aiOutline, setAiOutline] = useState('');
  const [generatingOutline, setGeneratingOutline] = useState(false);

  // Queries
  const notes = useLiveQuery(() => 
    db.knowledgeNotes.where('category').equals('Research').toArray()
  ) ?? [];

  // Filter application and scholarship notes
  const phdApplications = notes.filter(n => n.tags && n.tags.includes('phd-application')).map(n => {
    try {
      const payload = JSON.parse(n.content || '{}');
      return {
        id: n.id,
        university: n.title,
        program: payload.program || '',
        advisor: payload.advisor || '',
        email: payload.email || '',
        deadline: payload.deadline || '',
        status: payload.status || 'Researching',
        scholarship: payload.scholarship || '',
        scholarshipStatus: payload.scholarshipStatus || 'Not Applied'
      };
    } catch {
      return {
        id: n.id,
        university: n.title,
        program: 'PhD in Food Science',
        advisor: '',
        email: '',
        deadline: '',
        status: 'Researching',
        scholarship: '',
        scholarshipStatus: 'Not Applied'
      };
    }
  });

  const handleSaveUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!univName.trim() || !programName.trim()) return;

    const payload = {
      program: programName.trim(),
      advisor: advisorName.trim(),
      email: advisorEmail.trim(),
      deadline,
      status: appStatus,
      scholarship: scholarshipName.trim(),
      scholarshipStatus
    };

    try {
      await db.knowledgeNotes.add({
        title: univName.trim(),
        category: 'Research',
        content: JSON.stringify(payload),
        tags: ['phd-application', 'research'],
        createdAt: new Date().toISOString()
      });

      // Reset
      setUnivName('');
      setProgramName('');
      setAdvisorName('');
      setAdvisorEmail('');
      setDeadline('');
      setAppStatus('Researching');
      setScholarshipName('');
      setScholarshipStatus('Not Applied');
      setShowUnivForm(false);
    } catch (err) {
      console.error('Failed to log university:', err);
    }
  };

  const handleUpdateStatus = async (app: any, newStatus: string) => {
    const updatedPayload = {
      program: app.program,
      advisor: app.advisor,
      email: app.email,
      deadline: app.deadline,
      status: newStatus,
      scholarship: app.scholarship,
      scholarshipStatus: app.scholarshipStatus
    };

    await db.knowledgeNotes.update(app.id, {
      content: JSON.stringify(updatedPayload)
    });
  };

  const generateAIOutline = () => {
    setGeneratingOutline(true);
    setTimeout(() => {
      const outlineText = `AI OUTLINE ASSISTANT — PHD STATEMENT OF PURPOSE:
1. INTRODUCTION (0-150 words):
   • Hook: Focus on Carrageenan hydrocolloid rheological synergies and their implications for plant-based food systems.
   • Goal: Seek a PhD to establish predictive extraction frameworks for Rhodophyta polysaccharides.

2. ACADEMIC & RESEARCH BACKGROUND (150-400 words):
   • Agricultural Engineering foundations & Food Tech Master's focus.
   • Highlight publication in Journal of Food Hydrocolloids (viscoelastic cocoa-dairy gels).

3. PROPOSED PHD RESEARCH INTERVENTIONS (400-750 words):
   • Focus area: Synergies between Kappa-2 Carrageenan fraction and plant-based gums.
   • Methodology details: Viscosities modeling under thermal stress.

4. CONCLUSION (750-900 words):
   • Fit: Align with target advisor's laboratory works. Detail funding path via scholarships.`;
      setAiOutline(outlineText);
      setGeneratingOutline(false);
    }, 1200);
  };

  // Word counter
  const wordCount = sopDraft.trim() ? sopDraft.trim().split(/\s+/).length : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <GraduationCap className="w-6 h-6 text-[#00B4D8]" /> PHD APPLICATION PORTAL
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Track university deadlines, monitor scholarship targets, and edit statements of purpose.
          </p>
        </div>
        <button
          onClick={() => setShowUnivForm(!showUnivForm)}
          className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          {showUnivForm ? 'CLOSE FORM' : 'ADD TARGET UNIVERSITY'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: University & Funding Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add University Form */}
          {showUnivForm && (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Plus className="w-4 h-4 text-[#00B4D8]" /> LOG GRADUATE APPLICATION PIPELINE
              </span>
            }>
              <form onSubmit={handleSaveUniversity} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">University Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wageningen University, Netherlands"
                      value={univName}
                      onChange={e => setUnivName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Program Title</label>
                    <input
                      type="text"
                      placeholder="e.g. PhD in Food Hydrocolloids"
                      value={programName}
                      onChange={e => setProgramName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Target Advisor</label>
                    <input
                      type="text"
                      placeholder="Professor Name"
                      value={advisorName}
                      onChange={e => setAdvisorName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Advisor Email</label>
                    <input
                      type="email"
                      placeholder="prof@university.edu"
                      value={advisorEmail}
                      onChange={e => setAdvisorEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Application Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Scholarship Target</label>
                    <input
                      type="text"
                      placeholder="e.g. DBT Fellowship"
                      value={scholarshipName}
                      onChange={e => setScholarshipName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Scholarship Status</label>
                    <select
                      value={scholarshipStatus}
                      onChange={e => setScholarshipStatus(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
                    >
                      <option value="Not Applied">Not Applied</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Applied">Applied</option>
                      <option value="Awarded">Awarded</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Application Status</label>
                    <select
                      value={appStatus}
                      onChange={e => setAppStatus(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
                    >
                      <option value="Researching">Researching</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUnivForm(false)}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    SAVE UNIVERSITY
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Target university applications list */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#D4A017] tracking-wider flex items-center gap-1.5 uppercase">
              <GraduationCap className="w-4 h-4 text-[#D4A017]" /> GRADUATE APPLICATIONS PIPELINE ({phdApplications.length})
            </span>
            
            {phdApplications.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 font-mono flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-700" />
                <p className="text-xs uppercase tracking-wider">No university targets logged.</p>
                <p className="text-[10px] lowercase text-zinc-650">Add targets using the form above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {phdApplications.map(app => (
                  <div key={app.id} className="p-4 rounded-xl border border-zinc-855 bg-zinc-950 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white text-sm font-display tracking-wide">{app.university}</h3>
                        <p className="text-[10px] text-[#00B4D8] font-mono mt-1">{app.program}</p>
                      </div>
                      <select
                        value={app.status}
                        onChange={e => handleUpdateStatus(app, e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 text-zinc-400 rounded px-2 py-0.5 text-[9px] focus:outline-none cursor-pointer"
                      >
                        <option value="Researching">Researching</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview Scheduled">Interview</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span>Deadline: <span className="text-zinc-300 font-semibold">{app.deadline || '—'}</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Advisor: <span className="text-zinc-300">{app.advisor || '—'}</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Funding: <span className="text-zinc-300">{app.scholarship || 'Self-funded'}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: SOP Statement Editor */}
        <div className="lg:col-span-1 space-y-6">
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <BookOpen className="w-4 h-4 text-purple-400" /> STATEMENT OF PURPOSE (SOP)
            </span>
          }>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>Draft Editor Block</span>
                <span className="font-bold text-zinc-350">{wordCount} words / 900 max</span>
              </div>

              <textarea
                placeholder="Compose your PhD admission SOP draft here..."
                value={sopDraft}
                onChange={e => setSopDraft(e.target.value)}
                rows={8}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-zinc-300 focus:outline-none focus:border-blue-500 text-[11px] font-serif leading-relaxed"
              />

              <button
                onClick={generateAIOutline}
                disabled={generatingOutline}
                className="w-full bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generatingOutline ? 'GENERATING...' : 'AI OUTLINE ASSISTANT'}
              </button>

              {aiOutline && (
                <div className="p-3 border border-purple-900/30 rounded bg-purple-950/5 space-y-2">
                  <span className="text-[9px] font-mono text-purple-400 font-bold block uppercase tracking-wider">COMPILED SOP STRUCTURE</span>
                  <pre className="text-[9px] font-mono text-zinc-400 whitespace-pre-wrap leading-normal font-sans">
                    {aiOutline}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
