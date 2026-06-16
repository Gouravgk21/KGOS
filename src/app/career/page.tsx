'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db, type Skill } from '@/db/database';
import { Briefcase, Plus, Award, Star, Trash2, ChevronUp } from 'lucide-react';

const SKILL_CATEGORIES = [
  'Food Technology',
  'Sales & B2B Strategy',
  'AI Systems & Agents',
  'Academic Research',
  'Finance & Accounting',
  'Leadership',
  'Marketing & Brand',
];

const JOB_STATUSES = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];
const JOB_STATUS_COLORS: Record<string, string> = {
  Applied:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Screening:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Interviewing: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Offer:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rejected:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Withdrawn:  'bg-zinc-500/10 text-zinc-500 border-zinc-700',
};

interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  notes?: string;
}

// Static certifications list
const CERTIFICATIONS = [
  { name: 'FSSAI Certified Food Analyst', status: 'In Progress', statusColor: 'text-amber-400' },
  { name: 'GATE Food Technology', status: 'Planned Q4 2026', statusColor: 'text-zinc-400' },
  { name: 'OpenAI Developer Certification', status: 'Planned Q4 2026', statusColor: 'text-zinc-400' },
  { name: 'APEDA Export Certification', status: 'Planned 2027', statusColor: 'text-zinc-500' },
];

export default function CareerPage() {
  // Live skills from IndexedDB
  const skills = useLiveQuery(() =>
    db.skills.orderBy('level').reverse().toArray()
  ) ?? [];

  // Job applications are local (no DB table for them yet)
  const [applications, setApplications] = useState<JobApplication[]>([
    { id: 1, company: 'ITC Limited – Foods Division', role: 'Assistant Manager R&D', status: 'Interviewing', appliedDate: '2026-06-10' },
    { id: 2, company: 'Tata Consumer Products', role: 'Scientist – Beverage Formulations', status: 'Applied', appliedDate: '2026-06-04' },
  ]);

  // Forms
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isJobOpen, setIsJobOpen] = useState(false);

  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Food Technology');
  const [skillLevel, setSkillLevel] = useState('5');

  const [jobCompany, setJobCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobStatus, setJobStatus] = useState('Applied');
  const [jobDate, setJobDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    await db.skills.add({
      name: skillName.trim(),
      category: skillCategory,
      level: parseInt(skillLevel) || 5,
      createdAt: new Date().toISOString(),
    });
    setSkillName('');
    setIsSkillOpen(false);
  };

  const handleIncrementSkill = async (skill: Skill) => {
    if (!skill.id || skill.level >= 10) return;
    await db.skills.update(skill.id, { level: skill.level + 1 });
  };

  const handleDeleteSkill = async (id: number) => {
    await db.skills.delete(id);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobCompany.trim()) return;
    setApplications([{
      id: Date.now(),
      company: jobCompany,
      role: jobRole,
      status: jobStatus,
      appliedDate: jobDate,
    }, ...applications]);
    setJobCompany('');
    setJobRole('');
    setIsJobOpen(false);
  };

  const avgSkillLevel = skills.length
    ? (skills.reduce((sum, s) => sum + s.level, 0) / skills.length).toFixed(1)
    : '—';

  const masterSkills = skills.filter(s => s.level >= 8).length;

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-500" />
            Career OS
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Professional skill matrix, job pipeline, and certification roadmap.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsSkillOpen(!isSkillOpen)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-3 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Skill
          </button>
          <button
            onClick={() => setIsJobOpen(!isJobOpen)}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-xs px-3 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Job
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Skills Tracked', value: skills.length, color: 'text-cyan-400' },
          { label: 'Avg. Proficiency', value: `${avgSkillLevel}/10`, color: 'text-amber-400' },
          { label: 'Expert Level (8+)', value: masterSkills, color: 'text-violet-400' },
        ].map(k => (
          <Card key={k.label} header={null}>
            <div className="text-center py-1">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Skill Form */}
      {isSkillOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Professional Skill</span>}>
          <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Skill Name *</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-cyan-600"
                  placeholder="e.g. Carrageenan Formulation"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select
                  value={skillCategory}
                  onChange={e => setSkillCategory(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-cyan-600"
                >
                  {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Current Level (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={skillLevel}
                  onChange={e => setSkillLevel(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-cyan-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSkillOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Add Skill
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Add Job Form */}
      {isJobOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Job Application</span>}>
          <form onSubmit={handleAddJob} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Company *</label>
                <input
                  type="text"
                  value={jobCompany}
                  onChange={e => setJobCompany(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-cyan-600"
                  placeholder="e.g. Nestlé India"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Role</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={e => setJobRole(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-cyan-600"
                  placeholder="e.g. R&D Scientist"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Status</label>
                <select
                  value={jobStatus}
                  onChange={e => setJobStatus(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-cyan-600"
                >
                  {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Applied Date</label>
                <input
                  type="date"
                  value={jobDate}
                  onChange={e => setJobDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-cyan-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsJobOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-white"
              >
                Add Application
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Matrix — 2 cols */}
        <div className="lg:col-span-2">
          <Card header={<span className="text-zinc-200 font-semibold">Professional Skill Matrix</span>}>
            {skills.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-sm">
                No skills tracked. Add your first skill above.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {skills.map(s => {
                  const pct = (s.level / 10) * 100;
                  const levelColor = s.level >= 8 ? 'text-emerald-400' :
                    s.level >= 5 ? 'text-amber-400' : 'text-rose-400';
                  const barColor = s.level >= 8 ? 'bg-emerald-500' :
                    s.level >= 5 ? 'bg-cyan-500' : 'bg-rose-500';
                  return (
                    <div key={s.id} className="p-3.5 border border-zinc-800 rounded-xl bg-zinc-950/40">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-200">{s.name}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{s.category}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xl font-extrabold font-mono ${levelColor}`}>{s.level}</span>
                          <span className="text-zinc-600 text-xs font-mono">/10</span>
                          <button
                            onClick={() => handleIncrementSkill(s)}
                            disabled={s.level >= 10}
                            className="ml-2 p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Increment level"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => s.id && handleDeleteSkill(s.id)}
                            className="p-1.5 rounded text-zinc-700 hover:text-rose-400 hover:bg-rose-900/20 border border-zinc-800 hover:border-rose-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Job Applications */}
          <Card header={<span className="text-zinc-200 font-semibold">Job Pipeline</span>}>
            <div className="flex flex-col gap-3">
              {applications.map(app => (
                <div key={app.id} className="p-3 border border-zinc-850 bg-zinc-950/40 rounded-lg">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 truncate">{app.company}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{app.role}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-medium rounded border flex-shrink-0 ${JOB_STATUS_COLORS[app.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-[9px] text-zinc-600 mt-2 font-mono">{app.appliedDate}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card header={<span className="text-zinc-200 font-semibold">Certifications Roadmap</span>}>
            <div className="flex flex-col gap-3">
              {CERTIFICATIONS.map(cert => (
                <div key={cert.name} className="flex items-center gap-3 py-2 border-b border-zinc-850 last:border-none">
                  <Award className={`w-4 h-4 flex-shrink-0 ${cert.statusColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 leading-snug">{cert.name}</div>
                    <div className={`text-[10px] mt-0.5 ${cert.statusColor}`}>{cert.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
