import type { PaymentProvider } from '$lib/validation'

export interface NormalizedPaymentEvent {
  provider: PaymentProvider
  eventId: string
  reference: string
  status: 'success' | 'failed' | 'pending'
  amount?: number
  currency?: string
  uid?: string
  plan?: string
}

async function hmacHex(algorithm: 'SHA-256' | 'SHA-512', secret: string, payload: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function verifyPaystackSignature(
  body: string,
  signature: string | null,
  secret: string,
) {
  if (!signature || !secret) return false
  const expected = await hmacHex('SHA-512', secret, body)
  return timingSafeEqual(expected, signature)
}

export async function verifyStripeSignature(
  body: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
) {
  if (!signatureHeader || !secret) return false
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(part => {
      const [key, value] = part.split('=')
      return [key, value]
    }),
  )
  const timestamp = Number(parts.t)
  if (!timestamp || !parts.v1) return false
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false

  const expected = await hmacHex('SHA-256', secret, `${timestamp}.${body}`)
  return timingSafeEqual(expected, parts.v1)
}

export function normalizePaymentWebhook(
  provider: PaymentProvider,
  payload: Record<string, any>,
): NormalizedPaymentEvent | null {
  if (provider === 'paystack') {
    const data = payload.data ?? {}
    const reference = data.reference
    if (!reference) return null
    return {
      provider,
      eventId: String(payload.event ?? 'paystack') + ':' + reference,
      reference,
      status:
        data.status === 'success' ? 'success' : data.status === 'failed' ? 'failed' : 'pending',
      amount: typeof data.amount === 'number' ? data.amount / 100 : undefined,
      currency: data.currency,
      uid: data.metadata?.uid,
      plan: data.metadata?.plan,
    }
  }

  if (provider === 'stripe') {
    const object = payload.data?.object ?? {}
    const reference = object.id
    if (!reference) return null
    return {
      provider,
      eventId: String(payload.id ?? reference),
      reference,
      status: object.payment_status === 'paid' ? 'success' : 'pending',
      amount: typeof object.amount_total === 'number' ? object.amount_total / 100 : undefined,
      currency: object.currency ? String(object.currency).toUpperCase() : undefined,
      uid: object.metadata?.uid,
      plan: object.metadata?.plan,
    }
  }

  if (provider === 'flutterwave') {
    const data = payload.data ?? payload
    const reference = data.tx_ref ?? data.reference
    if (!reference) return null
    return {
      provider,
      eventId: String(data.id ?? reference),
      reference,
      status:
        data.status === 'successful' ? 'success' : data.status === 'failed' ? 'failed' : 'pending',
      amount: data.amount,
      currency: data.currency,
      uid: data.meta?.uid,
      plan: data.meta?.plan,
    }
  }

  if (provider === 'korapay') {
    const data = payload.data ?? payload
    const reference = data.reference
    if (!reference) return null
    return {
      provider,
      eventId: String(data.id ?? reference),
      reference,
      status:
        data.status === 'success' ? 'success' : data.status === 'failed' ? 'failed' : 'pending',
      amount: data.amount,
      currency: data.currency,
      uid: data.metadata?.uid,
      plan: data.metadata?.plan,
    }
  }

  const data = payload.data ?? payload
  const reference = data.paymentReference ?? data.reference
  if (!reference) return null
  return {
    provider: 'seerbit',
    eventId: String(data.id ?? reference),
    reference,
    status: data.status === 'SUCCESS' || data.code === '00' ? 'success' : 'pending',
    amount: typeof data.amount === 'string' ? Number(data.amount) : data.amount,
    currency: data.currency,
    uid: data.metadata?.uid,
    plan: data.metadata?.plan,
  }
}
