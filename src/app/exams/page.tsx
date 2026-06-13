'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { BookOpen, CheckSquare, Plus, AlertCircle, BarChart3 } from 'lucide-react';

interface Exam {
  id: number;
  name: string;
  organization: string;
  date: string;
  progress: number;
  status: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([
    { id: 1, name: "Technical Officer Exam", organization: "FSSAI", date: "2026-08-15", progress: 65, status: "Active" },
    { id: 2, name: "Agricultural Research Service (ARS)", organization: "ICAR", date: "2026-10-22", progress: 40, status: "Planned" }
  ]);

  const [newName, setNewName] = useState('');
  const [newOrg, setNewOrg] = useState('FSSAI');
  const [newDate, setNewDate] = useState('');
  const [newProgress, setNewProgress] = useState('30');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const exam: Exam = {
      id: Date.now(),
      name: newName,
      organization: newOrg,
      date: newDate || new Date().toISOString().split('T')[0],
      progress: parseInt(newProgress) || 0,
      status: "Active"
    };
    setExams([...exams, exam]);
    setNewName('');
    setIsAddOpen(false);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Government Exam OS
          </h1>
          <p className="text-sm text-zinc-400">Track exams timeline (FSSAI, ICAR, NIFTEM, CFTRI), syllabus checklists, and mock diagnostics.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Track Exam
        </button>
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Exam Notification</span>}>
          <form onSubmit={handleAddExam} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Exam Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Technical Officer Grade I"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Target Organization</label>
                <select 
                  value={newOrg} 
                  onChange={e => setNewOrg(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                >
                  <option value="FSSAI">FSSAI</option>
                  <option value="ICAR">ICAR</option>
                  <option value="NIFTEM">NIFTEM</option>
                  <option value="CFTRI">CFTRI</option>
                  <option value="State Govt">State Government / PSUs</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Exam Date</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Baseline Prep Progress (%)</label>
                <input 
                  type="number" 
                  value={newProgress} 
                  onChange={e => setNewProgress(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
              >
                Track Now
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card header={<span className="text-zinc-200 font-semibold">Active Notifications</span>}>
            <div className="flex flex-col gap-4">
              {exams.map((exam) => (
                <div key={exam.id} className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">{exam.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{exam.organization} • Targeted Exam Date: {exam.date}</p>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {exam.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">Syllabus Completion</span>
                      <span className="font-semibold text-zinc-300">{exam.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${exam.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Mock Diagnostics */}
          <Card header={<span className="text-zinc-200 font-semibold">Mock Test Diagnostics</span>}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-850">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">FSSAI Regulation Mock 3</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">84/100 correct answers</div>
                </div>
                <span className="text-xs text-emerald-400 font-bold">84%</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Agri Eng General Mock 1</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">72/100 correct answers</div>
                </div>
                <span className="text-xs text-amber-400 font-bold">72%</span>
              </div>
            </div>
          </Card>

          {/* Revision Focus */}
          <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-400" /> Weak Area Analysis</span>}>
            <div className="flex flex-col gap-2.5 text-xs text-zinc-400 leading-relaxed">
              <div className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>**FSSAI Acts Section 22**: Review guidelines for functional food stabilizer approvals.</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>**Viscosity Equations**: Review shear dynamics calculations for non-Newtonian carrageenan mixes.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
