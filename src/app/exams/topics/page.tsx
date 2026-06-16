'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type StudyTopic } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  BookOpen, CheckCircle, Clock, AlertTriangle, ArrowRight, RefreshCw, 
  ChevronRight, Award, Plus, Trash2, Calendar
} from 'lucide-react';

const HARDCODED_SYLLABUS = [
  {
    subject: 'Food Science & Technology',
    topics: ['Carbohydrates', 'Proteins', 'Lipids', 'Food Additives', 'Food Processing', 'Preservation Methods', 'Packaging']
  },
  {
    subject: 'Food Safety & Regulations',
    topics: ['FSSAI Act 2006', 'Food Standards', 'Labeling', 'Contaminants', 'Pesticides', 'Food Hygiene']
  },
  {
    subject: 'Food Microbiology',
    topics: ['Bacteria', 'Fungi', 'Viruses', 'Fermentation', 'HACCP', 'GMP']
  },
  {
    subject: 'General Science',
    topics: ['Chemistry', 'Physics', 'Biology basics']
  },
  {
    subject: 'General Awareness',
    topics: ['Current affairs', 'Government schemes']
  }
];

export default function TopicsPage() {
  const exams = useLiveQuery(() => db.exams.toArray()) || [];
  const dbTopics = useLiveQuery(() => db.studyTopics.toArray()) || [];

  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'All' | 'Weak' | 'Revision'>('All');

  // Add exam modal states
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');

  const activeExam = exams.find(e => e.id === parseInt(selectedExamId)) || exams[0] || null;
  const examId = activeExam?.id || 0;

  // Initialize selected exam id on load
  React.useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id!.toString());
    }
  }, [exams, selectedExamId]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) return;

    const newId = await db.exams.add({
      name: newExamName,
      status: 'Active',
      studyHours: 0,
      createdAt: new Date().toISOString()
    });

    setSelectedExamId(newId.toString());
    setNewExamName('');
    setIsExamModalOpen(false);
  };

  // Toggle study topic state
  const handleToggleStatus = async (subject: string, topicName: string, currentStatus: StudyTopic['status']) => {
    if (!examId) return;

    const existing = dbTopics.find(t => t.examId === examId && t.subject === subject && t.name === topicName);
    const now = new Date().toISOString();

    if (existing) {
      let nextStatus: StudyTopic['status'] = 'Not Started';
      let nextRev: string | undefined = undefined;

      if (currentStatus === 'Not Started') {
        nextStatus = 'In Progress';
      } else if (currentStatus === 'In Progress') {
        nextStatus = 'Completed';
        // set next revision spacing (+3 days by default)
        const d = new Date();
        d.setDate(d.getDate() + 3);
        nextRev = d.toISOString().split('T')[0];
      }

      await db.studyTopics.update(existing.id!, {
        status: nextStatus,
        lastRevised: nextStatus === 'Completed' ? now.split('T')[0] : undefined,
        nextRevision: nextRev
      });
    } else {
      // Create new StudyTopic row in Dexie
      await db.studyTopics.add({
        examId,
        subject,
        name: topicName,
        status: 'In Progress',
        importance: 2, // Medium default
        createdAt: now
      });
    }
  };

  // Update importance score
  const handleUpdateImportance = async (subject: string, topicName: string, imp: 1 | 2 | 3) => {
    if (!examId) return;
    const existing = dbTopics.find(t => t.examId === examId && t.subject === subject && t.name === topicName);
    
    if (existing) {
      await db.studyTopics.update(existing.id!, { importance: imp });
    } else {
      await db.studyTopics.add({
        examId,
        subject,
        name: topicName,
        status: 'Not Started',
        importance: imp,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Mark for revision scheduler
  const scheduleRevision = async (topicId: number, days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const nextRev = d.toISOString().split('T')[0];
    await db.studyTopics.update(topicId, {
      nextRevision: nextRev,
      lastRevised: new Date().toISOString().split('T')[0]
    });
  };

  // Get status and importance of a topic
  const getTopicMeta = (subject: string, topicName: string) => {
    const found = dbTopics.find(t => t.examId === examId && t.subject === subject && t.name === topicName);
    return {
      status: found?.status || 'Not Started',
      importance: found?.importance || 2, // Medium default
      nextRevision: found?.nextRevision,
      id: found?.id
    };
  };

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Syllabus Tracker</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#00B4D8]" />
            SYLLABUS & TOPICS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Prioritize high-importance subjects, schedule spaced repetitions, and monitor syllabus completion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Exam Selector */}
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="py-2 px-3 bg-[#0F172A] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsExamModalOpen(true)}
            className="btn-primary text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Track Exam
          </button>
        </div>
      </div>

      {activeExam ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Filters & Progress Summary */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card header={<span className="text-xs font-mono tracking-widest text-[#D4A017] uppercase">Filter View</span>}>
              <div className="flex flex-col gap-2.5">
                {(['All', 'Weak', 'Revision'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      filterMode === mode 
                        ? 'bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8]' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {mode === 'All' && 'All Topics'}
                    {mode === 'Weak' && '⚠️ Weak Targets'}
                    {mode === 'Revision' && '🔄 Due for Revision'}
                  </button>
                ))}
              </div>
            </Card>

            {/* Subject Completion Progress */}
            <Card header={<span className="text-xs font-mono tracking-widest text-[#00B4D8] uppercase">Completion Metrics</span>}>
              <div className="flex flex-col gap-4">
                {HARDCODED_SYLLABUS.map((subj, idx) => {
                  const examSubjTopics = dbTopics.filter(t => t.examId === examId && t.subject === subj.subject);
                  const completedCount = examSubjTopics.filter(t => t.status === 'Completed').length;
                  const totalCount = subj.topics.length;
                  const pct = Math.round((completedCount / totalCount) * 100);

                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 truncate max-w-[150px]">{subj.subject}</span>
                        <span className="text-slate-300 font-bold">{completedCount}/{totalCount} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#006D77] to-[#00B4D8]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Syllabus topics list (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {HARDCODED_SYLLABUS.map((subj, sIdx) => {
              
              // Filter topics in this subject based on filterMode
              const displayTopics = subj.topics.filter(topic => {
                const meta = getTopicMeta(subj.subject, topic);
                if (filterMode === 'Weak') {
                  // Not Started or In Progress + High Importance (importance = 3)
                  return meta.status !== 'Completed' && meta.importance === 3;
                }
                if (filterMode === 'Revision') {
                  // Completed + has revision date due
                  if (meta.status !== 'Completed') return false;
                  if (!meta.nextRevision) return false;
                  return new Date(meta.nextRevision).getTime() <= new Date().getTime();
                }
                return true;
              });

              if (displayTopics.length === 0) return null;

              return (
                <Card 
                  key={sIdx}
                  header={
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-serif font-bold text-slate-100">{subj.subject}</span>
                      <span className="text-[10px] font-mono text-slate-500">{displayTopics.length} Topics</span>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-3">
                    {displayTopics.map((topic, tIdx) => {
                      const meta = getTopicMeta(subj.subject, topic);
                      
                      return (
                        <div key={tIdx} className="p-3 border border-slate-850 bg-[#0B1220]/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-slate-800 transition-all">
                          
                          <div className="flex-1 flex items-center gap-3">
                            <button
                              onClick={() => handleToggleStatus(subj.subject, topic, meta.status)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                meta.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                meta.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                'bg-slate-900 border-slate-800 text-slate-500'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <div>
                              <span className="text-xs font-bold text-slate-200 block">{topic}</span>
                              <span className="text-[9px] font-mono text-slate-500 uppercase">Stage: {meta.status}</span>
                            </div>
                          </div>

                          {/* Spaced Repetition controls for Completed topics */}
                          {meta.status === 'Completed' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                Revise: {meta.nextRevision || 'Not set'}
                              </span>
                              
                              <div className="flex gap-1">
                                {[1, 7, 30].map(days => (
                                  <button
                                    key={days}
                                    onClick={() => scheduleRevision(meta.id!, days)}
                                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700 cursor-pointer"
                                    title={`Schedule revision in ${days} days`}
                                  >
                                    +{days}d
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Importance Rating */}
                          <div className="flex items-center gap-2 border-l border-slate-850 pl-3">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">Importance</span>
                            <div className="flex gap-1 bg-slate-950 p-0.5 border border-slate-850 rounded">
                              {([3, 2, 1] as const).map(imp => (
                                <button
                                  key={imp}
                                  onClick={() => handleUpdateImportance(subj.subject, topic, imp)}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                                    meta.importance === imp
                                      ? imp === 3 ? 'bg-rose-500/20 text-rose-400' :
                                        imp === 2 ? 'bg-[#D4A017]/20 text-[#D4A017]' :
                                        'bg-emerald-500/20 text-emerald-400'
                                      : 'text-slate-600 hover:text-slate-400'
                                  }`}
                                >
                                  {imp === 3 ? 'H' : imp === 2 ? 'M' : 'L'}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="bg-[#0F172A] border border-slate-850 rounded-2xl p-16 text-center text-slate-400 text-xs">
          No exams tracked yet. Track an exam to initialize topics list.
        </div>
      )}

      {/* TRACK EXAM DIALOG */}
      {isExamModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">Track Government Exam</h3>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateExam} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Exam Name</label>
                <input
                  type="text"
                  placeholder="e.g. FSSAI Technical Officer 2026"
                  value={newExamName}
                  onChange={e => setNewExamName(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Track Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
