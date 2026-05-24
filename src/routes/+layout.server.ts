// src/routes/+layout.server.ts
// Server-side layout load — runs on Cloudflare Workers edge
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform, locals }) => {
  return {
    // Pass Cloudflare env to all pages
    env: {
      appName: platform?.env?.PUBLIC_APP_NAME ?? 'SchoolCBT',
      appUrl: platform?.env?.PUBLIC_APP_URL ?? 'https://schoolcbt.ewinproject.org'
    }
  };
};
