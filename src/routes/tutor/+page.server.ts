// src/routes/tutor/+page.server.ts
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/')
  if (locals.user.role === 'student') throw redirect(303, '/dashboard')
  return { user: locals.user }
}
