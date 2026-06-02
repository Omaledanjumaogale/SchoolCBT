// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/')
  if (locals.user.role === 'tutor') throw redirect(303, '/tutor')
  return { user: locals.user }
}
