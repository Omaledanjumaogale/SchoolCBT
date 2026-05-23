// src/routes/pay/+server.ts
// SchoolCBT Payment Processing — Paystack + Stripe integration
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PLANS, type PlanId } from '$lib/plans';
import { PaymentRequestSchema } from '$lib/validation';

// ─── POST: initiate payment ──────────────────────────────────
export const POST: RequestHandler = async ({ request, platform }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid request body');
  }

  const parsed = PaymentRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw error(400, parsed.error.issues.map(i => i.message).join(', '));
  }

  const { plan, uid, email, currency = 'NGN' } = parsed.data;

  const planConfig = PLANS[plan];

  // ── Paystack (NGN) ───────────────────────────────────────
  if (currency === 'NGN') {
    const paystackKey = platform?.env?.PAYSTACK_SECRET_KEY as string;
    if (!paystackKey) {
      // Return mock response for development
      return json({
        provider:      'paystack',
        authorization_url: `https://checkout.paystack.com/mock?ref=SCB_${Date.now()}`,
        reference:     `SCB_${Date.now()}`,
        plan,
        amount:        planConfig.amountNGN
      });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${paystackKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount:    (planConfig.amountNGN ?? 10000) * 100, // kobo
        currency:  'NGN',
        reference: `SCB_${uid}_${Date.now()}`,
        metadata: {
          plan,
          uid,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: planConfig.name },
            { display_name: 'User ID', variable_name: 'uid', value: uid }
          ]
        },
        callback_url: `${platform?.env?.PUBLIC_APP_URL ?? 'http://localhost:5173'}/pay/verify`
      })
    });

    if (!response.ok) throw error(502, 'Payment gateway error');
    const data = await response.json();

    return json({
      provider:          'paystack',
      authorization_url: data.data.authorization_url,
      reference:         data.data.reference,
      plan,
      amount:            planConfig.amountNGN
    });
  }

  // ── Stripe (USD) ─────────────────────────────────────────
  const stripeKey = platform?.env?.STRIPE_SECRET_KEY as string;
  if (!stripeKey) {
    return json({
      provider:   'stripe',
      checkout_url: `https://checkout.stripe.com/mock?ref=SCB_${Date.now()}`,
      sessionId:  `cs_test_${Date.now()}`,
      plan,
      amount:     planConfig.amountUSD
    });
  }

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'payment_method_types[]':              'card',
      'line_items[0][price_data][currency]:': 'usd',
      'line_items[0][price_data][product_data][name]': planConfig.name,
      'line_items[0][price_data][unit_amount]':        String((planConfig.amountUSD ?? 650) * 100),
      'line_items[0][quantity]':                       '1',
      mode:                                            'payment',
      success_url: `${platform?.env?.PUBLIC_APP_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${platform?.env?.PUBLIC_APP_URL}/pricing`,
      'metadata[uid]':  uid,
      'metadata[plan]': plan
    })
  });

  if (!stripeResponse.ok) throw error(502, 'Stripe error');
  const stripeData = await stripeResponse.json();

  return json({
    provider:     'stripe',
    checkout_url: stripeData.url,
    sessionId:    stripeData.id,
    plan,
    amount:       planConfig.amountUSD
  });
};

// ─── GET: verify payment ─────────────────────────────────────
export const GET: RequestHandler = async ({ url, platform }) => {
  const reference = url.searchParams.get('reference');
  const trxref    = url.searchParams.get('trxref');
  const ref       = reference ?? trxref;

  if (!ref) throw error(400, 'No payment reference provided');

  const paystackKey = platform?.env?.PAYSTACK_SECRET_KEY as string;

  if (!paystackKey) {
    // Mock verification for development
    return json({ verified: true, reference: ref, plan: 'student-single', message: 'Mock payment verified' });
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
    headers: { Authorization: `Bearer ${paystackKey}` }
  });

  if (!response.ok) throw error(502, 'Verification failed');
  const data = await response.json();

  if (data.data.status !== 'success') {
    throw error(400, `Payment not successful: ${data.data.status}`);
  }

  // TODO: Update user subscription in Firestore
  const { uid, plan } = data.data.metadata ?? {};
  
  return json({
    verified:  true,
    reference: ref,
    plan,
    uid,
    amount:    data.data.amount / 100,
    currency:  data.data.currency,
    paidAt:    data.data.paid_at
  });
};
