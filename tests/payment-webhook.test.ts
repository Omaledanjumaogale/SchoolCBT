import { describe, expect, it } from 'vitest'
import { normalizePaymentWebhook, verifyPaystackSignature } from '../src/lib/server/payment-webhook'

async function paystackSignature(body: string, secret: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

describe('payment webhook helpers', () => {
  it('verifies Paystack webhook signatures against the raw body', async () => {
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'SCB_123' } })
    const secret = 'sk_test_secret'
    const signature = await paystackSignature(body, secret)

    await expect(verifyPaystackSignature(body, signature, secret)).resolves.toBe(true)
    await expect(verifyPaystackSignature(body, 'bad-signature', secret)).resolves.toBe(false)
  })

  it('normalizes successful Paystack charge events', () => {
    const normalized = normalizePaymentWebhook('paystack', {
      event: 'charge.success',
      data: {
        reference: 'SCB_user_123',
        status: 'success',
        amount: 1000000,
        currency: 'NGN',
        metadata: { uid: 'user-1', plan: 'student-single' },
      },
    })

    expect(normalized).toEqual({
      provider: 'paystack',
      eventId: 'charge.success:SCB_user_123',
      reference: 'SCB_user_123',
      status: 'success',
      amount: 10000,
      currency: 'NGN',
      uid: 'user-1',
      plan: 'student-single',
    })
  })
})
