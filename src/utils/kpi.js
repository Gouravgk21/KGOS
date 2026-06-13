/**
 * Calculate a composite health score between 0-100 based on recent health logs.
 * @param {Array} logs
 */
export function calculateHealthScore(logs = []) {
  if (logs.length === 0) return 0;

  // Take the last 7 logs or all if fewer
  const recentLogs = logs.slice(0, 7);
  let totalScore = 0;

  recentLogs.forEach(log => {
    // Energy levels (1-10) -> convert to 0-100 scale
    const energy = (log.energyLevel || 5) * 10;
    // Sleep quality (1-5) -> convert to 0-100 scale
    const sleepQuality = (log.sleepQuality || 3) * 20;
    // Sleep duration: ideal is 7-8 hours
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

/**
 * Calculate the weighted pipeline value based on deal stage probability.
 * @param {Array} leads
 */
export function calculatePipelineValue(leads = []) {
  // Probability coefficients per stage
  const STAGE_PROBABILITIES = {
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
    // Exclude converted stages from pipeline calculation if requested,
    // but here we keep them or filter. Let's calculate active pipeline (stages before conversion).
    if (lead.stage === 'CUSTOMER' || lead.stage === 'REPEAT') {
      return sum;
    }
    const val = Number(lead.opportunityValue) || 0;
    const prob = STAGE_PROBABILITIES[lead.stage] || 0.1;
    return sum + (val * prob);
  }, 0);
}

/**
 * Calculate goal completion percentage.
 */
export function calculateGoalCompletion(goals = []) {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
  return Math.round(totalProgress / goals.length);
}

/**
 * Calculate habit completion streak count.
 */
export function calculateHabitStreak(habit) {
  return habit.streak || 0;
}

/**
 * Calculate lead-to-customer conversion rate.
 */
export function calculateConversionRate(leads = []) {
  if (leads.length === 0) return 0;
  const converted = leads.filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT').length;
  return Math.round((converted / leads.length) * 100);
}
