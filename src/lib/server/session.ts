import type { Cookies } from '@sveltejs/kit'

export type SessionRole = 'student' | 'tutor' | 'admin'

export interface SessionUser {
  uid: string
  email: string
  role: SessionRole
}

const SESSION_COOKIE = 'schoolcbt_session'
const encoder = new TextEncoder()

function toBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromBase64Url(value: string): string {
  const padded =
    value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return toBase64Url(new Uint8Array(signature))
}

export async function createSessionToken(user: SessionUser, secret: string): Promise<string> {
  const payload = toBase64Url(JSON.stringify(user))
  const signature = await sign(payload, secret)
  return `${payload}.${signature}`
}

export async function readSessionToken(
  token: string | undefined,
  secret: string,
): Promise<SessionUser | null> {
  if (!token || !secret || !token.includes('.')) return null
  const [payload, signature] = token.split('.')
  const expected = await sign(payload, secret)
  if (signature !== expected) return null

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as SessionUser
    if (!parsed.uid || !parsed.email || !['student', 'tutor', 'admin'].includes(parsed.role))
      return null
    return parsed
  } catch {
    return null
  }
}

export function setSessionCookie(cookies: Cookies, token: string) {
  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 14,
  })
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' })
}

export function getSessionCookie(cookies: Cookies): string | undefined {
  return cookies.get(SESSION_COOKIE)
}
