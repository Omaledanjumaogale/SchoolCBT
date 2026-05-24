// src/routes/+layout.ts
// Controls SSR/CSR behavior for Cloudflare Pages edge runtime

// Cloudflare Pages supports SSR via Workers — keep defaults
// export const ssr = true;     // Default — render on CF Workers edge
// export const csr = true;     // Default — hydrate client-side

// Do NOT set prerender = true globally — landing page is dynamic
export const prerender = false;
