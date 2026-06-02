// src/hooks.server.ts
// SchoolCBT server hooks — security middleware
import type { Handle } from '@sveltejs/kit'
import { getSessionCookie, readSessionToken } from '$lib/server/session'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'X-DNS-Prefetch-Control': 'off',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

export const handle: Handle = async ({ event, resolve }) => {
  const secret = event.platform?.env?.SESSION_SECRET ?? 'dev-schoolcbt-session-secret'
  event.locals.user = (await readSessionToken(getSessionCookie(event.cookies), secret)) ?? undefined

  const response = await resolve(event)

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
}
