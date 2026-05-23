// src/lib/utils/grading.ts
// SchoolCBT — WAEC / JAMB / NECO Grading Utilities

export type WAECGrade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';

export interface GradeResult {
  grade:       WAECGrade;
  label:       string;
  passed:      boolean;
  color:       'jade' | 'gold' | 'scarlet';
  description: string;
  points:      number; // For aggregate scoring (A1=1, B2=2, etc.)
}

// ─── WAEC Grading Scale ──────────────────────────────────────
const WAEC_SCALE: Array<{ min: number; grade: WAECGrade; label: string; passed: boolean; points: number; description: string }> = [
  { min: 75, grade: 'A1', label: 'A1 — Excellent',  passed: true,  points: 1, description: 'Distinction — Outstanding performance' },
  { min: 70, grade: 'B2', label: 'B2 — Very Good',  passed: true,  points: 2, description: 'Merit — Very good performance' },
  { min: 65, grade: 'B3', label: 'B3 — Good',        passed: true,  points: 3, description: 'Merit — Good performance' },
  { min: 60, grade: 'C4', label: 'C4 — Credit',      passed: true,  points: 4, description: 'Credit — Satisfactory performance' },
  { min: 55, grade: 'C5', label: 'C5 — Credit',      passed: true,  points: 5, description: 'Credit — Average performance' },
  { min: 50, grade: 'C6', label: 'C6 — Credit',      passed: true,  points: 6, description: 'Credit — Minimum credit standard' },
  { min: 45, grade: 'D7', label: 'D7 — Pass',        passed: false, points: 7, description: 'Pass — Below credit standard' },
  { min: 40, grade: 'E8', label: 'E8 — Pass',        passed: false, points: 8, description: 'Pass — Minimum pass standard' },
  { min: 0,  grade: 'F9', label: 'F9 — Fail',        passed: false, points: 9, description: 'Fail — Below acceptable standard' }
];

export function getWAECGrade(percentageScore: number): GradeResult {
  const entry = WAEC_SCALE.find(s => percentageScore >= s.min) ?? WAEC_SCALE[WAEC_SCALE.length - 1];
  return {
    grade:       entry.grade,
    label:       entry.label,
    passed:      entry.passed,
    color:       entry.passed && entry.points <= 3 ? 'jade' : entry.passed ? 'gold' : 'scarlet',
    description: entry.description,
    points:      entry.points
  };
}

// ─── JAMB Score Conversion ───────────────────────────────────
export function convertToJAMBScore(correctAnswers: number, totalQuestions = 50): number {
  // JAMB scores out of 400 (for 4 subjects)
  const subjectScore = Math.round((correctAnswers / totalQuestions) * 100);
  return subjectScore;
}

// ─── Pass Probability Calculator ─────────────────────────────
export interface PassProbability {
  probability:   number; // 0–100
  trend:         'improving' | 'declining' | 'stable';
  recommendation: string;
  riskLevel:     'low' | 'medium' | 'high';
}

export function calculatePassProbability(
  recentScores: number[],
  targetGrade:  WAECGrade = 'C6'
): PassProbability {
  if (!recentScores.length) {
    return { probability: 0, trend: 'stable', recommendation: 'Start practicing to see your pass probability.', riskLevel: 'high' };
  }

  const avg    = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const recent = recentScores.slice(-3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

  const targetMin = WAEC_SCALE.find(s => s.grade === targetGrade)?.min ?? 50;
  const gap       = targetMin - avg;

  // Trend calculation
  let trend: PassProbability['trend'] = 'stable';
  if (recentScores.length >= 2) {
    const oldAvg = recentScores.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, recentScores.length - 3);
    if (recentAvg > oldAvg + 3) trend = 'improving';
    else if (recentAvg < oldAvg - 3) trend = 'declining';
  }

  // Probability (sigmoid-like)
  const probability = Math.min(100, Math.max(0, Math.round(
    50 + (avg - targetMin) * 1.5 + (trend === 'improving' ? 5 : trend === 'declining' ? -5 : 0)
  )));

  const riskLevel: PassProbability['riskLevel'] =
    probability >= 75 ? 'low' : probability >= 50 ? 'medium' : 'high';

  const recommendation =
    probability >= 80 ? 'Excellent! Maintain your current pace and focus on remaining weak topics.' :
    probability >= 65 ? 'Good progress! Push harder on weak areas to exceed the credit threshold.' :
    probability >= 50 ? 'You are close to the pass mark. Increase daily practice batches to 2–3 per day.' :
    'Intensive practice needed. Consider AI tutor matching for targeted support in weak topics.';

  return { probability, trend, recommendation, riskLevel };
}

// ─── Batch Score Utilities ───────────────────────────────────
export function calculateBatchScore(
  answers:   (number | null)[],
  questions: { correct: number }[]
): { score: number; correct: number; wrong: number; unanswered: number; percentage: number } {
  let correct = 0, wrong = 0, unanswered = 0;
  answers.forEach((a, i) => {
    if (a === null || a === -1) unanswered++;
    else if (a === questions[i]?.correct) correct++;
    else wrong++;
  });
  const score      = correct * 2;
  const maxScore   = questions.length * 2;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, correct, wrong, unanswered, percentage };
}

// ─── Award Determination ──────────────────────────────────────
export type Award = 'gold' | 'silver' | 'bronze' | null;

export function determineBatchAward(percentage: number): Award {
  if (percentage >= 90) return 'gold';
  if (percentage >= 80) return 'silver';
  if (percentage >= 75) return 'bronze';
  return null;
}

export const AWARD_LABELS: Record<NonNullable<Award>, string> = {
  gold:   '🥇 Gold Award',
  silver: '🥈 Silver Award',
  bronze: '🥉 Bronze Award'
};

// ─── Star Rating ──────────────────────────────────────────────
export function calculateStarRating(percentage: number): number {
  if (percentage >= 90) return 5;
  if (percentage >= 80) return 4;
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 2;
  if (percentage >= 50) return 1;
  return 0;
}
