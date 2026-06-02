// convex/payments.ts
// Payment transaction tracking
import { v } from 'convex/values'
import { mutation, query, internalMutation } from './_generated/server'

// Record a payment
export const record = mutation({
  args: {
    uid: v.string(),
    reference: v.string(),
    amount: v.number(),
    currency: v.string(),
    provider: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('payments', {
      uid: args.uid,
      reference: args.reference,
      amount: args.amount,
      currency: args.currency,
      provider: args.provider,
      plan: args.plan,
      status: 'pending',
      createdAt: now,
    })
  },
})

// Verify a payment (called by webhook)
export const verify = internalMutation({
  args: {
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query('payments')
      .withIndex('by_reference', q => q.eq('reference', args.reference))
      .first()

    if (!payment) throw new Error('Payment not found')

    const now = Date.now()
    await ctx.db.patch(payment._id, {
      status: 'success',
      verifiedAt: now,
    })

    // Activate user subscription
    const user = await ctx.db
      .query('users')
      .withIndex('by_uid', q => q.eq('uid', payment.uid))
      .first()
    if (user) {
      await ctx.db.patch(user._id, { subscriptionActive: true, updatedAt: now })
    }
  },
})

export const markVerified = mutation({
  args: {
    reference: v.string(),
    provider: v.string(),
    eventId: v.optional(v.string()),
    status: v.union(v.literal('success'), v.literal('failed'), v.literal('pending')),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    uid: v.optional(v.string()),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const existing = await ctx.db
      .query('payments')
      .withIndex('by_reference', q => q.eq('reference', args.reference))
      .first()

    const status =
      args.status === 'success' ? 'success' : args.status === 'failed' ? 'failed' : 'pending'
    const paymentId =
      existing?._id ??
      (await ctx.db.insert('payments', {
        uid: args.uid ?? 'unknown',
        reference: args.reference,
        amount: args.amount ?? 0,
        currency: args.currency ?? 'NGN',
        provider: args.provider,
        plan: args.plan ?? 'student-single',
        status: 'pending',
        createdAt: now,
      }))

    const payment = existing ?? (await ctx.db.get(paymentId))
    if (!payment) throw new Error('Payment persistence failed')

    if (payment.status === 'success' && status === 'success') {
      return { idempotent: true, status: payment.status }
    }

    await ctx.db.patch(payment._id, {
      status,
      verifiedAt: status === 'success' ? now : payment.verifiedAt,
    })

    if (status === 'success') {
      const user = await ctx.db
        .query('users')
        .withIndex('by_uid', q => q.eq('uid', payment.uid))
        .first()
      if (user) {
        await ctx.db.patch(user._id, { subscriptionActive: true, updatedAt: now })
      }
    }

    return { idempotent: false, status }
  },
})

// Get payment history for a user
export const getByUser = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('payments')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .order('desc')
      .take(20)
  },
})
