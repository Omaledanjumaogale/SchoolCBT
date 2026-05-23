// convex/tutors.ts
// Tutor management and matching
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Register a tutor
export const register = mutation({
  args: {
    uid: v.string(),
    subjects: v.array(v.string()),
    hourlyRateNGN: v.number(),
    bio: v.optional(v.string()),
    qualifications: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('tutors').withIndex('by_uid', q => q.eq('uid', args.uid)).first();
    if (existing) throw new Error('Tutor profile already exists');

    const now = Date.now();
    return await ctx.db.insert('tutors', {
      uid: args.uid,
      subjects: args.subjects,
      hourlyRateNGN: args.hourlyRateNGN,
      rating: 0,
      totalSessions: 0,
      totalEarnings: 0,
      available: true,
      bio: args.bio,
      qualifications: args.qualifications,
      verified: false,
      createdAt: now
    });
  }
});

// Get tutor by UID
export const getByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('tutors').withIndex('by_uid', q => q.eq('uid', args.uid)).first();
  }
});

// Find tutors by subject
export const findBySubject = query({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const tutors = await ctx.db.query('tutors')
      .withIndex('by_subject', q => q.eq('subjects', [args.subject]))
      .filter(q => q.eq(q.field('available'), true))
      .filter(q => q.eq(q.field('verified'), true))
      .collect();
    return tutors.sort((a, b) => b.rating - a.rating);
  }
});

// Count all tutors
export const count = query({
  handler: async (ctx) => {
    const all = await ctx.db.query('tutors').collect();
    return all.length;
  }
});

// Record earnings for a tutor session
export const recordEarning = mutation({
  args: {
    tutorUid: v.string(),
    studentUid: v.string(),
    amount: v.number(),
    subject: v.string(),
    sessionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const tutor = await ctx.db.query('tutors').withIndex('by_uid', q => q.eq('uid', args.tutorUid)).first();
    if (!tutor) throw new Error('Tutor not found');

    const now = Date.now();
    await ctx.db.patch(tutor._id, {
      totalSessions: tutor.totalSessions + 1,
      totalEarnings: tutor.totalEarnings + args.amount,
      updatedAt: now
    });

    await ctx.db.insert('earnings', {
      tutorUid: args.tutorUid,
      studentUid: args.studentUid,
      sessionId: args.sessionId,
      amount: args.amount,
      subject: args.subject,
      status: 'pending',
      createdAt: now
    });
  }
});

// Get earnings for a tutor
export const getEarnings = query({
  args: { tutorUid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('earnings')
      .withIndex('by_tutor', q => q.eq('tutorUid', args.tutorUid))
      .order('desc')
      .take(50);
  }
});
