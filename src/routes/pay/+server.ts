// src/routes/pay/+server.ts
// SchoolCBT Payment Processing — Paystack + Stripe + Flutterwave + KoraPay + Seerbit
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PLANS } from '$lib/plans';
import { PaymentRequestSchema } from '$lib/validation';

// ─── HELPERS ────────────────────────────────────────────────
function generateRef(prefix: string, uid: string): string {
  return `${prefix}_${uid}_${Date.now()}`;
}

// Payment recording is handled client-side via Convex mutations post-verification.
// Server-side payment initiation returns authorization URLs for redirect-based flows.

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
  const provider = (body as any)?.provider ?? (currency === 'NGN' ? 'paystack' : 'stripe');
  const appUrl = (platform?.env?.PUBLIC_APP_URL as string) ?? 'http://localhost:5173';

  // ── Flutterwave (NGN + multi-currency) ────────────────────
  if (provider === 'flutterwave') {
    const flwKey = platform?.env?.FLUTTERWAVE_SECRET_KEY as string;
    if (!flwKey) {
      return json({
        provider: 'flutterwave',
        authorization_url: `https://checkout.flutterwave.com/mock?ref=FLW_${Date.now()}`,
        reference: `FLW_${Date.now()}`,
        plan,
        amount: planConfig.amountNGN
      });
    }

    const ref = generateRef('FLW', uid);
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flwKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: ref,
        amount: planConfig.amountNGN ?? 10000,
        currency: 'NGN',
        redirect_url: `${appUrl}/pay/verify?provider=flutterwave`,
        payment_options: 'card,banktransfer,ussd',
        customer: { email, name: uid },
        customizations: {
          title: 'SchoolCBT Subscription',
          description: planConfig.name,
          logo: `${appUrl}/favicon.svg`
        },
        meta: { uid, plan }
      })
    });

    if (!response.ok) throw error(502, 'Flutterwave payment error');
    const data = await response.json();

    if (data.status !== 'success') throw error(400, data.message ?? 'Payment initiation failed');

    return json({
      provider: 'flutterwave',
      authorization_url: data.data.link,
      reference: ref,
      plan,
      amount: planConfig.amountNGN
    });
  }

  // ── KoraPay (NGN) ─────────────────────────────────────────
  if (provider === 'korapay') {
    const koraKey = platform?.env?.KORAPAY_SECRET_KEY as string;
    if (!koraKey) {
      return json({
        provider: 'korapay',
        authorization_url: `https://checkout.korapay.com/mock?ref=KPAY_${Date.now()}`,
        reference: `KPAY_${Date.now()}`,
        plan,
        amount: planConfig.amountNGN
      });
    }

    const ref = generateRef('KPAY', uid);
    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${koraKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference: ref,
        amount: planConfig.amountNGN ?? 10000,
        currency: 'NGN',
        customer: { email, name: uid },
        redirect_url: `${appUrl}/pay/verify?provider=korapay`,
        metadata: { uid, plan }
      })
    });

    if (!response.ok) throw error(502, 'KoraPay payment error');
    const data = await response.json();

    return json({
      provider: 'korapay',
      authorization_url: data.data.checkout_url,
      reference: ref,
      plan,
      amount: planConfig.amountNGN
    });
  }

  // ── Seerbit (NGN) ─────────────────────────────────────────
  if (provider === 'seerbit') {
    const seerbitKey = platform?.env?.SEERBIT_SECRET_KEY as string;
    if (!seerbitKey) {
      return json({
        provider: 'seerbit',
        authorization_url: `https://checkout.seerbitapi.com/mock?ref=SEER_${Date.now()}`,
        reference: `SEER_${Date.now()}`,
        plan,
        amount: planConfig.amountNGN
      });
    }

    const ref = generateRef('SEER', uid);
    const response = await fetch('https://seerbitapi.com/api/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${seerbitKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publicKey: platform?.env?.SEERBIT_PUBLIC_KEY as string ?? '',
        amount: (planConfig.amountNGN ?? 10000).toString(),
        currency: 'NGN',
        country: 'NG',
        paymentReference: ref,
        email,
        productId: plan,
        productDescription: planConfig.name,
        callbackUrl: `${appUrl}/pay/verify?provider=seerbit`,
        metadata: { uid, plan }
      })
    });

    if (!response.ok) throw error(502, 'Seerbit payment error');
    const data = await response.json();

    return json({
      provider: 'seerbit',
      authorization_url: data.data.payments.redirectLink,
      reference: ref,
      plan,
      amount: planConfig.amountNGN
    });
  }

  // ── Paystack (NGN — default) ─────────────────────────────
  if (provider === 'paystack' || currency === 'NGN') {
    const paystackKey = platform?.env?.PAYSTACK_SECRET_KEY as string;
    if (!paystackKey) {
      return json({
        provider: 'paystack',
        authorization_url: `https://checkout.paystack.com/mock?ref=SCB_${Date.now()}`,
        reference: `SCB_${Date.now()}`,
        plan,
        amount: planConfig.amountNGN
      });
    }

    const ref = generateRef('SCB', uid);
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: (planConfig.amountNGN ?? 10000) * 100, // kobo
        currency: 'NGN',
        reference: ref,
        metadata: { plan, uid },
        callback_url: `${appUrl}/pay/verify?provider=paystack`
      })
    });

    if (!response.ok) throw error(502, 'Paystack payment error');
    const data = await response.json();

    return json({
      provider: 'paystack',
      authorization_url: data.data.authorization_url,
      reference: ref,
      plan,
      amount: planConfig.amountNGN
    });
  }

  // ── Stripe (USD) ─────────────────────────────────────────
  const stripeKey = platform?.env?.STRIPE_SECRET_KEY as string;
  if (!stripeKey) {
    return json({
      provider: 'stripe',
      checkout_url: `https://checkout.stripe.com/mock?ref=SCB_${Date.now()}`,
      sessionId: `cs_test_${Date.now()}`,
      plan,
      amount: planConfig.amountUSD
    });
  }

  const ref = generateRef('STR', uid);
  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': planConfig.name,
      'line_items[0][price_data][unit_amount]': String((planConfig.amountUSD ?? 650) * 100),
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${appUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      'metadata[uid]': uid,
      'metadata[plan]': plan
    })
  });

  if (!stripeResponse.ok) throw error(502, 'Stripe error');
  const stripeData = await stripeResponse.json();

  return json({
    provider: 'stripe',
    checkout_url: stripeData.url,
    sessionId: stripeData.id,
    plan,
    amount: planConfig.amountUSD
  });
};

// ─── GET: verify payment ─────────────────────────────────────
export const GET: RequestHandler = async ({ url, platform }) => {
  const reference = url.searchParams.get('reference');
  const trxref    = url.searchParams.get('trxref');
  const provider  = url.searchParams.get('provider') ?? 'paystack';
  const ref       = reference ?? trxref;

  if (!ref) throw error(400, 'No payment reference provided');

  // ── Flutterwave verification ──────────────────────────────
  if (provider === 'flutterwave') {
    const flwKey = platform?.env?.FLUTTERWAVE_SECRET_KEY as string;
    if (!flwKey) {
      return json({ verified: true, reference: ref, provider: 'flutterwave', message: 'Mock payment verified' });
    }

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${ref}/verify`, {
      headers: { Authorization: `Bearer ${flwKey}` }
    });

    if (!response.ok) throw error(502, 'Verification failed');
    const data = await response.json();

    if (data.data?.status !== 'successful') {
      throw error(400, `Payment not successful: ${data.data?.status}`);
    }

    return json({
      verified: true,
      reference: ref,
      provider: 'flutterwave',
      amount: data.data.amount,
      currency: data.data.currency,
      paidAt: data.data.created_at
    });
  }

  // ── Paystack verification (default) ──────────────────────
  const paystackKey = platform?.env?.PAYSTACK_SECRET_KEY as string;

  if (!paystackKey) {
    return json({ verified: true, reference: ref, provider: 'paystack', message: 'Mock payment verified' });
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
    headers: { Authorization: `Bearer ${paystackKey}` }
  });

  if (!response.ok) throw error(502, 'Verification failed');
  const data = await response.json();

  if (data.data.status !== 'success') {
    throw error(400, `Payment not successful: ${data.data.status}`);
  }

  return json({
    verified: true,
    reference: ref,
    provider: 'paystack',
    amount: data.data.amount / 100,
    currency: data.data.currency,
    paidAt: data.data.paid_at
  });
};
