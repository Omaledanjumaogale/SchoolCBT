// convex/questions.ts
// AI-generated question bank queries
import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

// Get questions by subject and exam type (randomized batch)
export const getBatch = query({
  args: {
    subject: v.string(),
    examType: v.string(),
    count: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const count = args.count ?? 50;
    const questions = await ctx.db.query('questions')
      .withIndex('by_subject', q => q.eq('subject', args.subject))
      .filter(q => q.eq(q.field('examType'), args.examType))
      .take(count * 2); // fetch more to randomize

    // Shuffle and take requested count
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
});

// Get questions for a specific topic
export const getByTopic = query({
  args: {
    subject: v.string(),
    topic: v.string(),
    count: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const count = args.count ?? 20;
    return await ctx.db.query('questions')
      .withIndex('by_topic', q => q.eq('subject', args.subject).eq('topic', args.topic))
      .take(count);
  }
});

// Insert questions (called from AI generation pipeline)
export const insertBatch = internalMutation({
  args: {
    questions: v.array(v.object({
      subject: v.string(),
      examType: v.string(),
      topic: v.string(),
      q: v.string(),
      opts: v.array(v.string()),
      correct: v.number(),
      bloom: v.string(),
      exp: v.string(),
      difficulty: v.union(v.literal('Easy'), v.literal('Medium'), v.literal('Hard')),
      year: v.optional(v.number()),
      grounded: v.boolean()
    }))
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const q of args.questions) {
      await ctx.db.insert('questions', { ...q, createdAt: now });
    }
    return args.questions.length;
  }
});

// Count total questions
export const count = query({
  handler: async (ctx) => {
    const all = await ctx.db.query('questions').collect();
    return all.length;
  }
});
