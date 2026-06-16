'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  Clock, Flame, Save, Play, Pause, RotateCcw, BookOpenCheck,
  Calendar, CheckCircle2, TrendingUp, Timer, X
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = [
  { label: 'Morning', time: '6–9 AM' },
  { label: 'Forenoon', time: '9–12 PM' },
  { label: 'Afternoon', time: '12–3 PM' },
  { label: 'Evening', time: '3–6 PM' },
  { label: 'Night', time: '6–9 PM' },
  { label: 'Late', time: '9–12 PM' },
];

const SUBJECT_COLORS: Record<string, string> = {
  'Food Science': '#006D77',
  'Food Safety': '#D4A017',
  'Food Microbiology': '#10b981',
  'General Science': '#8b5cf6',
  'General Awareness': '#00B4D8',
};

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

interface WeekPlan {
  [key: string]: { subject: string; examName: string; color: string } | null;
}

// ─── Pomodoro Timer ──────────────────────────────────────────────────────────

function PomodoroTimer({ onComplete }: { onComplete: () => void }) {
  const [seconds, setSeconds] = useState(POMODORO_DURATION);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setCompleted(true);
            onComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, onComplete]);

  const reset = () => {
    setRunning(false);
    setSeconds(POMODORO_DURATION);
    setCompleted(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const progress = (POMODORO_DURATION - seconds) / POMODORO_DURATION;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - progress * circ;
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  const color = completed ? '#10b981' : running ? '#D4A017' : '#006D77';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xl font-bold text-zinc-100">{mm}:{ss}</span>
        </div>
      </div>

      {completed && (
        <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          Pomodoro Complete! Log your session ↓
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={completed}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-40"
        >
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
      <p className="text-[10px] text-zinc-500 text-center">
        Timer completes after 25 min · Log session when done
      </p>
    </div>
  );
}

// ─── Streak Tracker ──────────────────────────────────────────────────────────

function StreakDisplay({ sessions }: { sessions: { date: string }[] }) {
  const streak = useMemo(() => {
    const uniqueDates = [...new Set(sessions.map((s) => s.date))].sort((a, b) => b.localeCompare(a));
    if (uniqueDates.length === 0) return 0;
    let count = 0;
    const today = new Date().toISOString().split('T')[0];
    let current = today;
    for (const date of uniqueDates) {
      if (date === current) {
        count++;
        const d = new Date(current);
        d.setDate(d.getDate() - 1);
        current = d.toISOString().split('T')[0];
      } else if (date < current) {
        break;
      }
    }
    return count;
  }, [sessions]);

  return (
    <div className="flex items-center gap-2">
      <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-400' : 'text-zinc-600'}`} />
      <div>
        <div className="font-mono font-bold text-lg text-zinc-100">{streak}</div>
        <div className="text-[10px] text-zinc-500">day streak</div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StudyPlannerPage() {
  const exams = useLiveQuery(() => db.exams.toArray()) || [];
  const sessions = useLiveQuery(() => db.studySessions.toArray()) || [];

  // Session log form
  const [logExamId, setLogExamId] = useState('');
  const [logSubject, setLogSubject] = useState('');
  const [logTopic, setLogTopic] = useState('');
  const [logDuration, setLogDuration] = useState('25');
  const [logNotes, setLogNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logSaving, setLogSaving] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Week plan grid state (in-memory, user can assign subjects to cells)
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});
  const [assignCell, setAssignCell] = useState<string | null>(null);
  const [assignSubject, setAssignSubject] = useState('Food Science');
  const [assignExam, setAssignExam] = useState('');

  const handlePomodoroComplete = useCallback(() => {
    // Pre-fill session form
    setLogDuration('25');
  }, []);

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
      await db.exams.update(eid, {
        studyHours: (exam.studyHours || 0) + dur / 60,
      });
      setLogSubject(''); setLogTopic(''); setLogDuration('25'); setLogNotes('');
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLogSaving(false);
    }
  };

  // Today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === today);
  const todayTotal = todaySessions.reduce((a, s) => a + s.durationMinutes, 0);

  // Last 7 days grouped
  const last7 = useMemo(() => {
    const map: Record<string, typeof sessions> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      map[ds] = sessions.filter((s) => s.date === ds);
    }
    return map;
  }, [sessions]);

  // Subject allocation pie data
  const subjectPieData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.subject] = (map[s.subject] || 0) + s.durationMinutes;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const PIE_COLORS_LIST = ['#006D77', '#D4A017', '#10b981', '#8b5cf6', '#00B4D8', '#f43f5e'];

  const handleCellClick = (cellKey: string) => {
    setAssignCell(cellKey);
    if (exams.length > 0 && !assignExam) setAssignExam(String(exams[0].id));
  };

  const handleAssign = () => {
    if (!assignCell) return;
    const exam = exams.find((e) => String(e.id) === assignExam);
    setWeekPlan((prev) => ({
      ...prev,
      [assignCell]: {
        subject: assignSubject,
        examName: exam?.name || '',
        color: SUBJECT_COLORS[assignSubject] || '#006D77',
      },
    }));
    setAssignCell(null);
  };

  const handleClearCell = (cellKey: string) => {
    setWeekPlan((prev) => { const n = { ...prev }; delete n[cellKey]; return n; });
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-400" />
            Smart Study Planner
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">Weekly schedule, Pomodoro timer & session tracking.</p>
        </div>
        <StreakDisplay sessions={sessions} />
      </div>

      {/* Weekly Plan Grid */}
      <Card header={<span className="text-zinc-200 font-semibold">Weekly Study Grid — Click any cell to assign a subject</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-zinc-500 font-medium w-28">Slot</th>
                {DAYS.map((d) => (
                  <th key={d} className="p-2 text-center text-zinc-400 font-semibold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot.label} className="border-t border-zinc-800/50">
                  <td className="p-2">
                    <div className="text-[10px] font-semibold text-zinc-300">{slot.label}</div>
                    <div className="text-[9px] text-zinc-600">{slot.time}</div>
                  </td>
                  {DAYS.map((day) => {
                    const cellKey = `${day}-${slot.label}`;
                    const cell = weekPlan[cellKey];
                    return (
                      <td key={day} className="p-1">
                        {cell ? (
                          <div
                            className="rounded-lg p-1.5 text-center text-[9px] font-semibold relative group cursor-pointer"
                            style={{ backgroundColor: `${cell.color}20`, border: `1px solid ${cell.color}50`, color: cell.color }}
                          >
                            <div className="truncate">{cell.subject}</div>
                            <button
                              onClick={() => handleClearCell(cellKey)}
                              className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 bg-zinc-900 border border-zinc-700 rounded-full items-center justify-center"
                            >
                              <X className="w-2.5 h-2.5 text-zinc-400" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellClick(cellKey)}
                            className="w-full h-9 rounded-lg border border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/30 transition-colors text-zinc-700 hover:text-zinc-500 text-[9px]"
                          >
                            +
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cell Assignment Modal */}
        {assignCell && (
          <div className="mt-4 p-4 rounded-xl border border-teal-500/30 bg-teal-500/5">
            <h4 className="text-xs font-semibold text-zinc-200 mb-3">
              Assign: <span className="text-teal-400">{assignCell}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400">Exam</label>
                <select value={assignExam} onChange={(e) => setAssignExam(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 outline-none">
                  <option value="">— Select —</option>
                  {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400">Subject</label>
                <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 outline-none">
                  {Object.keys(SUBJECT_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handleAssign}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors">
                  Assign
                </button>
                <button onClick={() => setAssignCell(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Middle Row: Pomodoro + Session Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <Card header={
          <span className="text-zinc-200 font-semibold flex items-center gap-2">
            <Timer className="w-4 h-4 text-orange-400" />
            Pomodoro Timer
          </span>
        }>
          <PomodoroTimer onComplete={handlePomodoroComplete} />
        </Card>

        {/* Session Quick Log */}
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
                <label className="text-[10px] text-zinc-400 font-medium">Exam</label>
                <select value={logExamId} onChange={(e) => setLogExamId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-400 focus:border-amber-500/50" required>
                  <option value="">— Select —</option>
                  {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-medium">Subject</label>
                <input type="text" value={logSubject} onChange={(e) => setLogSubject(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50"
                  placeholder="Food Science" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-medium">Topic</label>
                <input type="text" value={logTopic} onChange={(e) => setLogTopic(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50"
                  placeholder="Carrageenan" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-400 font-medium">Duration (minutes)</label>
              <input type="number" value={logDuration} onChange={(e) => setLogDuration(e.target.value)} min="1"
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50"
                placeholder="25" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-400 font-medium">Notes</label>
              <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-200 focus:border-amber-500/50 h-14 resize-none"
                placeholder="Key insights..." />
            </div>
            <button type="submit" disabled={logSaving}
              className={`w-full font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                logSuccess ? 'bg-emerald-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}>
              {logSuccess ? <><CheckCircle2 className="w-4 h-4" /> Logged!</> : <><Save className="w-4 h-4" /> {logSaving ? 'Saving...' : 'Log Session'}</>}
            </button>
          </form>
        </Card>
      </div>

      {/* Bottom Row: Session History + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions + Last 7 Days */}
        <Card header={
          <span className="text-zinc-200 font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            Session History
          </span>
        }>
          {/* Today */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">Today</span>
              <span className="text-[10px] font-mono text-amber-400">{todayTotal} min total</span>
            </div>
            {todaySessions.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {todaySessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                    <div>
                      <span className="text-xs text-zinc-200 font-medium">{s.subject}</span>
                      {s.topic && <span className="text-[10px] text-zinc-500 ml-2">· {s.topic}</span>}
                    </div>
                    <span className="text-[10px] font-mono text-teal-400">{s.durationMinutes}m</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600 text-center py-3">No sessions today yet.</p>
            )}
          </div>

          {/* Last 7 days */}
          <div className="border-t border-zinc-800 pt-3">
            <span className="text-xs font-semibold text-zinc-300 block mb-2">Last 7 Days</span>
            <div className="flex flex-col gap-1">
              {Object.entries(last7)
                .filter(([, sess]) => sess.length > 0)
                .slice(0, 5)
                .map(([date, sess]) => {
                  const total = sess.reduce((a, s) => a + s.durationMinutes, 0);
                  return (
                    <div key={date} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">{date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">{sess.length} session{sess.length > 1 ? 's' : ''}</span>
                        <span className="font-mono text-amber-400">{total}m</span>
                      </div>
                    </div>
                  );
                })}
              {Object.values(last7).every((s) => s.length === 0) && (
                <p className="text-xs text-zinc-600 text-center py-2">No sessions in the last 7 days.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Subject Allocation Pie */}
        <Card header={
          <span className="text-zinc-200 font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Subject Distribution
          </span>
        }>
          {subjectPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={subjectPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={48}
                  paddingAngle={3}
                >
                  {subjectPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS_LIST[i % PIE_COLORS_LIST.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any) => [`${v} min`, name]}
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ color: '#a1a1aa', fontSize: 10 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-zinc-600 text-sm">
              No session data yet. Start logging!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
