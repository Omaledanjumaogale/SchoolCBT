// convex/sessions.ts
// CBT practice session tracking
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Start a new CBT session
export const start = mutation({
  args: {
    uid: v.string(),
    subject: v.string(),
    examType: v.string(),
    mode: v.optional(v.union(v.literal('practice'), v.literal('mock'), v.literal('exam'))),
    difficulty: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
    questionIds: v.array(v.id('questions')),
    questionCount: v.optional(v.number()),
    batchNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const questionCount = args.questionCount ?? args.questionIds.length
    return await ctx.db.insert('sessions', {
      uid: args.uid,
      subject: args.subject,
      examType: args.examType,
      mode: args.mode,
      difficulty: args.difficulty,
      topics: args.topics,
      questionIds: args.questionIds,
      answers: new Array(questionCount).fill(null),
      skipped: new Array(questionCount).fill(false),
      score: 0,
      totalPoints: questionCount * 2,
      startedAt: now,
      batchNumber: args.batchNumber,
    })
  },
})

export const answer = mutation({
  args: {
    sessionId: v.id('sessions'),
    uid: v.string(),
    questionIndex: v.number(),
    answer: v.union(v.number(), v.null()),
    score: v.number(),
    skipped: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.uid !== args.uid) throw new Error('Session not found')
    if (session.completedAt) throw new Error('Session already completed')

    const answers = [...session.answers]
    if (args.questionIndex < 0 || args.questionIndex >= answers.length)
      throw new Error('Invalid question index')
    answers[args.questionIndex] = args.answer
    const skipped = [...(session.skipped ?? new Array(answers.length).fill(false))]
    skipped[args.questionIndex] = args.skipped ?? args.answer === null

    await ctx.db.patch(args.sessionId, {
      answers,
      skipped,
      score: args.score,
    })
  },
})

export const saveQuestionAttempt = mutation({
  args: {
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
    source: v.string(),
    aiRoute: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.uid !== args.uid) throw new Error('Session not found')
    if (args.questionIndex < 0 || args.questionIndex >= session.answers.length) {
      throw new Error('Invalid question index')
    }

    const now = Date.now()
    const existing = await ctx.db
      .query('questionAttempts')
      .withIndex('by_session_question', q =>
        q.eq('sessionId', args.sessionId).eq('questionIndex', args.questionIndex),
      )
      .first()

    const patch = {
      uid: args.uid,
      sessionId: args.sessionId,
      questionId: args.questionId,
      localQuestionId: args.localQuestionId,
      questionIndex: args.questionIndex,
      subject: args.subject,
      examType: args.examType,
      mode: args.mode,
      topic: args.topic,
      difficulty: args.difficulty,
      selectedAnswer: args.selectedAnswer,
      correctAnswer: args.correctAnswer,
      isCorrect: args.isCorrect,
      skipped: args.skipped,
      scoreAwarded: args.scoreAwarded,
      maxScore: args.maxScore,
      timeSpent: args.timeSpent,
      source: args.source,
      aiRoute: args.aiRoute,
      updatedAt: now,
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...patch,
        attemptNumber: existing.attemptNumber + 1,
      })
      return existing._id
    }

    return await ctx.db.insert('questionAttempts', {
      ...patch,
      attemptNumber: 1,
      createdAt: now,
    })
  },
})

// Complete a session
export const complete = mutation({
  args: {
    sessionId: v.id('sessions'),
    uid: v.string(),
    answers: v.array(v.union(v.number(), v.null())),
    skipped: v.optional(v.array(v.boolean())),
    score: v.number(),
    timeTaken: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.uid !== args.uid) throw new Error('Session not found')

    const now = Date.now()
    await ctx.db.patch(args.sessionId, {
      answers: args.answers,
      skipped: args.skipped,
      score: args.score,
      completedAt: now,
      timeTaken: args.timeTaken,
    })
  },
})

// Get sessions for a user
export const getByUser = query({
  args: {
    uid: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20
    return await ctx.db
      .query('sessions')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .order('desc')
      .take(limit)
  },
})

// Get session count for a user
export const getCount = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .collect()
    return sessions.length
  },
})
