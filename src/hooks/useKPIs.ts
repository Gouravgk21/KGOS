import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { calculateHealthScore, calculatePipelineValue } from '../utils/kpi';

export interface DashboardKPIs {
  healthScore: number;
  habitCompletion: number;
  learningScore: number;
  totalRevenue: number;
  activeLeads: number;
  pipelineValue: number;
  activeCustomers: number;
  activeProjects: number;
  completedTasks: number;
  productsCount: number;
  suppliersCount: number;
}

export function useDashboardKPIs(): DashboardKPIs | undefined {
  return useLiveQuery(async () => {
    const logs = await db.healthLogs.toArray();
    const habits = await db.habits.toArray();
    const skills = await db.skills.toArray();
    const leads = await db.leads.toArray();
    const products = await db.products.toArray();
    const suppliers = await db.suppliers.toArray();
    const projects = await db.projects.toArray();
    const tasks = await db.tasks.toArray();

    const healthScore = calculateHealthScore(logs);

    const todayStr = new Date().toISOString().split('T')[0];
    const activeHabits = habits.filter(h => h.isActive);
    const completedToday = activeHabits.filter(h => h.completedDates && h.completedDates.includes(todayStr)).length;
    const habitCompletion = activeHabits.length > 0 ? (completedToday / activeHabits.length) * 100 : 0;

    const learningScore = skills.length > 0 ? (skills.reduce((sum, s) => sum + s.level, 0) / skills.length) * 10 : 0;

    const totalRevenue = leads
      .filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT_CUSTOMER')
      .reduce((sum, l) => sum + (Number(l.opportunityValue) || 0), 0);

    const activeLeadsCount = leads.filter(l => l.stage !== 'CUSTOMER' && l.stage !== 'REPEAT_CUSTOMER').length;
    const pipelineValue = calculatePipelineValue(leads);
    const activeCustomersCount = leads.filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT_CUSTOMER').length;

    const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;
    const completedTasksCount = tasks.filter(t => t.status === 'DONE').length;

    return {
      healthScore,
      habitCompletion,
      learningScore,
      totalRevenue,
      activeLeads: activeLeadsCount,
      pipelineValue,
      activeCustomers: activeCustomersCount,
      activeProjects: activeProjectsCount,
      completedTasks: completedTasksCount,
      productsCount: products.filter(p => p.isActive).length,
      suppliersCount: suppliers.length
    };
  });
}
