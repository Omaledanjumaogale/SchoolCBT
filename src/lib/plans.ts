// src/lib/plans.ts
// SchoolCBT Payment Plan Configuration

export const PLANS = {
  'student-single': {
    name:        'Student — Single Exam',
    amountNGN:   10_000,
    amountUSD:   650,
    features:    ['Unlimited AI question batches', 'AI study plan', 'Report cards', 'Pass analytics'],
    durationDays: 90
  },
  'student-premium': {
    name:        'Student + Tutor Support',
    amountNGN:   25_000,
    amountUSD:   1600,
    features:    ['Everything in Single Exam', 'AI tutor matching', 'Live 1:1 sessions', 'Parent reports'],
    durationDays: 90
  },
  'school': {
    name:        'School / Institution',
    amountNGN:   null,
    amountUSD:   null,
    features:    ['Bulk onboarding', 'Admin dashboard', 'Custom branding', 'API integration'],
    durationDays: 365
  }
} as const;

export type PlanId = keyof typeof PLANS;