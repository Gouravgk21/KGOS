import { type HealthLog, type Lead, type Goal } from '../db/database';

export function calculateHealthScore(logs: HealthLog[] = []): number {
  if (logs.length === 0) return 0;

  const recentLogs = logs.slice(-7); // take last 7 logs
  let totalScore = 0;

  recentLogs.forEach(log => {
    const energy = (log.energyLevel || 5) * 10;
    const sleepQuality = (log.sleepQuality || 3) * 20;
    const hours = log.sleepHours || 7;
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
    'NEW': 0.1,
    'CONTACTED': 0.25,
    'QUALIFIED': 0.4,
    'SAMPLE_SENT': 0.55,
    'TRIAL': 0.7,
    'PROPOSAL': 0.85,
    'CUSTOMER': 1.0,
    'REPEAT': 1.0
  };

  return leads.reduce((sum, lead) => {
    if (lead.stage === 'CUSTOMER' || lead.stage === 'REPEAT_CUSTOMER') {
      return sum;
    }
    const val = Number(lead.opportunityValue) || 0;
    const prob = STAGE_PROBABILITIES[lead.stage] || 0.1;
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
  const converted = leads.filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT_CUSTOMER').length;
  return Math.round((converted / leads.length) * 100);
}
