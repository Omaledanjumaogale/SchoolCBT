// src/routes/tutor/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Client-side guard handles auth check via onMount + goto
  return {};
};
