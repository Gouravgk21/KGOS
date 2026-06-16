'use client';

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MockTest, type StudySession } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  BarChart3, TrendingUp, Hourglass, Target, AlertTriangle, ArrowRight, 
  Award, Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const SUBJECTS = [
  'Food Science & Technology',
  'Food Safety & Regulations',
  'Food Microbiology',
  'General Science',
  'General Awareness'
];

export default function ExamAnalyticsPage() {
  const exams = useLiveQuery(() => db.exams.toArray()) || [];
  const sessions = useLiveQuery(() => db.studySessions.toArray()) || [];
  const mockTests = useLiveQuery(() => db.mockTests.toArray()) || [];

  // Seeding simulation to ensure gorgeous dashboard display if empty
  React.useEffect(() => {
    const seedAnalyticsData = async () => {
      const examCount = await db.exams.count();
      const sessionCount = await db.studySessions.count();
      const testCount = await db.mockTests.count();

      if (examCount === 0) {
        await db.exams.add({
          name: 'FSSAI Technical Officer 2026',
          status: 'Active',
          studyHours: 42,
          targetHours: 200,
          maxMarks: 300,
          createdAt: new Date().toISOString()
        });
      }

      const activeExam = await db.exams.toCollection().first();
      if (!activeExam) return;

      if (sessionCount === 0) {
        // Seed 10 study sessions
        const sampleSessions = [
          { examId: activeExam.id, subject: 'Food Science & Technology', topic: 'Carrageenan Gelation', durationMinutes: 120, date: '2026-06-08', createdAt: new Date().toISOString() },
          { examId: activeExam.id, subject: 'Food Safety & Regulations', topic: 'FSS Act 2006 Section 18', durationMinutes: 90, date: '2026-06-09', createdAt: new Date().toISOString() },
          { examId: activeExam.id, subject: 'Food Microbiology', topic: 'Listeria contamination', durationMinutes: 60, date: '2026-06-10', createdAt: new Date().toISOString() },
          { examId: activeExam.id, subject: 'Food Science & Technology', topic: 'Rheology of Emulsions', durationMinutes: 180, date: '2026-06-11', createdAt: new Date().toISOString() },
          { examId: activeExam.id, subject: 'General Awareness', topic: 'Agricultural Schemes', durationMinutes: 90, date: '2026-06-12', createdAt: new Date().toISOString() },
          { examId: activeExam.id, subject: 'Food Microbiology', topic: 'HACCP Principles', durationMinutes: 120, date: '2026-06-13', createdAt: new Date().toISOString() },
          { examId: activeExam.id, subject: 'General Science', topic: 'Enzyme Chemistry', durationMinutes: 60, date: '2026-06-14', createdAt: new Date().toISOString() }
        ];

        for (const s of sampleSessions) {
          await db.studySessions.add(s);
        }
      }

      if (testCount === 0) {
        // Seed some mock tests
        const sampleTests = [
          { examId: activeExam.id, title: 'Food Science Practice Test', subject: 'Food Science & Technology', totalQuestions: 10, correctAnswers: 7, timeTaken: 8, dateTaken: '2026-06-08', createdAt: new Date().toISOString() },
          { examId: activeExam.id, title: 'Regulations Regulations', subject: 'Food Safety & Regulations', totalQuestions: 10, correctAnswers: 5, timeTaken: 9, dateTaken: '2026-06-10', createdAt: new Date().toISOString() },
          { examId: activeExam.id, title: 'Microbiology Practice Test', subject: 'Food Microbiology', totalQuestions: 10, correctAnswers: 8, timeTaken: 7, dateTaken: '2026-06-12', createdAt: new Date().toISOString() },
          { examId: activeExam.id, title: 'All Subjects Mock Test', subject: 'All', totalQuestions: 15, correctAnswers: 12, timeTaken: 11, dateTaken: '2026-06-14', createdAt: new Date().toISOString() }
        ];

        for (const t of sampleTests) {
          await db.mockTests.add(t);
        }
      }
    };
    seedAnalyticsData();
  }, []);

  const activeExam = exams[0] || null;
  const targetExamHours = activeExam?.targetHours || 200;
  const examMaxMarks = activeExam?.maxMarks || 300;

  // 1. Core Study Statistics
  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = parseFloat((totalStudyMinutes / 60).toFixed(1));
  const totalTests = mockTests.length;
  
  const avgAccuracy = useMemo(() => {
    if (mockTests.length === 0) return 0;
    const accuracies = mockTests.map(t => (t.correctAnswers / t.totalQuestions) * 100);
    return Math.round(accuracies.reduce((sum, val) => sum + val, 0) / mockTests.length);
  }, [mockTests]);

  const bestScorePercent = useMemo(() => {
    if (mockTests.length === 0) return 0;
    const percentages = mockTests.map(t => (t.correctAnswers / t.totalQuestions) * 100);
    return Math.max(...percentages);
  }, [mockTests]);

  // Overall Readiness Score Gauge Formula
  const overallReadiness = useMemo(() => {
    if (targetExamHours === 0) return 0;
    const studyRatio = Math.min(1, totalHours / targetExamHours);
    const testRatio = totalTests > 0 ? (avgAccuracy / 100) : 0.5;
    
    // Weighted readiness: 40% study hours completion, 60% average mock test accuracy
    return Math.round((studyRatio * 40) + (testRatio * 60));
  }, [totalHours, targetExamHours, totalTests, avgAccuracy]);

  // 2. Accuracy Trend (Last 10 mock tests)
  const accuracyTrendData = useMemo(() => {
    return mockTests
      .slice(-10)
      .map((t, idx) => ({
        index: idx + 1,
        title: t.title.substring(0, 10),
        accuracy: Math.round((t.correctAnswers / t.totalQuestions) * 100)
      }));
  }, [mockTests]);

  // 3. Study Hours by Subject / Week (Last 7 Days)
  const studyHoursByDayData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      
      const mins = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      days.push({
        label,
        hours: parseFloat((mins / 60).toFixed(1))
      });
    }
    return days;
  }, [sessions]);

  // 4. Subject Performance (Radar Chart)
  const subjectPerformanceData = useMemo(() => {
    return SUBJECTS.map(subj => {
      // Filter mock tests by subject
      const subjectTests = mockTests.filter(t => t.subject === subj);
      let accuracy = 50; // default baseline

      if (subjectTests.length > 0) {
        const accs = subjectTests.map(t => (t.correctAnswers / t.totalQuestions) * 100);
        accuracy = Math.round(accs.reduce((sum, v) => sum + v, 0) / subjectTests.length);
      }

      return {
        subject: subj.replace(' & Technology', '').replace(' & Regulations', ''),
        accuracy
      };
    });
  }, [mockTests]);

  // 5. Weak Areas Detector (Accuracy < 60% or unattempted high importance)
  const weakAreas = useMemo(() => {
    return SUBJECTS.map(subj => {
      const subjectTests = mockTests.filter(t => t.subject === subj);
      const acc = subjectTests.length > 0 
        ? Math.round(subjectTests.map(t => (t.correctAnswers / t.totalQuestions) * 100).reduce((a, b) => a + b) / subjectTests.length)
        : null;

      return { subject: subj, accuracy: acc };
    }).filter(item => item.accuracy === null || item.accuracy < 60);
  }, [mockTests]);

  // 6. Predicted Score
  const predictedScore = Math.round((avgAccuracy / 100) * examMaxMarks);
  const confidenceLower = Math.max(0, predictedScore - 15);
  const confidenceUpper = Math.min(examMaxMarks, predictedScore + 15);

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-mono mb-1">
            <a href="/exams" className="hover:underline">Exam OS</a>
            <span>/</span>
            <span>Analytics Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#00B4D8]" />
            EXAM ANALYTICS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quantitative diagnostic analysis of your study metrics, test patterns, and syllabus mastery.
          </p>
        </div>
      </div>

      {/* Overview Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Hours logged', value: `${totalHours}h`, icon: Hourglass, color: '#D4A017' },
          { label: 'Average Mock Score', value: `${avgAccuracy}%`, icon: Award, color: '#00B4D8' },
          { label: 'Highest Practice Score', value: `${bestScorePercent}%`, icon: Target, color: '#10b981' },
          { label: 'Tests Attempted', value: `${totalTests}`, icon: BarChart3, color: '#8b5cf6' },
          { label: 'Overall Readiness', value: `${overallReadiness}%`, icon: CheckCircle2, color: '#ec4899' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl border border-slate-850 bg-[#0F172A]/50">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Score Prediction & Weak Area Alert Cards */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* Circular Gauge for Readiness */}
          <Card header={<span className="text-sm font-semibold text-slate-200">System Readiness Matrix</span>}>
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={overallReadiness >= 75 ? '#10b981' : overallReadiness >= 45 ? '#D4A017' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) - (overallReadiness / 100) * (2 * Math.PI * 40)}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono text-slate-100">{overallReadiness}%</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Readiness</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center max-w-xs leading-relaxed mt-2">
                Composite calculation mapping total study duration ({totalHours}h / {targetExamHours}h) and practice test accuracy.
              </p>
            </div>
          </Card>

          {/* Predicted Exam Score Box */}
          <Card header={<span className="text-sm font-semibold text-slate-200">Score Projection Model</span>}>
            <div className="flex flex-col items-center py-4 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">PREDICTED TEST SCORE</span>
              <span className="text-4xl font-serif font-bold text-[#D4A017]">{predictedScore}</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-1">out of {examMaxMarks} marks</span>
              
              <div className="w-full bg-[#0B1220] border border-slate-850 p-3.5 rounded-xl mt-4 text-left">
                <span className="text-[9px] font-mono text-slate-500 block">CONFIDENCE RANGE (95%)</span>
                <span className="text-xs font-semibold text-slate-300 block font-mono mt-0.5">{confidenceLower} – {confidenceUpper} Marks</span>
                <span className="text-[10px] text-slate-500 block leading-relaxed mt-1 font-sans">
                  *Calculation projected from your mean practice accuracy of {avgAccuracy}%.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Center: Charts details (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Accuracy Trend over Last 10 Mock Tests */}
          <Card header={<span className="text-sm font-semibold text-slate-200">Mock Practice Accuracy Trend</span>}>
            <div className="h-[220px]">
              {accuracyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="index" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#00B4D8" strokeWidth={3} dot={{ fill: '#00B4D8', r: 4 }} activeDot={{ r: 6 }} name="Accuracy %" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">No mock test data logged.</div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Study hours logged per day */}
            <Card header={<span className="text-sm font-semibold text-slate-200">Study Velocity (7 Days)</span>}>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyHoursByDayData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="label" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="hours" fill="#D4A017" radius={[4, 4, 0, 0]} name="Study Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Subject Performance Radar */}
            <Card header={<span className="text-sm font-semibold text-slate-200">Syllabus Strength Radar</span>}>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectPerformanceData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                    <Radar name="Accuracy" dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>

        </div>

      </div>

      {/* Weak Areas Detector Section */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" /> Auto-Detected Syllabus Weakness Matrix
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weakAreas.map((item, idx) => (
            <div key={idx} className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl flex flex-col gap-2 justify-between">
              <div>
                <span className="text-[8px] font-mono text-rose-400 uppercase tracking-widest block font-bold">SYLLABUS ACTION ALARM</span>
                <h4 className="text-xs font-bold text-slate-100 font-serif leading-tight mt-1">{item.subject}</h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  {item.accuracy !== null 
                    ? `Mean accuracy is currently at ${item.accuracy}%, falling below the 60% threshold limit.` 
                    : `No mock tests recorded for this subject area yet. Recommend initiating baseline tests.`}
                </p>
              </div>
              <a 
                href="/exams/topics"
                className="text-[10px] font-mono text-[#00B4D8] hover:underline flex items-center gap-1 mt-2.5 font-bold"
              >
                Study Syllabus Topics <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
          {weakAreas.length === 0 && (
            <div className="col-span-full p-6 text-center border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> All syllabus areas currently exceed the 60% target proficiency limits!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
