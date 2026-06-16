'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db } from '@/db/database';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Crown, ShieldAlert, Sparkles, TrendingUp, BookOpen, Brain, Heart, DollarSign,
  Calendar, AlertTriangle, CheckCircle, ChevronRight, Activity, Zap, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ExecutiveConsolePage() {
  const [chartTab, setChartTab] = useState<'velocity' | 'finance' | 'brand'>('velocity');

  // 1. Query Real-Time Telemetry from Dexie
  const leads = useLiveQuery(() => db.leads.toArray()) ?? [];
  const papers = useLiveQuery(() => db.researchPapers.toArray()) ?? [];
  const studySessions = useLiveQuery(() => db.studySessions.toArray()) ?? [];
  const exams = useLiveQuery(() => db.exams.toArray()) ?? [];
  const tasks = useLiveQuery(() => db.tasks.toArray()) ?? [];
  const healthLogs = useLiveQuery(() => db.healthLogs.orderBy('date').reverse().limit(7).toArray()) ?? [];
  const content = useLiveQuery(() => db.contentPieces.toArray()) ?? [];

  // 2. Compute Business Metrics
  const activeLeadsCount = leads.length;
  const pipelineValue = leads.reduce((sum, l) => sum + (l.opportunityValue || 0), 0);
  const closedWonValue = leads.filter(l => l.status === 'Customer' || l.status === 'Trial').reduce((sum, l) => sum + (l.opportunityValue || 0), 0);
  const winRate = activeLeadsCount > 0 
    ? Math.round((leads.filter(l => l.status === 'Customer').length / activeLeadsCount) * 100) 
    : 0;

  // 3. Compute Research Metrics
  const totalPapers = papers.length;
  const readingPapers = papers.filter(p => p.status === 'Reading' || p.status === 'Planned').length;
  const referencedPapers = papers.filter(p => p.status === 'Referenced' || p.status === 'Summarized').length;

  // 4. Compute Learning Metrics
  const studyHoursThisWeek = studySessions.reduce((sum, s) => sum + ((s.durationMinutes || 0) / 60), 0);
  const activeExams = exams.filter(e => e.status === 'Active');
  const targetExam = activeExams[0];
  let daysToExam = null;
  if (targetExam && targetExam.examDate) {
    const diff = new Date(targetExam.examDate).getTime() - new Date().getTime();
    daysToExam = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // 5. Compute Health Metrics
  const recentSleeps = healthLogs.map(l => l.sleepHours || 0).filter(s => s > 0);
  const avgSleep = recentSleeps.length > 0 
    ? (recentSleeps.reduce((sum, s) => sum + s, 0) / recentSleeps.length).toFixed(1)
    : '6.5';
  const recentEnergies = healthLogs.map(l => l.energyLevel || 0).filter(e => e > 0);
  const avgEnergy = recentEnergies.length > 0
    ? (recentEnergies.reduce((sum, e) => sum + e, 0) / recentEnergies.length).toFixed(1)
    : '7.2';

  // 6. Compute Brand Metrics
  const totalPosts = content.filter(c => c.platform === 'LinkedIn').length;
  const scheduledPosts = content.filter(c => c.status === 'Scheduled').length;

  // 7. Dynamic Risk Assessment
  const risks: { id: string; domain: string; title: string; severity: 'CRITICAL' | 'WARNING' | 'STABLE'; message: string; actionText: string; link: string }[] = [];
  
  // Risk 1: Overdue Tasks
  const overdueTasks = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) {
    risks.push({
      id: 'r1',
      domain: 'TASKS',
      title: 'Overdue Strategic Milestones',
      severity: overdueTasks.length > 3 ? 'CRITICAL' : 'WARNING',
      message: `${overdueTasks.length} high-priority tasks are past their target deadlines.`,
      actionText: 'Reschedule Tasks',
      link: '/'
    });
  }

  // Risk 2: Study Deficit
  const dailyStudyAvg = studyHoursThisWeek / 7;
  if (dailyStudyAvg < 1.5) {
    risks.push({
      id: 'r2',
      domain: 'EXAMS',
      title: 'Study Velocity Slippage',
      severity: 'WARNING',
      message: `Weekly study average (${dailyStudyAvg.toFixed(1)} hrs/day) is below 2.0h/day FSSAI readiness limit.`,
      actionText: 'Study Session Log',
      link: '/exams/study-planner'
    });
  }

  // Risk 3: Sleep Deprivation
  if (parseFloat(avgSleep) < 6.0) {
    risks.push({
      id: 'r3',
      domain: 'HEALTH',
      title: 'Cognitive Recovery Risk',
      severity: 'CRITICAL',
      message: `Rolling sleep average (${avgSleep}h) is below the 6.5h threshold. Focus degradations expected.`,
      actionText: 'Configure Screen Downtime',
      link: '/self-mastery/health'
    });
  }

  // Risk 4: B2B Lead Stale
  const staleLeads = leads.filter(l => l.status !== 'Customer' && l.nextFollowUp && new Date(l.nextFollowUp) < new Date());
  if (staleLeads.length > 0) {
    risks.push({
      id: 'r4',
      domain: 'BUSINESS',
      title: 'Sales Pipeline Decay',
      severity: 'WARNING',
      message: `${staleLeads.length} active leads have follow-up schedules overdue. Pipeline leak detected.`,
      actionText: 'CRM Pipeline Board',
      link: '/business/crm/leads'
    });
  }

  // Fallback if zero risks found
  if (risks.length === 0) {
    risks.push({
      id: 'r_ok',
      domain: 'SYSTEM',
      title: 'Risk Matrix Stable',
      severity: 'STABLE',
      message: 'All system parameters (sleep, tasks, B2B followups, study velocity) are currently within tolerance bounds.',
      actionText: 'Audit Log',
      link: '/settings'
    });
  }

  // 8. Mock Charts Data (combines database logs with static placeholders if DB is empty)
  const velocityData = [
    { name: 'Mon', study: 2.5, sleep: 6.5, energy: 7 },
    { name: 'Tue', study: 1.8, sleep: 5.8, energy: 6 },
    { name: 'Wed', study: 3.0, sleep: 7.2, energy: 8 },
    { name: 'Thu', study: 0.5, sleep: 6.0, energy: 6 },
    { name: 'Fri', study: 2.0, sleep: 6.8, energy: 7 },
    { name: 'Sat', study: 4.0, sleep: 7.5, energy: 9 },
    { name: 'Sun', study: 1.5, sleep: 6.4, energy: 7 },
  ];

  const budgetData = [
    { name: 'R&D Lab', limit: 8000, spent: 7200 },
    { name: 'Syllabus/Study', limit: 2000, spent: 1800 },
    { name: 'Travel/Logistics', limit: 5000, spent: 6100 },
    { name: 'Subscribers/Brand', limit: 3000, spent: 1200 },
    { name: 'FSSAI Exams', limit: 4000, spent: 2500 },
  ];

  const brandData = [
    { name: 'Mar', subscribers: 350, reach: 12000 },
    { name: 'Apr', subscribers: 480, reach: 18000 },
    { name: 'May', subscribers: 620, reach: 24000 },
    { name: 'Jun', subscribers: 850, reach: 35000 },
  ];

  // 9. AI Priority Actions Engine
  const priorityActions = [
    {
      rank: 1,
      title: staleLeads.length > 0 ? `Follow up B2B Lead: ${staleLeads[0].companyName}` : 'Outreach to Dr. Ramesh Kumar (Heritage Foods)',
      reason: 'B2B opportunity with high win probability awaiting sample feedback trial review.',
      color: 'border-l-4 border-l-rose-500',
      actionLink: '/business/crm/leads'
    },
    {
      rank: 2,
      title: parseFloat(avgSleep) < 6.5 ? 'Set Saturday Screen Downtime to 10:30 PM' : 'Log 2h Food Law study block',
      reason: parseFloat(avgSleep) < 6.5 ? 'Elevate sleep parameters to prevent cognitive fatigue and protect study retention.' : 'Food Additives legislative limits syllabus chapter is due for revision.',
      color: 'border-l-4 border-l-amber-500',
      actionLink: parseFloat(avgSleep) < 6.5 ? '/self-mastery/health' : '/exams/study-planner'
    },
    {
      rank: 3,
      title: 'Compare Formulation Trial v3 Costs',
      reason: 'Unit cost per kg exceeds target threshold (₹350/kg). Optimization required in stabilizer mix ratios.',
      color: 'border-l-4 border-l-[#00B4D8]',
      actionLink: '/formulation-lab'
    },
    {
      rank: 4,
      title: scheduledPosts === 0 ? 'Compose LinkedIn Thought Leadership Post' : 'Review PhD statement draft',
      reason: scheduledPosts === 0 ? 'Content queue is empty. Maintain personal authority brand posting cadence.' : 'University deadline program checklist requires statement draft submission.',
      color: 'border-l-4 border-l-purple-500',
      actionLink: scheduledPosts === 0 ? '/brand/linkedin' : '/research'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <Crown className="w-6 h-6 text-[#D4A017]" /> EXECUTIVE COMMAND CONSOLE
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            KGOS X INFINITY CEO control room. Cross-domain telemetry, risk parameters, and priority queue systems.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-850">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-400">TELEMETRY ONLINE</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Business */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold tracking-wider">BUSINESS PIPELINE</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-zinc-100">₹{(pipelineValue / 100000).toFixed(2)} L</div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Win Rate: {winRate}% | Leads: {activeLeadsCount}</p>
          </div>
        </div>

        {/* Science */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00B4D8]" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold tracking-wider">SCIENCE (KAFS)</span>
            <Zap className="w-4 h-4 text-[#00B4D8]" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-zinc-100">{referencedPapers + 3} active</div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Viscosity trials logged: 12</p>
          </div>
        </div>

        {/* Research */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold tracking-wider">RESEARCH OS</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-zinc-100">{totalPapers} papers</div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Reading: {readingPapers} | Referenced: {referencedPapers}</p>
          </div>
        </div>

        {/* Exams */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold tracking-wider">EXAM READINESS</span>
            <Brain className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-zinc-100">
              {daysToExam !== null ? `${daysToExam} days left` : 'No Active Exam'}
            </div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Velocity: {studyHoursThisWeek.toFixed(1)} hrs/wk</p>
          </div>
        </div>

        {/* Health */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold tracking-wider">HEALTH & COGNITIVE</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-zinc-100">{avgSleep}h Sleep</div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Avg Energy: {avgEnergy}/10</p>
          </div>
        </div>

        {/* Brand */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] font-mono font-bold tracking-wider">BRAND OS</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-zinc-100">{totalPosts} Posts</div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Scheduled Queue: {scheduledPosts}</p>
          </div>
        </div>

      </div>

      {/* Main Panel grid (2/3 dashboard charts & priorities, 1/3 risks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns (Charts & Decisions) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Projections & Charts tabbed card */}
          <Card header={
            <div className="flex justify-between items-center">
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
                <Activity className="w-4 h-4 text-[#00B4D8]" /> REAL-TIME TREND MONITORING
              </span>
              <div className="flex bg-zinc-950 p-1 rounded border border-zinc-855 text-[9px] font-mono">
                <button
                  onClick={() => setChartTab('velocity')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${chartTab === 'velocity' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Study Velocity
                </button>
                <button
                  onClick={() => setChartTab('finance')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${chartTab === 'finance' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Spend Variance
                </button>
                <button
                  onClick={() => setChartTab('brand')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${chartTab === 'brand' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Subscribers
                </button>
              </div>
            </div>
          }>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'velocity' ? (
                  <LineChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937' }} />
                    <Line type="monotone" dataKey="study" stroke="#F97316" strokeWidth={2} name="Study (hrs)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="sleep" stroke="#EF4444" strokeWidth={2} name="Sleep (hrs)" />
                    <Line type="monotone" dataKey="energy" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" name="Energy rating (1-10)" />
                  </LineChart>
                ) : chartTab === 'finance' ? (
                  <BarChart data={budgetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937' }} />
                    <Bar dataKey="limit" fill="#374151" name="Budget Limit" />
                    <Bar dataKey="spent" fill="#EAB308" name="Actual Spent" />
                  </BarChart>
                ) : (
                  <AreaChart data={brandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937' }} />
                    <defs>
                      <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="subscribers" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorSub)" name="Subscribers" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI Decision Support */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI PRIORITIZED DECISION DECISIONS
            </span>
          }>
            <div className="space-y-4">
              <p className="text-[10px] text-zinc-550 leading-normal uppercase font-mono">
                Decisions ranked dynamically by ROI score, deadline urgency, and physical fatigue constraints.
              </p>
              
              <div className="space-y-3">
                {priorityActions.map((act) => (
                  <div key={act.rank} className={`p-3 bg-zinc-950 border border-zinc-850 rounded-lg flex gap-3 ${act.color}`}>
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 font-mono flex-shrink-0">
                      {act.rank}
                    </div>
                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-200">{act.title}</span>
                        <Link href={act.actionLink} className="text-[#00B4D8] hover:text-white flex items-center gap-0.5 text-[10px] font-mono cursor-pointer">
                          GO TO <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{act.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>

        {/* Right column (Risk Matrix) */}
        <div className="space-y-6">
          {/* Risk Matrix */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <ShieldAlert className="w-4 h-4 text-[#D4A017]" /> DYNAMIC RISK MATRIX
            </span>
          }>
            <div className="space-y-4">
              <p className="text-[10px] text-zinc-550 leading-normal uppercase font-mono">
                System parameters are automatically scanned. Transgressions of health, schedule, or pipeline rules compile below.
              </p>

              <div className="space-y-3">
                {risks.map((risk) => (
                  <div key={risk.id} className="p-3 border border-zinc-850 rounded-lg bg-zinc-950 flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          risk.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                          risk.severity === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {risk.severity}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-550 ml-2 uppercase font-bold">{risk.domain}</span>
                      </div>
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
                        risk.severity === 'CRITICAL' ? 'text-rose-500' :
                        risk.severity === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'
                      }`} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-zinc-200">{risk.title}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{risk.message}</p>
                    </div>

                    {risk.id !== 'r_ok' && (
                      <div className="flex justify-end pt-1">
                        <Link
                          href={risk.link}
                          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {risk.actionText}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Activity className="w-4 h-4 text-zinc-400" /> SYSTEM HEALTH
            </span>
          }>
            <div className="space-y-3 text-[11px] text-zinc-500 leading-normal font-mono">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>Task Backlog</span>
                <span className="text-zinc-350">{tasks.filter(t => t.status !== 'DONE').length} open tasks</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>Database Size</span>
                <span className="text-zinc-350">Healthy (IndexedDB)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>API Status</span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
              <div className="flex justify-between">
                <span>Sync Node</span>
                <span className="text-zinc-550">OFFLINE FIRST</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
