import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useDashboardKPIs } from '../hooks/useKPIs';
import KPICard from '../components/ui/KPICard';
import Card from '../components/ui/Card';
import ActivityFeed from '../components/widgets/ActivityFeed';
import { Heart, CheckCircle, GraduationCap, Building2, UserPlus, FolderKanban, ClipboardList, Trash2, Sprout } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function Dashboard() {
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

  const toggleTask = async (id, currentStatus) => {
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
      <div className="page animate-fade-in flex flex-col gap-6 p-4">
        <div className="loading-skeleton loading-bar h-12 w-1/3" />
        <div className="grid grid-4 gap-4">
          <div className="loading-skeleton h-32" />
          <div className="loading-skeleton h-32" />
          <div className="loading-skeleton h-32" />
          <div className="loading-skeleton h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, Kumar</h1>
          <p className="text-sm text-secondary">Here is an overview of your life and KAFS enterprise indicators today.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
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

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {/* Daily Focus Card */}
        <Card header={<span className="card-title">Daily Focus Priorities</span>}>
          <div className="flex flex-col gap-3">
            {priorities && priorities.length > 0 ? (
              priorities.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 border border-glass rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.status === 'DONE'}
                    onChange={() => toggleTask(task.id, task.status)}
                    className="clickable"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-primary">{task.title}</div>
                    <div className="text-xs text-secondary">{task.category} • Priority: {task.priority}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary">All caught up! Add daily priorities in the Execution Center.</p>
            )}
          </div>
        </Card>

        {/* Sales Leads Summary */}
        <Card header={<span className="card-title">Active B2B Pipeline</span>}>
          <div className="flex flex-col gap-3">
            {recentLeads && recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center p-3 border border-glass rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-primary">{lead.company}</div>
                    <div className="text-xs text-secondary">{lead.contact} • {lead.industry}</div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-info">{lead.stage}</span>
                    <div className="text-xs font-mono font-bold mt-1 text-success">{formatCurrency(lead.opportunityValue)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary">No leads recorded. Add leads in CRM section.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {/* Upcoming Deadlines */}
        <Card header={<span className="card-title">Critical Deadlines</span>}>
          <div className="flex flex-col gap-2">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(d => (
                <div key={d.id} className="flex justify-between items-center py-2 border-b border-glass last:border-0">
                  <span className="text-sm text-primary">{d.title}</span>
                  <span className="text-xs badge badge-danger">{d.dueDate || 'No date'}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary">No immediate deadlines.</p>
            )}
          </div>
        </Card>

        {/* Global Stats */}
        <Card header={<span className="card-title">System Indicators</span>}>
          <div className="flex flex-col gap-3">
            <div className="stat-row">
              <span className="stat-label">Active Formulation Projects</span>
              <span className="stat-value text-accent">{kpis.activeProjects}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Formulated Products</span>
              <span className="stat-value text-success">{kpis.productsCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Supplier Connections</span>
              <span className="stat-value text-warning">{kpis.suppliersCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
