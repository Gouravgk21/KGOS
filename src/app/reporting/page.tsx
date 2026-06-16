'use client';

import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  BarChart3, CheckSquare, Heart, GraduationCap, Building2, TrendingUp,
  DollarSign, Users, Zap, Target, Download, Filter, RefreshCw, FileText,
  Printer, Sparkles, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 8,
  fontSize: 11,
  color: '#d4d4d8',
};

const AXIS_STYLE = { fill: '#52525b', fontSize: 10 };

type ReportRange = '7d' | '14d' | '30d' | 'all';
type ReportType = 'daily' | 'weekly' | 'monthly';
type DomainFocus = 'all' | 'business' | 'exams' | 'health';

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'compiler'>('analytics');
  const [range, setRange] = useState<ReportRange>('30d');

  // Compiler states
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [domainFocus, setDomainFocus] = useState<DomainFocus>('all');
  const [compiling, setCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState<any | null>(null);

  // Queries
  const tasks        = useLiveQuery(() => db.tasks.toArray()) ?? [];
  const leads        = useLiveQuery(() => db.leads.toArray()) ?? [];
  const exams        = useLiveQuery(() => db.exams.toArray()) ?? [];
  const healthLogs   = useLiveQuery(() => db.healthLogs.orderBy('date').toArray()) ?? [];
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').toArray()) ?? [];
  const contacts     = useLiveQuery(() => db.contacts.toArray()) ?? [];
  const opportunities= useLiveQuery(() => db.opportunities.toArray()) ?? [];
  const goals        = useLiveQuery(() => db.goals.toArray()) ?? [];
  const skills       = useLiveQuery(() => db.skills.toArray()) ?? [];
  const timeAllocs   = useLiveQuery(() => db.timeAllocations.orderBy('date').toArray()) ?? [];
  const research     = useLiveQuery(() => db.researchPapers.toArray()) ?? [];
  const studySessions = useLiveQuery(() => db.studySessions.toArray()) ?? [];

  // Filter logs by range
  const cutoffDays = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 9999;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const filteredLogs = healthLogs.filter(h => range === 'all' || h.date >= cutoffStr);
  const filteredTx   = transactions.filter(t => range === 'all' || t.date >= cutoffStr);

  // KPI Aggregates
  const totalIncome  = filteredTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const netCashflow  = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;
  const totalStudyHrs= studySessions.reduce((s, e) => s + ((e.durationMinutes || 0) / 60), 0);
  const avgSleep     = filteredLogs.length ? (filteredLogs.reduce((s, h) => s + (h.sleep ?? h.sleepHours ?? 0), 0) / filteredLogs.length).toFixed(1) : '6.5';
  const avgEnergy    = filteredLogs.length ? (filteredLogs.reduce((s, h) => s + (h.energy ?? h.energyLevel ?? 0), 0) / filteredLogs.length).toFixed(1) : '7.2';
  const tasksDone    = tasks.filter(t => t.status === 'DONE').length;
  const tasksPct     = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;
  const goalsDone    = goals.filter(g => g.progress >= 100).length;
  const activeLeads  = leads.filter(l => !(l.status ?? '').toLowerCase().includes('customer')).length;
  const pipelineVal  = leads.reduce((s, l) => s + (l.opportunityValue ?? 0), 0);
  const closedWonValue = leads.filter(l => l.status === 'Customer').reduce((s, l) => s + (l.opportunityValue ?? 0), 0);

  // Days until target exam
  const activeExams = exams.filter(e => e.status === 'Active');
  const targetExam = activeExams[0];
  let daysToExam = 0;
  if (targetExam && targetExam.examDate) {
    const diff = new Date(targetExam.examDate).getTime() - new Date().getTime();
    daysToExam = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // ── Chart data ────────────────────────────────────────────────────────────

  // 1. Task category donut
  const taskCatData = useMemo(() => {
    const m: Record<string, number> = {};
    tasks.forEach(t => { m[t.category] = (m[t.category] ?? 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // 2. CRM pipeline funnel
  const STAGES = ['Lead', 'Contacted', 'Qualified', 'Sample Sent', 'Trial', 'Proposal', 'Customer'];
  const crmFunnelData = useMemo(() => {
    const m: Record<string, number> = {};
    STAGES.forEach(s => m[s] = 0);
    leads.forEach(l => { const s = l.status ?? 'Lead'; m[s] = (m[s] ?? 0) + 1; });
    return STAGES.map(s => ({ stage: s, count: m[s] }));
  }, [leads]);

  // 3. Cash flow trend
  const cashFlowData = useMemo(() => {
    const m: Record<string, { income: number; expense: number }> = {};
    filteredTx.slice(-30).forEach(t => {
      const d = t.date.slice(0, 7); // group by month
      if (!m[d]) m[d] = { income: 0, expense: 0 };
      if (t.type === 'INCOME') m[d].income += t.amount;
      if (t.type === 'EXPENSE') m[d].expense += t.amount;
    });
    return Object.entries(m).map(([month, v]) => ({
      month,
      income: Math.round(v.income / 1000),
      expense: Math.round(v.expense / 1000),
      net: Math.round((v.income - v.expense) / 1000),
    }));
  }, [filteredTx]);

  // 4. Health trend
  const healthTrend = useMemo(() =>
    filteredLogs.slice(-14).map(h => ({
      date: h.date.slice(5),
      sleep: +(h.sleep ?? h.sleepHours ?? 0).toFixed(1),
      energy: h.energy ?? h.energyLevel ?? 0,
      exercise: h.exercise ?? 0,
    })),
    [filteredLogs]
  );

  // 5. Time allocation comparison
  const timeData = useMemo(() => {
    const m: Record<string, { planned: number; actual: number }> = {};
    timeAllocs.filter(t => range === 'all' || t.date >= cutoffStr).forEach(t => {
      if (!m[t.category]) m[t.category] = { planned: 0, actual: 0 };
      m[t.category].planned += t.hoursPlanned;
      m[t.category].actual  += t.hoursActual;
    });
    return Object.entries(m).map(([name, v]) => ({
      name,
      planned: +v.planned.toFixed(1),
      actual: +v.actual.toFixed(1),
    }));
  }, [timeAllocs, range, cutoffStr]);

  // 6. Opportunity ROI scatter
  const oppData = useMemo(() =>
    opportunities.map(o => ({
      name: o.title.length > 20 ? o.title.slice(0, 20) + '…' : o.title,
      roi: o.roiScore,
      align: o.alignmentScore,
      effort: o.effortScore,
    })),
    [opportunities]
  );

  // 7. Goal progress by horizon
  const goalByHorizon = useMemo(() => {
    const m: Record<string, { total: number; avgProgress: number }> = {};
    goals.forEach(g => {
      if (!m[g.category]) m[g.category] = { total: 0, avgProgress: 0 };
      m[g.category].total++;
      m[g.category].avgProgress += g.progress;
    });
    return Object.entries(m).map(([horizon, v]) => ({
      horizon,
      goals: v.total,
      progress: Math.round(v.avgProgress / v.total),
    }));
  }, [goals]);

  // 8. Skill matrix
  const skillData = useMemo(() =>
    skills.map(s => ({ skill: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name, level: s.level })),
    [skills]
  );

  // 9. Research status
  const researchData = useMemo(() => {
    const m: Record<string, number> = {};
    research.forEach(r => { m[r.status] = (m[r.status] ?? 0) + 1; });
    return Object.entries(m).map(([status, value]) => ({ status, value }));
  }, [research]);

  // Compile report function
  const handleCompileReport = () => {
    setCompiling(true);
    setTimeout(() => {
      // Generate daily sheet data
      const days = reportType === 'daily' ? 1 : reportType === 'weekly' ? 7 : 30;
      const sheetData = [];
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split('T')[0];

        // Match parameters
        const hLog = healthLogs.find(h => h.date === dStr);
        const sleepVal = hLog ? (hLog.sleep ?? hLog.sleepHours ?? 6.5) : 6.5;
        const energyVal = hLog ? (hLog.energy ?? hLog.energyLevel ?? 7) : 7;
        const studyHrs = studySessions
          .filter(s => s.date === dStr)
          .reduce((sum, s) => sum + ((s.durationMinutes || 0) / 60), 0);
        const completedTasksCount = tasks
          .filter(t => t.status === 'DONE' && t.dueDate === dStr).length;

        sheetData.push({
          date: dStr,
          sleep: sleepVal,
          energy: energyVal,
          study: studyHrs,
          tasks: completedTasksCount
        });
      }

      // Generate AI narrative report paragraphs
      const bulletPoints = [];
      const warnings = [];

      if (domainFocus === 'all' || domainFocus === 'business') {
        bulletPoints.push(`Business CRM: Active pipeline valued at ₹${pipelineVal.toLocaleString()}. Closed won sales represent a conversion of ₹${closedWonValue.toLocaleString()}. Active client interaction index stands at ${activeLeads} leads.`);
        const stale = leads.filter(l => l.status !== 'Customer' && l.nextFollowUp && new Date(l.nextFollowUp) < new Date());
        if (stale.length > 0) {
          warnings.push(`Sales Pipeline Leak: ${stale.length} qualified opportunities are stale and require immediate outreach.`);
        }
      }

      if (domainFocus === 'all' || domainFocus === 'exams') {
        bulletPoints.push(`Exam OS: Cumulative study velocity logged at ${totalStudyHrs.toFixed(1)} hours. Exam readiness score projects at ${daysToExam} days until active exam.`);
        if (daysToExam > 0 && daysToExam <= 30) {
          warnings.push(`Exam Countdown Critical: Less than 30 days remaining for FSSAI exams. Elevate daily mock test practice.`);
        }
      }

      if (domainFocus === 'all' || domainFocus === 'health') {
        bulletPoints.push(`Health OS: Rolling sleep average calculated at ${avgSleep} hours/night, with subjective daily energy levels averaging ${avgEnergy}/10.`);
        if (parseFloat(avgSleep) < 6.0) {
          warnings.push(`Cognitive Sleep Deficit: Average sleep is under 6.0h. Recommend enforcing screen downtime limits to secure memory consolidation.`);
        }
      }

      setCompiledReport({
        title: reportType === 'daily' ? 'Daily System Audit Report' : reportType === 'weekly' ? 'Weekly Executive Review' : 'Monthly Strategic Report',
        date: new Date().toLocaleDateString(),
        focus: domainFocus.toUpperCase(),
        bullets: bulletPoints,
        warnings: warnings,
        sheet: sheetData
      });
      setCompiling(false);
    }, 1000);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .sidebar, .topbar, button, .no-print {
            display: none !important;
          }
          #print-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 2rem !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-title {
            color: black !important;
            font-size: 24px !important;
            font-weight: bold !important;
          }
          .print-section {
            border-bottom: 1px solid #ddd !important;
            padding-bottom: 12px !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2 font-display">
            <BarChart3 className="w-6 h-6 text-[#00B4D8]" />
            ENTERPRISE REPORTING & ANALYTICS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Unified telemetry reports and AI-generated narrative audits across all active domains.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex-shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab('compiler')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'compiler' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Audit Report Compiler
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6 no-print">
          {/* Range selector */}
          <div className="flex justify-end">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {(['7d', '14d', '30d', 'all'] as ReportRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                    range === r ? 'bg-[#006D77] text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {r === 'all' ? 'All Time' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Net Cash',      value: formatNumber(netCashflow),   sub: `${savingsRate}% savings`,  color: netCashflow >= 0 ? '#10b981' : '#f43f5e', icon: DollarSign },
              { label: 'Pipeline',      value: formatNumber(pipelineVal),   sub: `${activeLeads} leads`,      color: '#f59e0b', icon: Building2 },
              { label: 'Task Rate',     value: `${tasksPct}%`,              sub: `${tasksDone}/${tasks.length} done`, color: '#3b82f6', icon: CheckSquare },
              { label: 'Goals Done',    value: goalsDone,                   sub: `/ ${goals.length} total`,   color: '#a855f7', icon: Target },
              { label: 'Study Hours',   value: `${totalStudyHrs.toFixed(0)}h`, sub: `${exams.length} exams`, color: '#f97316', icon: GraduationCap },
              { label: 'Avg Sleep',     value: avgSleep,                    sub: 'hours/night',               color: '#06b6d4', icon: Heart },
              { label: 'Avg Energy',    value: `${avgEnergy}/10`,           sub: `${filteredLogs.length} logs`, color: '#10b981', icon: Zap },
              { label: 'Contacts',      value: contacts.length,             sub: 'in CRM',                    color: '#ec4899', icon: Users },
            ].map(k => (
              <div key={k.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <k.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: k.color }} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{k.label}</span>
                </div>
                <div className="text-lg font-bold font-mono text-zinc-100">{k.value}</div>
                <div className="text-[9px] text-zinc-650 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Cash Flow Trend (₹ 000s)
              </span>
            }>
              {cashFlowData.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 text-sm">No transactions recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={cashFlowData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={3}>
                    <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff06' }} />
                    <Bar dataKey="income" name="Income (K)" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expense" name="Expense (K)" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="net" name="Net (K)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" /> CRM Sales Pipeline Funnel
              </span>
            }>
              {leads.length === 0 ? (
                <div className="py-12 text-center text-zinc-650 text-sm">No leads in pipeline.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={crmFunnelData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <XAxis dataKey="stage" tick={{ ...AXIS_STYLE, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff06' }} />
                    <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                      {crmFunnelData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Health Biomarkers Trend
              </span>
            }>
              {healthTrend.length === 0 ? (
                <div className="py-12 text-center text-zinc-655 text-sm">No health logs.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={healthTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="hEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="sleep" stroke="#3b82f6" fill="url(#hSleep)" strokeWidth={2} dot={false} name="Sleep (h)" />
                    <Area type="monotone" dataKey="energy" stroke="#10b981" fill="url(#hEnergy)" strokeWidth={2} dot={false} name="Energy" />
                    <Line type="monotone" dataKey="exercise" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Exercise (min)" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" /> Time Allocation — Planned vs Actual (hrs)
              </span>
            }>
              {timeData.length === 0 ? (
                <div className="py-12 text-center text-zinc-650 text-sm">No time logs.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={3}>
                    <XAxis dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff06' }} />
                    <Bar dataKey="planned" name="Planned (h)" fill="#3b82f620" stroke="#3b82f6" strokeWidth={1} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="actual" name="Actual (h)" fill="#a855f7" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" /> Goal Progress by Horizon
              </span>
            }>
              {goalByHorizon.length === 0 ? (
                <div className="py-12 text-center text-zinc-650 text-sm">No goals set.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={goalByHorizon} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
                    <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="horizon" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={64} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff06' }} formatter={(v: any) => [`${v}%`, 'Avg Progress']} />
                    <Bar dataKey="progress" name="Avg Progress" radius={[0, 4, 4, 0]}>
                      {goalByHorizon.map((g, i) => (
                        <Cell key={i} fill={g.progress >= 75 ? '#10b981' : g.progress >= 40 ? '#3b82f6' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" /> Task Category Distribution
              </span>
            }>
              {taskCatData.length === 0 ? (
                <div className="py-12 text-center text-zinc-650 text-sm">No tasks recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={taskCatData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskCatData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#71717a' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opportunity ROI bar */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Opportunity Scores
              </span>
            }>
              {oppData.length === 0 ? (
                <div className="py-10 text-center text-zinc-650 text-sm">No opportunities tracked.</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={oppData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                    <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 9 }} axisLine={false} tickLine={false} width={72} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff06' }} />
                    <Bar dataKey="roi" name="ROI Score" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Skills radar */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" /> Skill Matrix
              </span>
            }>
              {skillData.length < 3 ? (
                <div className="py-10 text-center text-zinc-650 text-sm">Add 3+ skills to view radar.</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={skillData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#71717a', fontSize: 9 }} />
                    <Radar dataKey="level" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Research status pie */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" /> Research Pipeline
              </span>
            }>
              {researchData.length === 0 ? (
                <div className="py-10 text-center text-zinc-650 text-sm">No research papers logged.</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={researchData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="status" paddingAngle={3}>
                      {researchData.map((_, i) => (
                        <Cell key={i} fill={['#a855f7','#3b82f6','#10b981'][i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [v, n]} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#71717a' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'compiler' && (
        <div className="space-y-6">
          {/* Report configuration pane */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-950 p-4 rounded-xl border border-zinc-850 no-print">
            <div className="space-y-1 text-xs">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Report Type / Range</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as ReportType)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
              >
                <option value="daily">Daily System Audit (24h)</option>
                <option value="weekly">Weekly Executive Review (7 Days)</option>
                <option value="monthly">Monthly Strategic Report (30 Days)</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Domain Focus Area</label>
              <select
                value={domainFocus}
                onChange={e => setDomainFocus(e.target.value as DomainFocus)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
              >
                <option value="all">All Domains (Pillars 1-14)</option>
                <option value="business">Business OS (CRM, Forecasts)</option>
                <option value="exams">Exams & Study (Readiness)</option>
                <option value="health">Health & Energy (Vitals)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCompileReport}
                disabled={compiling}
                className="w-full bg-[#006D77] hover:bg-[#00B4D8] text-white py-2 rounded-lg text-xs font-semibold font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {compiling ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling Telemetry...</>
                ) : (
                  <><RefreshCw className="w-3.5 h-3.5" /> Compile & Generate Report</>
                )}
              </button>
            </div>
          </div>

          {/* Compiled Report Display Card */}
          {compiledReport ? (
            <div id="print-report-area" className="p-6 bg-zinc-950 border border-zinc-850 rounded-xl space-y-6 relative print-container">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b border-zinc-800 pb-4 print-section">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight font-display print-title uppercase">
                    {compiledReport.title}
                  </h2>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 mt-1">
                    <span>DATE COMPILED: {compiledReport.date}</span>
                    <span>FOCUS: {compiledReport.focus}</span>
                  </div>
                </div>
                {/* Print button (hidden in print view) */}
                <button
                  onClick={() => window.print()}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer no-print"
                >
                  <Printer className="w-4 h-4" /> Print Sheet
                </button>
              </div>

              {/* AI Narrative Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-wide flex items-center gap-1.5 uppercase print-title">
                  <Sparkles className="w-4 h-4 text-purple-400 no-print" /> AI SYSTEM BRIEFING
                </h3>
                <div className="space-y-2.5 text-xs text-zinc-300 leading-relaxed font-serif">
                  {compiledReport.bullets.map((bullet: string, i: number) => (
                    <p key={i}>{bullet}</p>
                  ))}
                </div>
              </div>

              {/* Warnings / Risks */}
              {compiledReport.warnings.length > 0 && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg space-y-2 print-section">
                  <h4 className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" /> SYSTEM WARNS / SAFETY THREATS
                  </h4>
                  <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-1 font-mono leading-normal">
                    {compiledReport.warnings.map((warn: string, i: number) => (
                      <li key={i} className="marker:text-rose-500">{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Table Sheet */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-wide flex items-center gap-1.5 uppercase print-title">
                  <Clock className="w-4 h-4 text-zinc-400 no-print" /> DAILY TELEMETRY AUDIT SHEET
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-550 uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Sleep Log</th>
                        <th className="py-2.5 px-3">Energy (1-10)</th>
                        <th className="py-2.5 px-3">Study Time</th>
                        <th className="py-2.5 px-3 text-right">Tasks Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-zinc-300">
                      {compiledReport.sheet.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-900/20">
                          <td className="py-2.5 px-3">{row.date}</td>
                          <td className="py-2.5 px-3">{row.sleep.toFixed(1)}h</td>
                          <td className="py-2.5 px-3">{row.energy}/10</td>
                          <td className="py-2.5 px-3">{row.study.toFixed(1)}h</td>
                          <td className="py-2.5 px-3 text-right">{row.tasks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Footer */}
              <div className="border-t border-zinc-900 pt-4 text-[9px] font-mono text-zinc-600 flex justify-between print-section">
                <span>KGOS SYSTEM AUDIT ENGINE v1.1</span>
                <span>TELEMETRY VERIFIED SECURITY BLOCK</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 font-mono flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-zinc-700" />
              <p className="text-xs uppercase tracking-wider">No report compiled.</p>
              <p className="text-[10px] lowercase text-zinc-600">Select parameter scope and compile above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
