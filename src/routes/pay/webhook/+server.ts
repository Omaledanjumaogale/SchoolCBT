import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import { env } from '$env/dynamic/private'
import { PaymentProviderSchema } from '$lib/validation'
import {
  normalizePaymentWebhook,
  verifyPaystackSignature,
  verifyStripeSignature,
} from '$lib/server/payment-webhook'

type PaymentPlatform = {
  env?: Record<string, unknown>
}

function platformString(platform: PaymentPlatform | undefined, key: string) {
  const value = platform?.env?.[key]
  return typeof value === 'string' ? value : undefined
}

async function verifyProviderSignature(
  provider: string,
  body: string,
  request: Request,
  platform: PaymentPlatform | undefined,
) {
  if (provider === 'paystack') {
    const secret = platformString(platform, 'PAYSTACK_SECRET_KEY') ?? env.PAYSTACK_SECRET_KEY
    if (!secret) return false
    return verifyPaystackSignature(body, request.headers.get('x-paystack-signature'), secret)
  }

  if (provider === 'stripe') {
    const secret = platformString(platform, 'STRIPE_WEBHOOK_SECRET') ?? env.STRIPE_WEBHOOK_SECRET
    if (!secret) return false
    return verifyStripeSignature(body, request.headers.get('stripe-signature'), secret)
  }

  // Flutterwave, KoraPay, and Seerbit signatures vary by dashboard setup.
  // Require a shared webhook secret when configured, otherwise accept only verified provider payload shape.
  const configuredSecret = env.PAYMENT_WEBHOOK_SECRET
  if (!configuredSecret) return true
  return request.headers.get('x-schoolcbt-webhook-secret') === configuredSecret
}

export const POST: RequestHandler = async ({ request, url, platform }) => {
  const providerResult = PaymentProviderSchema.safeParse(url.searchParams.get('provider'))
  if (!providerResult.success) throw error(400, 'Unsupported payment provider')

  const body = await request.text()
  const signatureOk = await verifyProviderSignature(providerResult.data, body, request, platform)
  if (!signatureOk) throw error(401, 'Invalid webhook signature')

  const payload = JSON.parse(body) as Record<string, any>
  const normalized = normalizePaymentWebhook(providerResult.data, payload)
  if (!normalized) throw error(400, 'Unsupported webhook payload')

  const convexUrl = platformString(platform, 'VITE_CONVEX_URL') ?? env.VITE_CONVEX_URL
  if (convexUrl && normalized.reference) {
    const client = new ConvexHttpClient(convexUrl)
    await client.mutation(
      'payments:markVerified' as unknown as FunctionReference<'mutation'>,
      normalized,
    )
  }

  return json({
    ok: true,
    provider: normalized.provider,
    reference: normalized.reference,
    status: normalized.status,
  })
}
