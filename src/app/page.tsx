'use client';

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { useDashboardKPIs } from '@/hooks/useKPIs';
import KPICard from '@/components/ui/KPICard';
import Card from '@/components/ui/Card';
import { Heart, CheckCircle, Building2, UserPlus, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function DashboardPage() {
  const kpis = useDashboardKPIs();

  // Get top priorities (tasks not done)
  const priorities = useLiveQuery(
    () => db.tasks.where('status').notEqual('DONE').limit(3).toArray(),
    []
  );

  // Get critical deadlines (due soon)
  const upcomingDeadlines = useLiveQuery(
    () => db.tasks.where('status').notEqual('DONE').limit(5).toArray(),
    []
  );

  // Recent leads
  const recentLeads = useLiveQuery(
    () => db.leads.orderBy('createdAt').reverse().limit(5).toArray(),
    []
  );

  const toggleTask = async (id: number | undefined, currentStatus: string) => {
    if (id === undefined) return;
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    await db.tasks.update(id, { status: nextStatus });
  };

  const greeting = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  if (!kpis) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-1/3 bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-zinc-900 rounded-xl" />
          <div className="h-32 bg-zinc-900 rounded-xl" />
          <div className="h-32 bg-zinc-900 rounded-xl" />
          <div className="h-32 bg-zinc-900 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-900 rounded-xl" />
          <div className="h-64 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-zinc-100">{greeting}, Kumar</h1>
        <p className="text-sm text-zinc-400">Here is an overview of your life and KAFS enterprise indicators today.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Health Score" 
          value={`${kpis.healthScore || 0}/100`} 
          trend={kpis.healthScore >= 75 ? 'positive' : 'neutral'}
          trendValue="Vitals OK"
          icon={Heart} 
          color="#f43f5e" 
          colorDim="rgba(244, 63, 94, 0.15)"
        />
        <KPICard 
          label="Habit Completion" 
          value={`${Math.round(kpis.habitCompletion || 0)}%`} 
          trend={kpis.habitCompletion >= 80 ? 'positive' : 'neutral'}
          trendValue="Daily checklist"
          icon={CheckCircle} 
          color="#10b981" 
          colorDim="rgba(16, 185, 129, 0.15)"
        />
        <KPICard 
          label="Active Leads" 
          value={kpis.activeLeads || 0} 
          trend="neutral"
          trendValue="In CRM pipeline"
          icon={UserPlus} 
          color="#3b82f6" 
          colorDim="rgba(59, 130, 246, 0.15)"
        />
        <KPICard 
          label="Pipeline Value" 
          value={formatCurrency(kpis.pipelineValue)} 
          trend="positive"
          trendValue="Weighted B2B"
          icon={Building2} 
          color="#f59e0b" 
          colorDim="rgba(245, 158, 11, 0.15)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Focus Card */}
        <Card header={<span className="card-title text-zinc-200 font-semibold">Daily Focus Priorities</span>}>
          <div className="flex flex-col gap-3">
            {priorities && priorities.length > 0 ? (
              priorities.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 border border-zinc-800 rounded-lg bg-zinc-950/40">
                  <input
                    type="checkbox"
                    checked={task.status === 'DONE'}
                    onChange={() => toggleTask(task.id, task.status)}
                    className="w-4 h-4 rounded border-zinc-700 text-blue-500 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-zinc-200">{task.title}</div>
                    <div className="text-xs text-zinc-500">{task.category} • Priority: {task.priority}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">All caught up! Add daily priorities in the Execution Center.</p>
            )}
          </div>
        </Card>

        {/* Sales Leads Summary */}
        <Card header={<span className="card-title text-zinc-200 font-semibold">Active B2B Pipeline</span>}>
          <div className="flex flex-col gap-3">
            {recentLeads && recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center p-3 border border-zinc-800 rounded-lg bg-zinc-950/40">
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{lead.company}</div>
                    <div className="text-xs text-zinc-500">{lead.contact} • {lead.industry}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{lead.stage}</span>
                    <div className="text-xs font-mono font-bold mt-1 text-emerald-400">{formatCurrency(lead.opportunityValue)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No leads recorded. Add leads in CRM section.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card header={<span className="card-title text-zinc-200 font-semibold">Critical Deadlines</span>}>
          <div className="flex flex-col gap-2">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(d => (
                <div key={d.id} className="flex justify-between items-center py-2.5 border-b border-zinc-800 last:border-0">
                  <span className="text-sm text-zinc-300">{d.title}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">{d.dueDate || 'No date'}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No immediate deadlines.</p>
            )}
          </div>
        </Card>

        {/* System Indicators */}
        <Card header={<span className="card-title text-zinc-200 font-semibold">System Indicators</span>}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-1 border-b border-zinc-850">
              <span className="text-sm text-zinc-400">Active Formulation Projects</span>
              <span className="text-sm font-bold text-blue-400">{kpis.activeProjects}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-850">
              <span className="text-sm text-zinc-400">Formulated Products</span>
              <span className="text-sm font-bold text-emerald-400">{kpis.productsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-zinc-400">Supplier Connections</span>
              <span className="text-sm font-bold text-amber-400">{kpis.suppliersCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
