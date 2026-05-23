// src/routes/dashboard/+page.server.ts
// Server-side auth guard — redirects unauthenticated users away from dashboard
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // For now, client-side guard handles this via onMount + goto
  // When we have server-side session cookies, add the real check here
  return {};
};
