import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { calculateHealthScore, calculatePipelineValue, calculateGoalCompletion, calculateConversionRate } from '../utils/kpi';

export function useDashboardKPIs() {
  return useLiveQuery(async () => {
    // 1. Health Logs & Habits
    const logs = await db.healthLogs.toArray();
    const habits = await db.habits.toArray();
    const skills = await db.skills.toArray();

    // 2. Business leads, customers, suppliers
    const leads = await db.leads.toArray();
    const customers = await db.customers.toArray();
    const products = await db.products.toArray();
    const suppliers = await db.suppliers.toArray();

    // 3. Projects & Tasks
    const projects = await db.projects.toArray();
    const tasks = await db.tasks.toArray();

    // Calculations
    const healthScore = calculateHealthScore(logs);

    // Habits completion today
    const todayStr = new Date().toISOString().split('T')[0];
    const activeHabits = habits.filter(h => h.isActive);
    const completedToday = activeHabits.filter(h => h.completedDates && h.completedDates.includes(todayStr)).length;
    const habitCompletion = activeHabits.length > 0 ? (completedToday / activeHabits.length) * 100 : 0;

    // Skills average
    const learningScore = skills.length > 0 ? (skills.reduce((sum, s) => sum + s.level, 0) / skills.length) * 10 : 0;

    // Pipeline & Revenue
    const totalRevenue = leads
      .filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT')
      .reduce((sum, l) => sum + (Number(l.opportunityValue) || 0), 0);

    const activeLeadsCount = leads.filter(l => l.stage !== 'CUSTOMER' && l.stage !== 'REPEAT').length;
    const pipelineValue = calculatePipelineValue(leads);
    const activeCustomersCount = leads.filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT').length;

    // Projects
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
