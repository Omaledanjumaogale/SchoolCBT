// convex/users.ts
// User management queries and mutations
import { v } from 'convex/values'
import { mutation, query, internalMutation } from './_generated/server'

// Create user profile on signup (called internally from auth webhook)
export const create = internalMutation({
  args: {
    uid: v.string(),
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal('student'), v.literal('tutor')),
    phone: v.optional(v.string()),
    targetExam: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first()
    if (existing) return existing._id

    const now = Date.now()
    return await ctx.db.insert('users', {
      uid: args.uid,
      email: args.email,
      displayName: args.displayName,
      role: args.role,
      phone: args.phone,
      targetExam: args.targetExam,
      school: undefined,
      state: undefined,
      photoURL: undefined,
      subscriptionActive: false,
      onboardingComplete: false,
      njnVerified: false,
      createdAt: now,
    })
  },
})

// Get user by Firebase UID
export const getByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first()
  },
})

// Update user profile
export const updateProfile = mutation({
  args: {
    uid: v.string(),
    displayName: v.optional(v.string()),
    school: v.optional(v.string()),
    state: v.optional(v.string()),
    phone: v.optional(v.string()),
    targetExam: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first()
    if (!user) throw new Error('User not found')

    const { uid, ...updates } = args
    return await ctx.db.patch(user._id, { ...updates, updatedAt: Date.now() })
  },
})

// Activate subscription
export const activateSubscription = mutation({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first()
    if (!user) throw new Error('User not found')
    await ctx.db.patch(user._id, { subscriptionActive: true, updatedAt: Date.now() })
  },
})

// Synchronize user profile on login/registration (called from backend or client)
export const sync = mutation({
  args: {
    uid: v.string(),
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal('student'), v.literal('tutor'), v.literal('admin')),
    phone: v.optional(v.string()),
    targetExam: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .first()

    const now = Date.now()
    if (existing) {
      const updates: Record<string, any> = {
        email: args.email,
        displayName: args.displayName,
        updatedAt: now,
      }
      if (args.phone !== undefined) updates.phone = args.phone
      if (args.targetExam !== undefined) updates.targetExam = args.targetExam

      await ctx.db.patch(existing._id, updates)
      return existing._id
    }

    return await ctx.db.insert('users', {
      uid: args.uid,
      email: args.email,
      displayName: args.displayName,
      role: args.role,
      phone: args.phone,
      targetExam: args.targetExam,
      subscriptionActive: false,
      onboardingComplete: false,
      njnVerified: false,
      createdAt: now,
    })
  },
})
