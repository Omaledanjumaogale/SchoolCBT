// convex/sessions.ts
// CBT practice session tracking
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Start a new CBT session
export const start = mutation({
  args: {
    uid: v.string(),
    subject: v.string(),
    examType: v.string(),
    questionIds: v.array(v.id('questions')),
    batchNumber: v.number()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('sessions', {
      uid: args.uid,
      subject: args.subject,
      examType: args.examType,
      questionIds: args.questionIds,
      answers: new Array(args.questionIds.length).fill(null),
      score: 0,
      totalPoints: args.questionIds.length * 2,
      startedAt: now,
      batchNumber: args.batchNumber
    });
  }
});

// Complete a session
export const complete = mutation({
  args: {
    sessionId: v.id('sessions'),
    answers: v.array(v.union(v.number(), v.null())),
    score: v.number(),
    timeTaken: v.number()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.sessionId, {
      answers: args.answers,
      score: args.score,
      completedAt: now,
      timeTaken: args.timeTaken
    });
  }
});

// Get sessions for a user
export const getByUser = query({
  args: {
    uid: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db.query('sessions')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .order('desc')
      .take(limit);
  }
});

// Get session count for a user
export const getCount = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db.query('sessions')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .collect();
    return sessions.length;
  }
});
