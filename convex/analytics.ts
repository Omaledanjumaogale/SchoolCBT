// convex/analytics.ts
// Student analytics queries — aggregated performance data
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get analytics for a user
export const getByUser = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('analytics')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first();
  }
});

// Update (or create) analytics after session completion
export const updateAfterSession = mutation({
  args: {
    uid: v.string(),
    sessionScore: v.number(),
    totalPoints: v.number(),
    timeTaken: v.number(), // seconds
    subject: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('analytics')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first();

    const now = Date.now();
    const pct = args.totalPoints > 0 ? Math.round((args.sessionScore / args.totalPoints) * 100) : 0;

    if (existing) {
      const newTotalQuestions = existing.totalQuestions + Math.round(args.totalPoints / 2);
      const newTotalBatches = existing.totalBatches + 1;
      const newTotalHours = existing.totalHours + Math.round(args.timeTaken / 3600 * 10) / 10;
      const newAvgScore = Math.round((existing.avgScore * existing.totalBatches + pct) / newTotalBatches);
      const newStreak = (now - existing.lastActiveAt < 86400000 * 2) ? existing.streakDays + 1 : 1;

      const subjectBreakdown = (existing.subjectBreakdown as Record<string, { pct: number; correct: number; total: number }>) ?? {};

      await ctx.db.patch(existing._id, {
        totalQuestions: newTotalQuestions,
        totalBatches: newTotalBatches,
        totalHours: newTotalHours,
        avgScore: newAvgScore,
        streakDays: newStreak,
        lastActiveAt: now,
        subjectBreakdown,
        updatedAt: now
      });
    } else {
      // Create initial analytics record
      await ctx.db.insert('analytics', {
        uid: args.uid,
        totalQuestions: Math.round(args.totalPoints / 2),
        totalBatches: 1,
        totalHours: Math.round(args.timeTaken / 3600 * 10) / 10,
        avgScore: pct,
        passProbability: 0,
        streakDays: 1,
        lastActiveAt: now,
        subjectBreakdown: {},
        bloomBreakdown: {},
        createdAt: now,
        updatedAt: now
      });
    }
  }
});

// Get leaderboard (top students by avg score)
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const all = await ctx.db.query('analytics').order('desc').collect();
    return all
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit);
  }
});
