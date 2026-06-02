// convex/schema.ts
// SchoolCBT Database Schema — Convex real-time backend
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Students and tutors
  users: defineTable({
    uid: v.string(), // Firebase Auth UID
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal('student'), v.literal('tutor'), v.literal('admin')),
    photoURL: v.optional(v.string()),
    phone: v.optional(v.string()),
    school: v.optional(v.string()),
    state: v.optional(v.string()),
    targetExam: v.optional(v.string()),
    subscriptionActive: v.boolean(),
    onboardingComplete: v.boolean(),
    njnVerified: v.boolean(),
    createdAt: v.number(), // timestamp ms
    updatedAt: v.optional(v.number()),
  })
    .index('by_uid', ['uid'])
    .index('by_role', ['role'])
    .index('by_email', ['email']),

  // Exam question
  questions: defineTable({
    subject: v.string(),
    examType: v.string(), // JAMB, WAEC, NECO, NABTEB
    topic: v.string(),
    q: v.string(),
    opts: v.array(v.string()),
    correct: v.number(),
    bloom: v.string(), // Knowledge, Comprehension, Application, Analysis
    exp: v.string(),
    difficulty: v.union(v.literal('Easy'), v.literal('Medium'), v.literal('Hard')),
    year: v.optional(v.number()),
    grounded: v.boolean(), // NERDC curriculum grounded
    createdAt: v.number(),
  })
    .index('by_subject', ['subject'])
    .index('by_exam', ['examType'])
    .index('by_topic', ['subject', 'topic']),

  // CBT practice sessions
  sessions: defineTable({
    uid: v.string(),
    subject: v.string(),
    examType: v.string(),
    mode: v.optional(v.union(v.literal('practice'), v.literal('mock'), v.literal('exam'))),
    difficulty: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
    questionIds: v.array(v.id('questions')),
    answers: v.array(v.union(v.number(), v.null())),
    skipped: v.optional(v.array(v.boolean())),
    score: v.number(),
    totalPoints: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    timeTaken: v.optional(v.number()), // seconds
    batchNumber: v.number(),
  })
    .index('by_uid', ['uid'])
    .index('by_uid_subject', ['uid', 'subject']),

  // Per-question attempt persistence for resumable CBT and audit-grade scoring
  questionAttempts: defineTable({
    uid: v.string(),
    sessionId: v.id('sessions'),
    questionId: v.optional(v.id('questions')),
    localQuestionId: v.optional(v.string()),
    questionIndex: v.number(),
    subject: v.string(),
    examType: v.string(),
    mode: v.union(v.literal('practice'), v.literal('mock'), v.literal('exam')),
    topic: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    selectedAnswer: v.optional(v.union(v.number(), v.null())),
    correctAnswer: v.number(),
    isCorrect: v.boolean(),
    skipped: v.boolean(),
    scoreAwarded: v.number(),
    maxScore: v.number(),
    timeSpent: v.number(),
    attemptNumber: v.number(),
    source: v.string(),
    aiRoute: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_uid', ['uid'])
    .index('by_session_question', ['sessionId', 'questionIndex'])
    .index('by_uid_subject', ['uid', 'subject']),

  // Student analytics (computed aggregates per user)
  analytics: defineTable({
    uid: v.string(),
    totalQuestions: v.number(),
    totalBatches: v.number(),
    totalHours: v.number(),
    avgScore: v.number(),
    passProbability: v.number(),
    streakDays: v.number(),
    lastActiveAt: v.number(),
    subjectBreakdown: v.optional(v.any()), // { Mathematics: { pct, correct, total }, ... }
    bloomBreakdown: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_uid', ['uid']),

  // Tutor profiles
  tutors: defineTable({
    uid: v.string(),
    subjects: v.array(v.string()),
    hourlyRateNGN: v.number(),
    rating: v.number(),
    totalSessions: v.number(),
    totalEarnings: v.number(),
    available: v.boolean(),
    bio: v.optional(v.string()),
    qualifications: v.optional(v.array(v.string())),
    verified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_uid', ['uid'])
    .index('by_subject', ['subjects']),

  // Tutor earnings
  earnings: defineTable({
    tutorUid: v.string(),
    studentUid: v.string(),
    sessionId: v.optional(v.string()),
    amount: v.number(),
    subject: v.string(),
    status: v.union(v.literal('pending'), v.literal('paid'), v.literal('cancelled')),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index('by_tutor', ['tutorUid'])
    .index('by_status', ['status']),

  // Tutor/student teaching engagement trail
  tutorEngagements: defineTable({
    tutorUid: v.string(),
    studentUid: v.string(),
    subject: v.string(),
    examType: v.string(),
    status: v.union(
      v.literal('requested'),
      v.literal('accepted'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    focusTopics: v.array(v.string()),
    lastActivity: v.optional(v.string()),
    sessionNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_tutor', ['tutorUid'])
    .index('by_student', ['studentUid'])
    .index('by_status', ['status']),

  // Payment transactions
  payments: defineTable({
    uid: v.string(),
    reference: v.string(),
    amount: v.number(),
    currency: v.string(),
    provider: v.string(), // paystack, stripe, flutterwave
    plan: v.string(),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('failed')),
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index('by_uid', ['uid'])
    .index('by_reference', ['reference']),

  // Admin approvals (tutor NIN verification etc)
  approvals: defineTable({
    uid: v.string(),
    type: v.union(v.literal('tutor_verification'), v.literal('school_onboarding')),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
    reviewerUid: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_uid', ['uid'])
    .index('by_status', ['status']),
})
