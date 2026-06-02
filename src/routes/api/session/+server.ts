import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
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
  } | null

  if (!body?.uid || !body.email || !body.role || !roles.includes(body.role)) {
    throw error(400, 'Invalid session payload')
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
