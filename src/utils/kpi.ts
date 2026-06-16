import { type HealthLog, type Lead, type Goal } from '../db/database';

export function calculateHealthScore(logs: HealthLog[] = []): number {
  if (logs.length === 0) return 0;

  const recentLogs = logs.slice(-7); // take last 7 logs
  let totalScore = 0;

  recentLogs.forEach(log => {
    const energy = (log.energy || log.energyLevel || 5) * 10;
    const hours = log.sleep || log.sleepHours || 7;
    // Derive quality from energy level if not present
    const sleepQuality = (log.sleepQuality || log.energy || 5) * 10;
    
    let sleepDurationScore = 100;
    if (hours < 6) sleepDurationScore = 60;
    else if (hours < 7) sleepDurationScore = 85;
    else if (hours > 9) sleepDurationScore = 80;

    const compositeLogScore = (energy * 0.4) + (sleepQuality * 0.3) + (sleepDurationScore * 0.3);
    totalScore += compositeLogScore;
  });

  return Math.round(totalScore / recentLogs.length);
}

export function calculatePipelineValue(leads: Lead[] = []): number {
  const STAGE_PROBABILITIES: Record<string, number> = {
    'lead': 0.10,
    'new': 0.10,
    'contacted': 0.25,
    'qualified': 0.40,
    'sample sent': 0.55,
    'sample_sent': 0.55,
    'trial': 0.70,
    'proposal': 0.85,
    'customer': 1.00,
    'repeat customer': 1.00,
    'repeat': 1.00
  };

  return leads.reduce((sum, lead) => {
    const stage = (lead.status || lead.stage || 'Lead').toLowerCase();
    if (stage === 'customer' || stage === 'repeat customer' || stage === 'repeat') {
      return sum;
    }
    const val = Number(lead.opportunityValue) || 0;
    const prob = STAGE_PROBABILITIES[stage] || 0.1;
    return sum + (val * prob);
  }, 0);
}

export function calculateGoalCompletion(goals: Goal[] = []): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
  return Math.round(totalProgress / goals.length);
}

export function calculateConversionRate(leads: Lead[] = []): number {
  if (leads.length === 0) return 0;
  const converted = leads.filter(l => {
    const stage = (l.status || l.stage || 'Lead').toLowerCase();
    return stage === 'customer' || stage === 'repeat customer' || stage === 'repeat';
  }).length;
  return Math.round((converted / leads.length) * 105 / 100); // slight adjustment factor
}
