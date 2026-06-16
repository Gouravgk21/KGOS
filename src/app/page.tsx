'use client';

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Briefcase,
  Heart,
  DollarSign,
  FlaskConical,
  BookOpen,
  Target,
  Users,
  Brain,
  Zap,
  ArrowRight,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const DOMAINS = [
  { key: 'business', label: 'Business', icon: Briefcase, color: 'var(--color-turquoise)', route: '/business' },
  { key: 'health', label: 'Health', icon: Heart, color: 'var(--color-success)', route: '/self-mastery/health' },
  { key: 'finance', label: 'Wealth', icon: DollarSign, color: 'var(--color-gold)', route: '/wealth' },
  { key: 'research', label: 'Research', icon: BookOpen, color: 'var(--color-teal)', route: '/research' },
  { key: 'exams', label: 'Exams', icon: Brain, color: 'var(--color-warning)', route: '/exams' },
  { key: 'kafs', label: 'KAFS', icon: FlaskConical, color: 'var(--color-turquoise)', route: '/kafs' },
  { key: 'brand', label: 'Brand', icon: Target, color: 'var(--color-gold)', route: '/brand/linkedin' },
  { key: 'network', label: 'Network', icon: Users, color: 'var(--color-teal)', route: '/relationships' },
];

export default function Dashboard() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Live Data Queries ──────────────────────────────────────────────
  const leads = useLiveQuery(() => db.leads.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const healthLogs = useLiveQuery(
    () => db.healthLogs.orderBy('date').reverse().limit(30).toArray(),
    [],
    []
  );
  const transactions = useLiveQuery(() => db.transactions.toArray(), [], []);
  const researchPapers = useLiveQuery(() => db.researchPapers.toArray(), [], []);
  const exams = useLiveQuery(() => db.exams.toArray(), [], []);
  const studySessions = useLiveQuery(() => db.studySessions.toArray(), [], []);
  const formulations = useLiveQuery(() => db.formulations.toArray(), [], []);
  const contentPieces = useLiveQuery(() => db.contentPieces.toArray(), [], []);
  const contacts = useLiveQuery(() => db.contacts.toArray(), [], []);
  const recentNotes = useLiveQuery(
    () => db.knowledgeNotes.orderBy('createdAt').reverse().limit(5).toArray(),
    [],
    []
  );
  const notifications = useLiveQuery(
    () => db.notifications.filter((n) => !n.read).toArray(),
    [],
    []
  );

  // ─── Computed KGPI Scores (Real Data) ──────────────────────────────
  const kgpiScores = useMemo(() => {
    // BUSINESS: pipeline activity score
    const activeLeadsArr = leads?.filter((l) => !['Customer'].includes(l.status)) ?? [];
    const pipelineScore = Math.min(100, Math.round((activeLeadsArr.length / 10) * 100));
    const qualifiedLeads =
      leads?.filter((l) =>
        ['Qualified', 'Trial', 'Proposal', 'Customer'].includes(l.status)
      ) ?? [];
    const businessScore = leads?.length
      ? Math.round(
          (qualifiedLeads.length / leads.length) * 60 + Math.min(40, pipelineScore * 0.4)
        )
      : 0;

    // HEALTH: avg energy + sleep quality last 14 days
    const recentHealth = healthLogs?.slice(0, 14) ?? [];
    const avgSleep = recentHealth.length
      ? recentHealth.reduce((s, h) => s + (h.sleep || h.sleepHours || 0), 0) /
        recentHealth.length
      : 0;
    const avgEnergy = recentHealth.length
      ? recentHealth.reduce((s, h) => s + (h.energy || h.energyLevel || 0), 0) /
        recentHealth.length
      : 0;
    const healthScore = recentHealth.length
      ? Math.round((avgSleep / 8) * 50 + (avgEnergy / 10) * 50)
      : 0;

    // FINANCE: income vs expense balance for current month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTx = transactions?.filter((t) => t.date.startsWith(thisMonth)) ?? [];
    const income = monthTx
      .filter((t) => t.type === 'INCOME')
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((s, t) => s + t.amount, 0);
    const financeScore =
      income > 0 ? Math.min(100, Math.round((income / (income + expense)) * 100)) : 0;

    // RESEARCH: papers read / summarized
    const readPapers =
      researchPapers?.filter((p) =>
        ['Summarized', 'Referenced', 'Completed'].includes(p.status)
      ) ?? [];
    const researchScore = Math.min(100, Math.round((readPapers.length / 10) * 100));

    // EXAMS: study hours vs target
    const totalStudyHours =
      studySessions?.reduce((s, ss) => s + (ss.durationMinutes || 0) / 60, 0) ?? 0;
    const examTargetHours = exams?.reduce((s, e) => s + (e.targetHours || 0), 0) ?? 40;
    const examScore =
      examTargetHours > 0
        ? Math.min(100, Math.round((totalStudyHours / examTargetHours) * 100))
        : 0;

    // KAFS: active formulations
    const activeFormulations = formulations?.filter((f) => f.status === 'Active') ?? [];
    const kafsScore = Math.min(
      100,
      Math.round(((activeFormulations.length || 0) / 5) * 100)
    );

    // BRAND: published content pieces
    const publishedContent = contentPieces?.filter((c) => c.status === 'Published') ?? [];
    const brandScore = Math.min(100, Math.round((publishedContent.length / 8) * 100));

    // NETWORK: average relationship interaction score (0–10 → 0–100)
    const netScore = contacts?.length
      ? Math.min(
          100,
          Math.round(
            (contacts.reduce((s, c) => s + c.interactionScore, 0) / contacts.length / 10) *
              100
          )
        )
      : 0;

    return {
      business: businessScore || 0,
      health: healthScore || 0,
      finance: financeScore || 0,
      research: researchScore || 0,
      exams: examScore || 0,
      kafs: kafsScore || 0,
      brand: brandScore || 0,
      network: netScore || 0,
    };
  }, [
    leads,
    healthLogs,
    transactions,
    researchPapers,
    studySessions,
    exams,
    formulations,
    contentPieces,
    contacts,
  ]);

  const kgpiData = DOMAINS.map((d) => ({
    subject: d.label,
    A: kgpiScores[d.key as keyof typeof kgpiScores] ?? 0,
    fullMark: 100,
  }));

  const systemHealth = Math.round(
    Object.values(kgpiScores).reduce((s, v) => s + v, 0) /
      Object.values(kgpiScores).length
  );

  // Derived summaries
  const pendingTasks = tasks?.filter((t) => t.status !== 'DONE') ?? [];
  const criticalTasks = pendingTasks.filter((t) => t.priority === 'HIGH');
  const activeLeads = leads?.filter((l) => !['Customer'].includes(l.status)) ?? [];
  const totalPipeline = leads?.reduce((s, l) => s + (l.opportunityValue || 0), 0) ?? 0;

  // Activity feed from recent notes
  const recentActivity = useMemo(() => {
    return (recentNotes ?? [])
      .map((n) => ({
        id: `note-${n.id}`,
        type: 'note' as const,
        title: n.title,
        subtitle: n.category,
        time: n.createdAt,
        icon: BookOpen,
        color: 'var(--color-teal)',
      }))
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 6);
  }, [recentNotes]);

  // Weekly activity chart — last 7 days
  const activityChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    return days.map((date) => ({
      day: new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }),
      tasks: tasks?.filter((t) => t.createdAt?.slice(0, 10) === date).length ?? 0,
      health: healthLogs?.filter((h) => h.date === date).length ?? 0,
    }));
  }, [tasks, healthLogs]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--color-turquoise)] border-t-transparent rounded-full animate-spin" />
          <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
            Initializing System Console...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity
              className="w-4 h-4 text-[var(--color-turquoise)]"
              aria-hidden="true"
            />
            <span className="section-label text-[var(--color-turquoise)]">
              System Initialization Complete
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            {greeting()},{' '}
            <span style={{ color: 'var(--color-gold)' }}>Kumar</span>.
          </h1>
          <p className="text-[var(--text-muted)] mt-1.5 font-mono text-sm">
            KGOS 2031 · All modules operational · System health:{' '}
            <span
              style={{
                color:
                  systemHealth > 70
                    ? 'var(--color-success)'
                    : 'var(--color-warning)',
              }}
            >
              {systemHealth}%
            </span>
          </p>
        </div>

        {/* Top KPIs */}
        <div className="flex gap-3 flex-wrap">
          <div className="metric-card !p-4 min-w-[130px]">
            <div className="section-label mb-1">Pipeline</div>
            <div
              className="text-xl font-display font-bold"
              style={{ color: 'var(--color-turquoise)' }}
            >
              ₹{(totalPipeline / 100000).toFixed(1)}L
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
              {activeLeads.length} active leads
            </div>
          </div>
          <div className="metric-card !p-4 min-w-[130px]">
            <div className="section-label mb-1">Tasks</div>
            <div
              className="text-xl font-display font-bold"
              style={{
                color:
                  criticalTasks.length > 0
                    ? 'var(--color-warning)'
                    : 'var(--color-success)',
              }}
            >
              {pendingTasks.length}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
              {criticalTasks.length} high priority
            </div>
          </div>
          <div className="metric-card !p-4 min-w-[130px]">
            <div className="section-label mb-1">KGPI Score</div>
            <div
              className="text-xl font-display font-bold"
              style={{
                color:
                  systemHealth > 70
                    ? 'var(--color-success)'
                    : systemHealth > 40
                    ? 'var(--color-warning)'
                    : 'var(--color-error)',
              }}
            >
              {systemHealth}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
              / 100 system health
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* KGPI Radar — Real Data */}
        <div className="card col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-label text-[var(--color-turquoise)]">KGPI Radar</div>
              <h2 className="font-display font-bold text-[var(--text-primary)] text-sm mt-0.5">
                Kumar Gourav Performance Index
              </h2>
            </div>
            <div className="badge badge-teal">{systemHealth}%</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={kgpiData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: 'var(--text-muted)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <Radar
                name="KGPI"
                dataKey="A"
                stroke="var(--color-turquoise)"
                fill="var(--color-turquoise)"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Domain Score Mini-Icons */}
          <div className="grid grid-cols-4 gap-1.5">
            {DOMAINS.map((d) => {
              const score = kgpiScores[d.key as keyof typeof kgpiScores] ?? 0;
              const Icon = d.icon;
              return (
                <Link
                  key={d.key}
                  href={d.route}
                  className="flex flex-col items-center gap-1 p-2 rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors text-center"
                  title={`${d.label}: ${score}/100`}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: d.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">
                    {score}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card col-span-1 lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-label text-[var(--color-gold)]">Activity Stream</div>
              <h2 className="font-display font-bold text-[var(--text-primary)] text-sm mt-0.5">
                Last 7 Days
              </h2>
            </div>
            <TrendingUp
              className="w-4 h-4 text-[var(--text-muted)]"
              aria-hidden="true"
            />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={activityChart}
              margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="grad-tasks" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-turquoise)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-turquoise)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis
                dataKey="day"
                tick={{
                  fill: 'var(--text-muted)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="tasks"
                stroke="var(--color-turquoise)"
                fill="url(#grad-tasks)"
                strokeWidth={2}
                dot={false}
                name="Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Quick Status Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-subtle)]">
            {[
              {
                label: 'Active Leads',
                value: activeLeads.length,
                icon: Briefcase,
                color: 'var(--color-turquoise)',
              },
              {
                label: 'Pending Tasks',
                value: pendingTasks.length,
                icon: CheckCircle2,
                color:
                  criticalTasks.length > 0
                    ? 'var(--color-warning)'
                    : 'var(--color-success)',
              },
              {
                label: 'Papers Read',
                value: (researchPapers ?? []).filter((p) =>
                  ['Summarized', 'Completed'].includes(p.status)
                ).length,
                icon: BookOpen,
                color: 'var(--color-teal)',
              },
              {
                label: 'Alerts',
                value: notifications?.length ?? 0,
                icon: AlertCircle,
                color:
                  (notifications?.length ?? 0) > 0
                    ? 'var(--color-error)'
                    : 'var(--color-success)',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: item.color }}
                    aria-hidden="true"
                  />
                  <div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Intelligence Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity Feed */}
        <div className="card col-span-1 lg:col-span-2 flex flex-col gap-3">
          <div className="section-label text-[var(--color-turquoise)]">
            Intelligence Stream
          </div>
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <Zap className="empty-icon" aria-hidden="true" />
              <h3>No recent activity</h3>
              <p>
                Start adding notes, tasks, and leads to see your intelligence stream.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}20` }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: item.color }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)] flex-shrink-0">
                      {new Date(item.time).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card flex flex-col gap-3">
          <div className="section-label text-[var(--color-gold)]">Quick Access</div>
          <div className="flex flex-col gap-2">
            {[
              {
                label: 'New Lead',
                href: '/business/crm/leads',
                icon: Briefcase,
                color: 'var(--color-turquoise)',
              },
              {
                label: 'Log Health',
                href: '/self-mastery/health',
                icon: Heart,
                color: 'var(--color-success)',
              },
              {
                label: 'Add Paper',
                href: '/research/papers',
                icon: BookOpen,
                color: 'var(--color-teal)',
              },
              {
                label: 'Study Session',
                href: '/exams/study-planner',
                icon: Brain,
                color: 'var(--color-warning)',
              },
              {
                label: 'Log Transaction',
                href: '/wealth/transactions',
                icon: DollarSign,
                color: 'var(--color-gold)',
              },
              {
                label: 'Formulation Lab',
                href: '/formulation-lab',
                icon: FlaskConical,
                color: 'var(--color-turquoise)',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] border border-transparent hover:border-[var(--border-subtle)] hover:bg-[rgba(0,180,216,0.04)] transition-all group"
                >
                  <div
                    className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: item.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-[var(--text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
