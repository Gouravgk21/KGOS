/**
 * Opportunity Scoring System - CEO Decision Center
 * Calculates a priority score from 0-100 based on strategic, revenue, learning, brand, and research values vs costs/risks.
 */
export function scoreOpportunity(factors) {
  const {
    strategicAlignment = 5, // 1-10
    revenuePotential = 5,   // 1-10
    learningValue = 5,      // 1-10
    brandValue = 5,         // 1-10
    researchValue = 5,      // 1-10
    timeRequired = 5,       // 1-10 (higher means MORE time cost, penalizes score)
    difficulty = 5,         // 1-10 (higher means harder, penalizes score)
    risk = 5,               // 1-10 (higher means riskier, penalizes score)
    opportunityCost = 5     // 1-10 (higher means more cost, penalizes score)
  } = factors;

  // Weighted positives (out of 100 max potential positive)
  const positiveScore = 
    (strategicAlignment * 3.5) + // 35% weight
    (revenuePotential * 2.5) +   // 25% weight
    (learningValue * 1.5) +      // 15% weight
    (brandValue * 1.0) +         // 10% weight
    (researchValue * 1.5);       // 15% weight

  // Weighted negatives (out of 100 max potential penalty)
  const penaltyScore = 
    (timeRequired * 3.0) +       // 30% weight
    (difficulty * 2.0) +         // 20% weight
    (risk * 2.5) +               // 25% weight
    (opportunityCost * 2.5);     // 25% weight

  // Final score is a balanced ratio, mapped to 0 - 100 range
  let finalScore = Math.round((positiveScore * 2 + (100 - penaltyScore)) / 3);
  
  if (finalScore < 0) finalScore = 0;
  if (finalScore > 100) finalScore = 100;
  
  return finalScore;
}

/**
 * Returns the recommended action type.
 * @param {number} score
 */
export function getDecisionType(score) {
  if (score >= 75) return 'Do Now';
  if (score >= 55) return 'Schedule';
  if (score >= 35) return 'Delegate';
  return 'Reject';
}

/**
 * Generates recommendation text based on factors and final priority score.
 */
export function generateRecommendation(score, factors) {
  const type = getDecisionType(score);
  
  if (type === 'Do Now') {
    return `Highly recommended opportunity (Priority Score: ${score}/100). The strategic alignment (${factors.strategicAlignment || 5}/10) and revenue potential (${factors.revenuePotential || 5}/10) justify immediate, focused execution. Allocate high-priority resources.`;
  }
  if (type === 'Schedule') {
    return `Strong potential (Priority Score: ${score}/100). Schedule this project in the next execution block. Balance risk (${factors.risk || 5}/10) and complexity before commencing.`;
  }
  if (type === 'Delegate') {
    return `Moderate alignment (Priority Score: ${score}/100). Consider delegating or simplifying. The high time requirement (${factors.timeRequired || 5}/10) or difficulty (${factors.difficulty || 5}/10) makes it inefficient for prime leadership hours.`;
  }
  return `Decline opportunity (Priority Score: ${score}/100). The opportunity cost (${factors.opportunityCost || 5}/10) or overall risk is too high relative to the strategic returns. Focus attention elsewhere.`;
}
