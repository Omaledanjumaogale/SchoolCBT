import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import { env } from '$env/dynamic/private'
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
  type SessionRole,
} from '$lib/server/session'

const roles: SessionRole[] = ['student', 'tutor', 'admin']

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
  const secret = platform?.env?.SESSION_SECRET ?? 'dev-schoolcbt-session-secret'
  const body = (await request.json().catch(() => null)) as {
    uid?: string
    email?: string
    role?: SessionRole
    displayName?: string
    phone?: string
    targetExam?: string
  } | null

  if (!body?.uid || !body.email || !body.role || !roles.includes(body.role)) {
    throw error(400, 'Invalid session payload')
  }

  const convexUrl = platform?.env?.VITE_CONVEX_URL ?? env.VITE_CONVEX_URL
  if (convexUrl) {
    const client = new ConvexHttpClient(convexUrl)
    await client
      .mutation('users:sync' as unknown as FunctionReference<'mutation'>, {
        uid: body.uid,
        email: body.email,
        displayName: body.displayName ?? 'User',
        role: body.role,
        phone: body.phone || undefined,
        targetExam: body.targetExam || undefined,
      })
      .catch(err => {
        console.error('Convex user sync error:', err)
      })
  }

  const token = await createSessionToken(
    { uid: body.uid, email: body.email, role: body.role },
    secret,
  )
  setSessionCookie(cookies, token)
  return json({ ok: true })
}

export const DELETE: RequestHandler = async ({ cookies }) => {
  clearSessionCookie(cookies)
  return json({ ok: true })
}
