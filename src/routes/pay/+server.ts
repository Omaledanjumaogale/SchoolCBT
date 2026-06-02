// src/routes/pay/+server.ts
// SchoolCBT Payment Processing — Paystack + Stripe + Flutterwave + KoraPay + Seerbit
import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { PLANS } from '$lib/plans'
import { PaymentRequestSchema } from '$lib/validation'
import { env } from '$env/dynamic/private'

// ─── HELPERS ────────────────────────────────────────────────
function generateRef(prefix: string, uid: string): string {
  return `${prefix}_${uid}_${Date.now()}`
}

function requireSecret(value: string | undefined, provider: string): string {
  if (!value) throw error(503, `${provider} is not configured for live payments`)
  return value
}

function amountFor(
  planConfig: (typeof PLANS)[keyof typeof PLANS],
  currency: 'NGN' | 'USD',
): number {
  const amount = currency === 'NGN' ? planConfig.amountNGN : planConfig.amountUSD
  if (!amount) throw error(400, 'This plan requires a school sales quote')
  return amount
}

// Payment recording is handled client-side via Convex mutations post-verification.
// Server-side payment initiation returns authorization URLs for redirect-based flows.

// ─── POST: initiate payment ──────────────────────────────────
export const POST: RequestHandler = async ({ request, platform }) => {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    throw error(400, 'Invalid request body')
  }

  const parsed = PaymentRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw error(400, parsed.error.issues.map(i => i.message).join(', '))
  }

  const { plan, uid, email, currency = 'NGN' } = parsed.data
  const planConfig = PLANS[plan]
  const provider = parsed.data.provider ?? (currency === 'NGN' ? 'paystack' : 'stripe')
  const appUrl = platform?.env?.PUBLIC_APP_URL ?? env.PUBLIC_APP_URL ?? 'http://localhost:5173'

  // ── Flutterwave (NGN + multi-currency) ────────────────────
  if (provider === 'flutterwave') {
    const flwKey = requireSecret(
      platform?.env?.FLUTTERWAVE_SECRET_KEY ?? env.FLUTTERWAVE_SECRET_KEY,
      'Flutterwave',
    )

    const ref = generateRef('FLW', uid)
    const amount = amountFor(planConfig, 'NGN')
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flwKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: ref,
        amount,
        currency: 'NGN',
        redirect_url: `${appUrl}/pay/verify?provider=flutterwave`,
        payment_options: 'card,banktransfer,ussd',
        customer: { email, name: uid },
        customizations: {
          title: 'SchoolCBT Subscription',
          description: planConfig.name,
          logo: `${appUrl}/favicon.svg`,
        },
        meta: { uid, plan },
      }),
    })

    if (!response.ok) throw error(502, 'Flutterwave payment error')
    const data = await response.json()

    if (data.status !== 'success') throw error(400, data.message ?? 'Payment initiation failed')

    return json({
      provider: 'flutterwave',
      authorization_url: data.data.link,
      reference: ref,
      plan,
      amount,
    })
  }

  // ── KoraPay (NGN) ─────────────────────────────────────────
  if (provider === 'korapay') {
    const koraKey = requireSecret(
      platform?.env?.KORAPAY_SECRET_KEY ?? env.KORAPAY_SECRET_KEY,
      'KoraPay',
    )

    const ref = generateRef('KPAY', uid)
    const amount = amountFor(planConfig, 'NGN')
    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${koraKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: ref,
        amount,
        currency: 'NGN',
        customer: { email, name: uid },
        redirect_url: `${appUrl}/pay/verify?provider=korapay`,
        metadata: { uid, plan },
      }),
    })

    if (!response.ok) throw error(502, 'KoraPay payment error')
    const data = await response.json()

    return json({
      provider: 'korapay',
      authorization_url: data.data.checkout_url,
      reference: ref,
      plan,
      amount,
    })
  }

  // ── Seerbit (NGN) ─────────────────────────────────────────
  if (provider === 'seerbit') {
    const seerbitKey = requireSecret(
      platform?.env?.SEERBIT_SECRET_KEY ?? env.SEERBIT_SECRET_KEY,
      'Seerbit',
    )

    const ref = generateRef('SEER', uid)
    const amount = amountFor(planConfig, 'NGN')
    const response = await fetch('https://seerbitapi.com/api/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${seerbitKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: platform?.env?.SEERBIT_PUBLIC_KEY ?? env.SEERBIT_PUBLIC_KEY ?? '',
        amount: amount.toString(),
        currency: 'NGN',
        country: 'NG',
        paymentReference: ref,
        email,
        productId: plan,
        productDescription: planConfig.name,
        callbackUrl: `${appUrl}/pay/verify?provider=seerbit`,
        metadata: { uid, plan },
      }),
    })

    if (!response.ok) throw error(502, 'Seerbit payment error')
    const data = await response.json()

    return json({
      provider: 'seerbit',
      authorization_url: data.data.payments.redirectLink,
      reference: ref,
      plan,
      amount,
    })
  }

  // ── Paystack (NGN — default) ─────────────────────────────
  if (provider === 'paystack' || currency === 'NGN') {
    const paystackKey = requireSecret(
      platform?.env?.PAYSTACK_SECRET_KEY ?? env.PAYSTACK_SECRET_KEY,
      'Paystack',
    )

    const ref = generateRef('SCB', uid)
    const amount = amountFor(planConfig, 'NGN')
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // kobo
        currency: 'NGN',
        reference: ref,
        metadata: { plan, uid },
        callback_url: `${appUrl}/pay/verify?provider=paystack`,
      }),
    })

    if (!response.ok) throw error(502, 'Paystack payment error')
    const data = await response.json()

    return json({
      provider: 'paystack',
      authorization_url: data.data.authorization_url,
      reference: ref,
      plan,
      amount,
    })
  }

  // ── Stripe (USD) ─────────────────────────────────────────
  const stripeKey = requireSecret(
    platform?.env?.STRIPE_SECRET_KEY ?? env.STRIPE_SECRET_KEY,
    'Stripe',
  )

  const ref = generateRef('STR', uid)
  const amount = amountFor(planConfig, 'USD')
  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': planConfig.name,
      'line_items[0][price_data][unit_amount]': String(amount * 100),
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${appUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      'metadata[uid]': uid,
      'metadata[plan]': plan,
    }),
  })

  if (!stripeResponse.ok) throw error(502, 'Stripe error')
  const stripeData = await stripeResponse.json()

  return json({
    provider: 'stripe',
    checkout_url: stripeData.url,
    sessionId: stripeData.id,
    plan,
    amount,
  })
}

// ─── GET: verify payment ─────────────────────────────────────
export const GET: RequestHandler = async ({ url, platform }) => {
  const reference = url.searchParams.get('reference')
  const trxref = url.searchParams.get('trxref')
  const provider = url.searchParams.get('provider') ?? 'paystack'
  const ref = reference ?? trxref

  if (!ref) throw error(400, 'No payment reference provided')

  // ── Flutterwave verification ──────────────────────────────
  if (provider === 'flutterwave') {
    const flwKey = requireSecret(
      platform?.env?.FLUTTERWAVE_SECRET_KEY ?? env.FLUTTERWAVE_SECRET_KEY,
      'Flutterwave',
    )

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${ref}/verify`, {
      headers: { Authorization: `Bearer ${flwKey}` },
    })

    if (!response.ok) throw error(502, 'Verification failed')
    const data = await response.json()

    if (data.data?.status !== 'successful') {
      throw error(400, `Payment not successful: ${data.data?.status}`)
    }

    return json({
      verified: true,
      reference: ref,
      provider: 'flutterwave',
      amount: data.data.amount,
      currency: data.data.currency,
      paidAt: data.data.created_at,
    })
  }

  if (provider === 'stripe') {
    const stripeKey = requireSecret(
      platform?.env?.STRIPE_SECRET_KEY ?? env.STRIPE_SECRET_KEY,
      'Stripe',
    )
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${ref}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    })

    if (!response.ok) throw error(502, 'Stripe verification failed')
    const data = await response.json()
    if (data.payment_status !== 'paid')
      throw error(400, `Payment not successful: ${data.payment_status}`)

    return json({
      verified: true,
      reference: ref,
      provider: 'stripe',
      amount: data.amount_total / 100,
      currency: String(data.currency ?? 'usd').toUpperCase(),
      paidAt: data.created ? new Date(data.created * 1000).toISOString() : undefined,
    })
  }

  if (provider === 'korapay') {
    const koraKey = requireSecret(
      platform?.env?.KORAPAY_SECRET_KEY ?? env.KORAPAY_SECRET_KEY,
      'KoraPay',
    )
    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${ref}`, {
      headers: { Authorization: `Bearer ${koraKey}` },
    })

    if (!response.ok) throw error(502, 'KoraPay verification failed')
    const data = await response.json()
    if (data.data?.status !== 'success')
      throw error(400, `Payment not successful: ${data.data?.status}`)

    return json({
      verified: true,
      reference: ref,
      provider: 'korapay',
      amount: data.data.amount,
      currency: data.data.currency,
      paidAt: data.data.paid_at,
    })
  }

  if (provider === 'seerbit') {
    const seerbitKey = requireSecret(
      platform?.env?.SEERBIT_SECRET_KEY ?? env.SEERBIT_SECRET_KEY,
      'Seerbit',
    )
    const response = await fetch(`https://seerbitapi.com/api/v2/payments/query/${ref}`, {
      headers: { Authorization: `Bearer ${seerbitKey}` },
    })

    if (!response.ok) throw error(502, 'Seerbit verification failed')
    const data = await response.json()
    if (data.data?.code !== '00' && data.data?.status !== 'SUCCESS') {
      throw error(400, `Payment not successful: ${data.data?.status ?? data.data?.code}`)
    }

    return json({
      verified: true,
      reference: ref,
      provider: 'seerbit',
      amount: Number(data.data.amount ?? 0),
      currency: data.data.currency,
      paidAt: data.data.paymentDate,
    })
  }

  // ── Paystack verification (default) ──────────────────────
  const paystackKey = requireSecret(
    platform?.env?.PAYSTACK_SECRET_KEY ?? env.PAYSTACK_SECRET_KEY,
    'Paystack',
  )

  const response = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
    headers: { Authorization: `Bearer ${paystackKey}` },
  })

  if (!response.ok) throw error(502, 'Verification failed')
  const data = await response.json()

  if (data.data.status !== 'success') {
    throw error(400, `Payment not successful: ${data.data.status}`)
  }

  return json({
    verified: true,
    reference: ref,
    provider: 'paystack',
    amount: data.data.amount / 100,
    currency: data.data.currency,
    paidAt: data.data.paid_at,
  })
}
