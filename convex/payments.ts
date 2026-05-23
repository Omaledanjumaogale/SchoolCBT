// convex/payments.ts
// Payment transaction tracking
import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

// Record a payment
export const record = mutation({
  args: {
    uid: v.string(),
    reference: v.string(),
    amount: v.number(),
    currency: v.string(),
    provider: v.string(),
    plan: v.string()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('payments', {
      uid: args.uid,
      reference: args.reference,
      amount: args.amount,
      currency: args.currency,
      provider: args.provider,
      plan: args.plan,
      status: 'pending',
      createdAt: now
    });
  }
});

// Verify a payment (called by webhook)
export const verify = internalMutation({
  args: {
    reference: v.string()
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.query('payments')
      .withIndex('by_reference', q => q.eq('reference', args.reference))
      .first();

    if (!payment) throw new Error('Payment not found');

    const now = Date.now();
    await ctx.db.patch(payment._id, {
      status: 'success',
      verifiedAt: now
    });

    // Activate user subscription
    const user = await ctx.db.query('users').withIndex('by_uid', q => q.eq('uid', payment.uid)).first();
    if (user) {
      await ctx.db.patch(user._id, { subscriptionActive: true, updatedAt: now });
    }
  }
});

// Get payment history for a user
export const getByUser = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('payments')
      .withIndex('by_uid', q => q.eq('uid', args.uid))
      .order('desc')
      .take(20);
  }
});
