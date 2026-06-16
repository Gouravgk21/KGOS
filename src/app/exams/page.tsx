'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Exam, type StudySession } from '@/db/database';
import { useExamStore } from '@/store/useExamStore';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import {
  BookOpen, Plus, AlertCircle, Trash2, Edit, Calendar,
  BookOpenCheck, Hourglass, TrendingUp, Target, Brain,
  FlaskConical, BarChart3, X, Clock, Save, ChevronRight,
  Zap, Flame
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Readiness Gauge ────────────────────────────────────────────────────────

function ReadinessGauge({ value }: { value: number }) {
  const clamp = Math.min(100, Math.max(0, value));
  const radius = 80;
  const stroke = 14;
  const cx = 110;
  const cy = 110;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (clamp / 100) * circumference;

  const color =
    clamp >= 70 ? '#10b981' :
    clamp >= 40 ? '#D4A017' :
    '#f43f5e';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={220} height={130} viewBox="0 0 220 130">
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
        {/* Value label */}
        <text x={cx} y={cy - 10} textAnchor="middle" fill={color} fontSize="32" fontWeight="700" fontFamily="monospace">
          {clamp}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
          Overall Readiness
        </text>
      </svg>
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />≥70% Ready</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />40–70%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />{'<'}40% Weak</span>
      </div>
    </div>
  );
}

// ─── Exam Countdown Card ─────────────────────────────────────────────────────

function ExamCountdownCard({
  exam,
  sessions,
  onEdit,
  onDelete,
}: {
  exam: Exam;
  sessions: StudySession[];
  onEdit: (e: Exam) => void;
  onDelete: (id: number) => void;
}) {
  const examSessions = sessions.filter((s) => s.examId === exam.id);
  const totalMins = examSessions.reduce((a, s) => a + s.durationMinutes, 0);
  const totalHours = parseFloat((totalMins / 60).toFixed(1));
  const target = exam.targetHours || 200;
  const readiness = Math.min(100, Math.round((totalHours / target) * 100));

  let daysLeft: number | null = null;
  if (exam.examDate) {
    const diff = new Date(exam.examDate).getTime() - Date.now();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const urgent = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
  const readinessColor =
    readiness >= 70 ? 'text-emerald-400' :
    readiness >= 40 ? 'text-yellow-400' :
    'text-rose-400';

  const statusColor =
    exam.status === 'Active' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
    exam.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    'bg-zinc-700/40 text-zinc-400 border-zinc-600/20';

  return (
    <div
      className={`p-4 rounded-xl border bg-zinc-950/50 flex flex-col gap-3 transition-all ${
        urgent
          ? 'border-rose-500/40 shadow-[0_0_16px_rgba(244,63,94,0.15)]'
          : 'border-zinc-800'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-zinc-100 truncate">{exam.name}</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
            {exam.examDate ? `Exam: ${exam.examDate}` : 'No date set'}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded uppercase ${statusColor}`}>
            {exam.status}
          </span>
          <button onClick={() => onEdit(exam)} className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => exam.id !== undefined && onDelete(exam.id)}
            className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Countdown */}
      {daysLeft !== null && (
        <div className={`flex items-center gap-2 ${urgent ? 'text-rose-400' : 'text-zinc-300'}`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold text-lg font-mono">{daysLeft}</span>
          <span className="text-xs text-zinc-400">days remaining</span>
          {urgent && <span className="text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase">Urgent</span>}
        </div>
      )}

      {/* Readiness bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-zinc-400">Readiness</span>
          <span className={`text-xs font-bold font-mono ${readinessColor}`}>{readiness}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${readiness}%`,
              background: readiness >= 70 ? '#10b981' : readiness >= 40 ? '#D4A017' : '#f43f5e',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-[10px] text-zinc-500 font-mono border-t border-zinc-800/60 pt-2">
        <span className="flex items-center gap-1">
          <Hourglass className="w-3 h-3 text-amber-500" />
          {totalHours}h logged
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3 text-teal-400" />
          {target}h target
        </span>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-zinc-400 mb-1">{label}</p>
        <p className="text-amber-400 font-mono font-bold">{payload[0].value} min</p>
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#006D77', '#00B4D8', '#D4A017', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const exams = useLiveQuery(() => db.exams.toArray()) || [];
  const sessions = useLiveQuery(() => db.studySessions.toArray()) || [];
  const { addExam, updateExam, deleteExam } = useExamStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Exam form states
  const [name, setName] = useState('');
  const [org, setOrg] = useState('FSSAI');
  const [examDate, setExamDate] = useState('');
  const [appDate, setAppDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');
  const [targetHours, setTargetHours] = useState('200');
  const [maxMarks, setMaxMarks] = useState('300');

  // Study session log states
  const [logExamId, setLogExamId] = useState('');
  const [logSubject, setLogSubject] = useState('');
  const [logTopic, setLogTopic] = useState('');
  const [logDuration, setLogDuration] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logSaving, setLogSaving] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // ── Computed metrics ────────────────────────────────────────────────────────

  const overallReadiness = useMemo(() => {
    const activeExams = exams.filter((e) => e.status === 'Active');
    if (activeExams.length === 0) return 0;
    const scores = activeExams.map((exam) => {
      const examSessions = sessions.filter((s) => s.examId === exam.id);
      const totalMins = examSessions.reduce((a, s) => a + s.durationMinutes, 0);
      const totalHours = totalMins / 60;
      const target = exam.targetHours || 200;
      return Math.min(100, (totalHours / target) * 100);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [exams, sessions]);

  // 7-day velocity chart
  const velocityData = useMemo(() => {
    const days: { date: string; label: string; min: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const min = sessions
        .filter((s) => s.date === dateStr)
        .reduce((a, s) => a + s.durationMinutes, 0);
      days.push({ date: dateStr, label, min });
    }
    return days;
  }, [sessions]);

  // Subject breakdown pie
  const subjectData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.subject] = (map[s.subject] || 0) + s.durationMinutes;
    });
    return Object.entries(map)
      .map(([subject, min]) => ({ subject, min }))
      .sort((a, b) => b.min - a.min)
      .slice(0, 7);
  }, [sessions]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const notesCombined = `Org: ${org}\n\nNotes:\n${notes}`;
    if (editId !== null) {
      await updateExam(editId, {
        name,
        examDate: examDate || undefined,
        applicationDate: appDate || undefined,
        status,
        notes: notesCombined,
        targetHours: parseInt(targetHours) || 200,
        maxMarks: parseInt(maxMarks) || 300,
      });
      setEditId(null);
    } else {
      await addExam({
        name,
        examDate: examDate || undefined,
        applicationDate: appDate || undefined,
        status,
        notes: notesCombined,
        studyHours: 0,
        targetHours: parseInt(targetHours) || 200,
        maxMarks: parseInt(maxMarks) || 300,
      });
    }
    resetExamForm();
    setIsAddOpen(false);
  };

  const resetExamForm = () => {
    setName(''); setOrg('FSSAI'); setExamDate(''); setAppDate('');
    setStatus('Active'); setNotes(''); setTargetHours('200'); setMaxMarks('300');
  };

  const handleEdit = (exam: Exam) => {
    if (exam.id === undefined) return;
    setEditId(exam.id);
    setName(exam.name);
    setExamDate(exam.examDate || '');
    setAppDate(exam.applicationDate || '');
    setStatus(exam.status);
    setTargetHours(String(exam.targetHours || 200));
    setMaxMarks(String(exam.maxMarks || 300));
    const fullNotes = exam.notes || '';
    const orgMatch = fullNotes.match(/Org: (.*?)\n/);
    const notesMatch = fullNotes.split('\n\nNotes:\n');
    setOrg(orgMatch ? orgMatch[1] : 'FSSAI');
    setNotes(notesMatch.length > 1 ? notesMatch[1] : fullNotes);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this exam record?')) {
      await deleteExam(id);
    }
  };

  const handleSessionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const eid = parseInt(logExamId);
    const dur = parseInt(logDuration);
    if (isNaN(eid) || isNaN(dur) || dur <= 0 || !logSubject.trim()) return;
    const exam = exams.find((ex) => ex.id === eid);
    if (!exam) return;
    setLogSaving(true);
    try {
      await db.studySessions.add({
        examId: eid,
        subject: logSubject.trim(),
        topic: logTopic.trim(),
        durationMinutes: dur,
        notes: logNotes.trim(),
        date: logDate,
        createdAt: new Date().toISOString(),
      });
      // Also update exam's studyHours tally
      await db.exams.update(eid, {
        studyHours: (exam.studyHours || 0) + dur / 60,
      });
      setLogSubject(''); setLogTopic(''); setLogDuration(''); setLogNotes('');
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLogSaving(false);
    }
  };

  const quickNavLinks = [
    { href: '/exams/study-planner', label: 'Study Planner', icon: Calendar, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { href: '/exams/topics', label: 'Topics & Syllabus', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { href: '/exams/mock-tests', label: 'Mock Tests', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { href: '/exams/analytics', label: 'Analytics', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  const totalStudyMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const todaySessions = sessions.filter((s) => s.date === new Date().toISOString().split('T')[0]);
  const todayMinutes = todaySessions.reduce((a, s) => a + s.durationMinutes, 0);

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Government Exam OS
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            FSSAI · ICAR · NIFTEM · CFTRI — track preparation, sessions & readiness.
          </p>
        </div>
        <button
          onClick={() => { resetExamForm(); setEditId(null); setIsAddOpen(!isAddOpen); }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Track Exam
        </button>
      </div>

      {/* Add/Edit Exam Modal */}
      {isAddOpen && (
        <Card header={
          <div className="flex justify-between items-center">
            <span className="text-zinc-200 font-semibold">{editId !== null ? 'Modify Tracked Exam' : 'Track New Exam'}</span>
            <button onClick={() => setIsAddOpen(false)} className="text-zinc-500 hover:text-zinc-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        }>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Exam / Notification Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-amber-500/50"
                  placeholder="e.g. FSSAI Technical Officer Grade I"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Target Organization</label>
                <select value={org} onChange={(e) => setOrg(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-amber-500/50">
                  <option value="FSSAI">FSSAI</option>
                  <option value="ICAR">ICAR</option>
                  <option value="NIFTEM">NIFTEM</option>
                  <option value="CFTRI">CFTRI</option>
                  <option value="State Govt">State Government / PSUs</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Application Date</label>
                <input type="date" value={appDate} onChange={(e) => setAppDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-amber-500/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Exam Date</label>
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-amber-500/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Target Hours</label>
                <input type="number" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} min="1"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-amber-500/50"
                  placeholder="200" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Max Marks</label>
                <input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} min="1"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-amber-500/50"
                  placeholder="300" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Preparation Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-amber-500/50">
                  <option value="Active">Active</option>
                  <option value="Planned">Planned</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Syllabus Focus & Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-amber-500/50 h-10 resize-none"
                  placeholder="Focus areas, topics to prioritize..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors">
                {editId !== null ? 'Save Changes' : 'Track Exam'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: `${Math.round(totalStudyMinutes / 60)}h`, icon: Hourglass, color: '#D4A017' },
          { label: "Today's Minutes", value: `${todayMinutes}m`, icon: Zap, color: '#00B4D8' },
          { label: 'Active Exams', value: exams.filter(e => e.status === 'Active').length, icon: Target, color: '#10b981' },
          { label: 'Total Sessions', value: sessions.length, icon: FlaskConical, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Readiness + Countdown */}
        <div className="flex flex-col gap-6">
          {/* Readiness Gauge */}
          <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-teal-400" />Overall Readiness</span>}>
            <ReadinessGauge value={overallReadiness} />
          </Card>

          {/* Quick Nav */}
          <Card header={<span className="text-zinc-200 font-semibold">Quick Navigation</span>}>
            <div className="grid grid-cols-2 gap-2">
              {quickNavLinks.map(({ href, label, icon: Icon, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${bg} hover:scale-[1.02] transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-[10px] font-semibold text-zinc-300 text-center leading-tight">{label}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Center: Exam Countdown Cards */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Exam Countdown</h2>
            <span className="text-[10px] text-zinc-500">{exams.filter(e => e.status === 'Active').length} active</span>
          </div>
          {exams.length > 0 ? (
            exams.map((exam) => (
              <ExamCountdownCard
                key={exam.id}
                exam={exam}
                sessions={sessions}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 p-10 border border-dashed border-zinc-800 rounded-xl text-center">
              <BookOpen className="w-8 h-8 text-zinc-700" />
              <p className="text-sm text-zinc-500">No exams tracked yet.</p>
              <button
                onClick={() => { resetExamForm(); setIsAddOpen(true); }}
                className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Add your first exam
              </button>
            </div>
          )}
        </div>

        {/* Right: Log + Charts */}
        <div className="flex flex-col gap-6">
          {/* Today's Study Session Log */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-amber-500" />
              Log Study Session
            </span>
          }>
            <form onSubmit={handleSessionLog} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-400 font-medium">Date</label>
                  <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-300 focus:border-amber-500/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-400 font-medium">Select Exam</label>
                  <select value={logExamId} onChange={(e) => setLogExamId(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-400 focus:border-amber-500/50" required>
                    <option value="">— Exam —</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-400 font-medium">Subject</label>
                  <input type="text" value={logSubject} onChange={(e) => setLogSubject(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50"
                    placeholder="e.g. Food Science" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-400 font-medium">Topic</label>
                  <input type="text" value={logTopic} onChange={(e) => setLogTopic(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50"
                    placeholder="e.g. Carrageenan" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-medium">Duration (minutes)</label>
                <input type="number" value={logDuration} onChange={(e) => setLogDuration(e.target.value)} min="1"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50"
                  placeholder="e.g. 60" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-medium">Notes (optional)</label>
                <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50 h-16 resize-none"
                  placeholder="Key insights from this session..." />
              </div>
              <button type="submit" disabled={logSaving}
                className={`w-full font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  logSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}>
                {logSuccess ? (
                  <><BookOpenCheck className="w-4 h-4" /> Logged!</>
                ) : (
                  <><Save className="w-4 h-4" /> {logSaving ? 'Saving...' : 'Log Session'}</>
                )}
              </button>
            </form>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Velocity */}
        <Card header={
          <span className="text-zinc-200 font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            Study Velocity — 7 Days
          </span>
        }>
          {velocityData.some((d) => d.min > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={velocityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A017" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="min" stroke="#D4A017" strokeWidth={2} fill="url(#velGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm">
              No sessions this week. Start studying!
            </div>
          )}
        </Card>

        {/* Subject Breakdown */}
        <Card header={
          <span className="text-zinc-200 font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Study by Subject
          </span>
        }>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="subject"
                  type="category"
                  tick={{ fill: '#a1a1aa', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  formatter={(v: any) => [`${v} min`, 'Study Time']}
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="min" radius={[0, 4, 4, 0]}>
                  {subjectData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm">
              No session data yet.
            </div>
          )}
        </Card>
      </div>

      {/* Weak Area Alert */}
      {sessions.length === 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 mb-1">Get Started with Exam OS</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                1. Track an exam above → 2. Log study sessions → 3. Visit{' '}
                <Link href="/exams/topics" className="text-teal-400 hover:underline">Topics</Link> to track syllabus →
                4. Take <Link href="/exams/mock-tests" className="text-purple-400 hover:underline">Mock Tests</Link> →
                5. Monitor <Link href="/exams/analytics" className="text-blue-400 hover:underline">Analytics</Link>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
