'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Briefcase, Plus, GraduationCap, Award, BarChart3, Star } from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  targetLevel: number;
}

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
  date: string;
}

export default function CareerPage() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: "Food Hydrocolloids & Formulation", category: "Food Technology", level: 8, targetLevel: 10 },
    { id: 2, name: "B2B Sales & Outreach", category: "Sales", level: 6, targetLevel: 9 },
    { id: 3, name: "AI & Custom Agent Construction", category: "AI", level: 5, targetLevel: 8 }
  ]);

  const [applications, setApplications] = useState<Application[]>([
    { id: 1, company: "ITC Limited - Foods Division", role: "Assistant Manager R&D", status: "Interviewing", date: "2026-06-10" },
    { id: 2, company: "Tata Consumer Products", role: "Scientist - Beverage Formulations", status: "Applied", date: "2026-06-04" }
  ]);

  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Food Technology');
  const [skillLevel, setSkillLevel] = useState('5');
  const [skillTarget, setSkillTarget] = useState('8');
  const [isSkillOpen, setIsSkillOpen] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return;
    const skill: Skill = {
      id: Date.now(),
      name: skillName,
      category: skillCategory,
      level: parseInt(skillLevel) || 5,
      targetLevel: parseInt(skillTarget) || 8
    };
    setSkills([...skills, skill]);
    setSkillName('');
    setIsSkillOpen(false);
  };

  const handleIncrementSkill = (id: number) => {
    setSkills(skills.map(s => {
      if (s.id === id && s.level < 10) {
        return { ...s, level: s.level + 1 };
      }
      return s;
    }));
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-500" />
            Career OS
          </h1>
          <p className="text-sm text-zinc-400">Track professional skill gap analyses, enterprise job applications, and certification pipelines.</p>
        </div>
        <button 
          onClick={() => setIsSkillOpen(!isSkillOpen)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {isSkillOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Professional Skill</span>}>
          <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Skill Name</label>
                <input 
                  type="text" 
                  value={skillName} 
                  onChange={e => setSkillName(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Rheological analysis of polymers"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select 
                  value={skillCategory} 
                  onChange={e => setSkillCategory(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                >
                  <option value="Food Technology">Food Technology</option>
                  <option value="Sales">Sales & B2B Strategy</option>
                  <option value="AI">AI Systems & Agents</option>
                  <option value="Research">Academic Research</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Current Proficiency Level (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={skillLevel} 
                  onChange={e => setSkillLevel(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Target Level (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={skillTarget} 
                  onChange={e => setSkillTarget(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsSkillOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Skill matrix */}
          <Card header={<span className="text-zinc-200 font-semibold">Professional Skill Matrix</span>}>
            <div className="flex flex-col gap-5">
              {skills.map((s) => (
                <div key={s.id} className="p-3.5 border border-zinc-800 rounded-xl bg-zinc-950/40 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">{s.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{s.category}</p>
                    </div>
                    <button 
                      onClick={() => handleIncrementSkill(s.id)}
                      className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Increment
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-500">Current: Lvl {s.level}</span>
                      <span className="text-zinc-400">Target: Lvl {s.targetLevel}</span>
                    </div>
                    <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-cyan-500 h-full rounded-l-full" style={{ width: `${s.level * 10}%` }} />
                      <div className="bg-zinc-800 h-full" style={{ width: `${(s.targetLevel - s.level) * 10}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Jobs Applications */}
          <Card header={<span className="text-zinc-200 font-semibold">Job Applications Tracker</span>}>
            <div className="flex flex-col gap-3.5">
              {applications.map((app) => (
                <div key={app.id} className="p-3 border border-zinc-850 bg-zinc-950/40 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">{app.company}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{app.role}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {app.status}
                    </span>
                    <div className="text-[9px] text-zinc-500 mt-1">{app.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications Tracker */}
          <Card header={<span className="text-zinc-200 font-semibold">Target Certifications</span>}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 py-2 border-b border-zinc-850">
                <Award className="w-4 h-4 text-emerald-500" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-zinc-200">FSSAI Certified Food Analyst</div>
                  <div className="text-[10px] text-zinc-500">Exam preparation active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 last:border-none">
                <Award className="w-4 h-4 text-zinc-500" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-zinc-200">OpenAI Developer Certification</div>
                  <div className="text-[10px] text-zinc-500">Planned: Q4 2026</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
