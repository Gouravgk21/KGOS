'use client';

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import {
  Mail,
  CalendarDays,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Zap,
  Eye,
  Send,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/Linkedin';

const STATUS_COLORS: Record<string, string> = {
  Idea: 'bg-zinc-700 text-zinc-300',
  Draft: 'bg-yellow-900/60 text-yellow-300',
  Review: 'bg-blue-900/60 text-blue-300',
  Scheduled: 'bg-purple-900/60 text-purple-300',
  Published: 'bg-emerald-900/60 text-emerald-300',
};

const TYPE_COLORS: Record<string, string> = {
  LinkedIn: 'bg-blue-900/40 text-blue-300',
  Newsletter: 'bg-purple-900/40 text-purple-300',
  Article: 'bg-emerald-900/40 text-emerald-300',
  Tweet: 'bg-sky-900/40 text-sky-300',
  Thread: 'bg-indigo-900/40 text-indigo-300',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  LinkedIn: <Linkedin className="w-3.5 h-3.5" />,
  Newsletter: <Mail className="w-3.5 h-3.5" />,
  Article: <FileText className="w-3.5 h-3.5" />,
  Tweet: <Send className="w-3.5 h-3.5" />,
  Thread: <BookOpen className="w-3.5 h-3.5" />,
};

const NAV_CARDS = [
  {
    href: '/brand/linkedin',
    icon: <Linkedin className="w-7 h-7" />,
    label: 'LinkedIn Studio',
    description: 'Compose posts, AI hooks, analytics',
    color: '#0a66c2',
    colorDim: 'rgba(10,102,194,0.15)',
  },
  {
    href: '/brand/newsletter',
    icon: <Mail className="w-7 h-7" />,
    label: 'Newsletter Studio',
    description: 'Issue composer, subscriber analytics',
    color: '#8b5cf6',
    colorDim: 'rgba(139,92,246,0.15)',
  },
  {
    href: '/brand/content-calendar',
    icon: <CalendarDays className="w-7 h-7" />,
    label: 'Content Calendar',
    description: 'Month & week view, batch planning',
    color: '#10b981',
    colorDim: 'rgba(16,185,129,0.15)',
  },
  {
    href: '/brand/analytics',
    icon: <BarChart3 className="w-7 h-7" />,
    label: 'Brand Analytics',
    description: 'Growth metrics, impressions, trends',
    color: '#D4A017',
    colorDim: 'rgba(212,160,23,0.15)',
  },
];

export default function BrandOSPage() {
  const allContent = useLiveQuery(() =>
    db.contentPieces.orderBy('createdAt').reverse().toArray()
  ) || [];

  const stats = useMemo(() => {
    const total = allContent.length;
    const published = allContent.filter(c => c.status === 'Published').length;
    const scheduled = allContent.filter(c => c.status === 'Scheduled').length;
    const draft = allContent.filter(c => c.status === 'Draft').length;
    const idea = allContent.filter(c => c.status === 'Idea').length;
    const review = allContent.filter(c => c.status === 'Review').length;

    const withImpressions = allContent.filter(c => (c.impressions || 0) > 0);
    const avgImpressions = withImpressions.length > 0
      ? Math.round(withImpressions.reduce((s, c) => s + (c.impressions || 0), 0) / withImpressions.length)
      : 0;

    const newsletterSubs = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('newsletter_subscribers') || '0')
      : 0;

    return { total, published, scheduled, draft, idea, review, avgImpressions, newsletterSubs };
  }, [allContent]);

  const recentContent = useMemo(() => allContent.slice(0, 5), [allContent]);

  const upcomingContent = useMemo(() => {
    const now = new Date().toISOString();
    return allContent
      .filter(c => c.status === 'Scheduled' && c.scheduledDate && c.scheduledDate > now)
      .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''))
      .slice(0, 3);
  }, [allContent]);

  const pipelineSteps = [
    { label: 'Ideas', count: stats.idea, icon: <Lightbulb className="w-4 h-4" />, color: '#64748b' },
    { label: 'Drafts', count: stats.draft, icon: <FileText className="w-4 h-4" />, color: '#eab308' },
    { label: 'Scheduled', count: stats.scheduled, icon: <Clock className="w-4 h-4" />, color: '#8b5cf6' },
    { label: 'Published', count: stats.published, icon: <CheckCircle2 className="w-4 h-4" />, color: '#10b981' },
  ];
  const maxPipelineCount = Math.max(...pipelineSteps.map(s => s.count), 1);

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Brand OS
            <span className="text-sm font-normal text-zinc-500 ml-1">— Personal Brand Growth Engine</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Create, schedule, and analyze your content across all platforms.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: stats.total, icon: <FileText className="w-4 h-4" />, color: '#00B4D8' },
          { label: 'Published', value: stats.published, icon: <CheckCircle2 className="w-4 h-4" />, color: '#10b981' },
          { label: 'Avg Impressions', value: stats.avgImpressions.toLocaleString(), icon: <Eye className="w-4 h-4" />, color: '#D4A017' },
          { label: 'Newsletter Subs', value: stats.newsletterSubs.toLocaleString(), icon: <Mail className="w-4 h-4" />, color: '#8b5cf6' },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}22`, color: kpi.color }}
              >
                {kpi.icon}
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Nav Cards + Pipeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Nav Cards */}
          <div className="grid grid-cols-2 gap-4">
            {NAV_CARDS.map(card => (
              <Link key={card.href} href={card.href}>
                <div
                  className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: card.colorDim, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-zinc-100">{card.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{card.description}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: card.color }}>
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Content Pipeline Funnel */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Content Pipeline
            </span>
          }>
            <div className="flex flex-col gap-3">
              {pipelineSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0" style={{ color: step.color }}>
                    {step.icon}
                    <span className="text-xs font-semibold">{step.label}</span>
                  </div>
                  <div className="flex-1 bg-zinc-900 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${(step.count / maxPipelineCount) * 100}%`,
                        background: step.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold font-mono text-zinc-300 w-8 text-right">{step.count}</span>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Recent Activity + Upcoming */}
        <div className="flex flex-col gap-6">
          {/* Recent Activity */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              Recent Activity
            </span>
          }>
            {recentContent.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-4">No content pieces yet</div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800">
                {recentContent.map(piece => (
                  <div key={piece.id} className="py-3 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-200 leading-tight line-clamp-1">
                        {piece.title}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[piece.status] || 'bg-zinc-800 text-zinc-400'}`}>
                        {piece.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[piece.type] || 'bg-zinc-800 text-zinc-400'}`}>
                        {TYPE_ICONS[piece.type]}
                        {piece.type}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(piece.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Next Scheduled */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-purple-400" />
              Next Scheduled
            </span>
          }>
            {upcomingContent.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-4">Nothing scheduled yet</div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingContent.map(piece => (
                  <div key={piece.id} className="flex items-center gap-3 bg-zinc-900/60 rounded-lg p-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[piece.type] || 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {TYPE_ICONS[piece.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 truncate">{piece.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {piece.scheduledDate
                          ? new Date(piece.scheduledDate).toLocaleDateString('en-IN', {
                              weekday: 'short', month: 'short', day: 'numeric',
                            })
                          : '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
