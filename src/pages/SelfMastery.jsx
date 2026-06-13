import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import KPICard from '../components/ui/KPICard';
import { Brain, Heart, CheckCircle, GraduationCap, Users, Activity } from 'lucide-react';
import { calculateHealthScore } from '../utils/kpi';

export default function SelfMastery() {
  const habits = useLiveQuery(() => db.habits.toArray()) || [];
  const skills = useLiveQuery(() => db.skills.toArray()) || [];
  const contacts = useLiveQuery(() => db.relationships.toArray()) || [];
  const healthLogs = useLiveQuery(() => db.healthLogs.toArray()) || [];

  // Metrics
  const healthScore = calculateHealthScore(healthLogs);
  
  const activeHabits = habits.filter(h => h.isActive);
  const averageHabitStreak = activeHabits.length > 0 
    ? Math.round(activeHabits.reduce((sum, h) => sum + (h.streak || 0), 0) / activeHabits.length) 
    : 0;

  const moduleLinks = [
    { label: 'Health Center', desc: 'Vitals tracking, weight tracker & workouts', icon: Heart, path: '/self-mastery/health', color: '#f43f5e', colorDim: 'rgba(244, 63, 94, 0.15)', metric: `${healthLogs.length} logs` },
    { label: 'Habit Tracker', desc: 'Manage streaks and daily discipline items', icon: CheckCircle, path: '/self-mastery/habits', color: '#10b981', colorDim: 'rgba(16, 185, 129, 0.15)', metric: `${activeHabits.length} active` },
    { label: 'Skills & Development', desc: 'Compound professional formulation & B2B sales skills', icon: GraduationCap, path: '/self-mastery/development', color: '#3b82f6', colorDim: 'rgba(59, 130, 246, 0.15)', metric: `${skills.length} tracked` },
    { label: 'Personal CRM', desc: 'Strategic mentor, industry advisor & client mapping', icon: Users, path: '/self-mastery/relationships', color: '#8b5cf6', colorDim: 'rgba(139, 92, 246, 0.15)', metric: `${contacts.length} contacts` }
  ];

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          Self Mastery Command
        </h1>
        <p className="text-sm text-secondary">Cultivate energy, build habits, and master B2B sales, hydrocolloids, and AI.</p>
      </div>

      {/* KPI summaries */}
      <div className="kpi-grid">
        <KPICard label="Health Index" value={`${healthScore}/100`} icon={Heart} color="#f43f5e" colorDim="rgba(244, 63, 94, 0.15)" />
        <KPICard label="Average Habit Streak" value={`${averageHabitStreak}d`} icon={CheckCircle} color="#10b981" colorDim="rgba(16, 185, 129, 0.15)" />
        <KPICard label="Skills Tracked" value={skills.length} icon={GraduationCap} color="#3b82f6" colorDim="rgba(59, 130, 246, 0.15)" />
        <KPICard label="Network Connections" value={contacts.length} icon={Users} color="#8b5cf6" colorDim="rgba(139, 92, 246, 0.15)" />
      </div>

      {/* Module Grid */}
      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {moduleLinks.map((mod) => (
          <Link to={mod.path} key={mod.label}>
            <Card interactive className="h-full flex flex-col justify-between">
              <div>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" 
                  style={{ backgroundColor: mod.colorDim, color: mod.color }}
                >
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-primary text-base">{mod.label}</h3>
                <p className="text-xs text-secondary mt-1 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="text-xs font-mono font-bold mt-4 text-accent uppercase tracking-wider">{mod.metric}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
