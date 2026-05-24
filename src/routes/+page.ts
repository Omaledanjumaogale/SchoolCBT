// src/routes/+page.ts
// Homepage load — runs on Cloudflare Workers edge
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
  return {
    ...data
  };
};
