# SchoolCBT — Nigeria's Premier AI-Powered CBT Platform

> **Results as a Service** — Multi-agent AI prepares Nigerian students for JAMB, WAEC, NECO & NABTEB with personalized question batches, predictive pass analytics, tutor matching, and automated report cards.

[![SvelteKit 5](https://img.shields.io/badge/SvelteKit-5-FF3E00)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Tests-37%20passing-50C878)](https://vitest.dev)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 5 (Svelte 5 runes — `$state`, `$derived`, `$props`, `$bindable`) |
| Language | TypeScript 5.4 strict |
| Styling | Tailwind CSS 3.4 + glassmorphism design system (529-line `app.css`) |
| Auth | Firebase Auth (email/password, OTP, email verification, role-based) |
| Real-time DB | Convex (8 tables, typed schema, real-time subscriptions) |
| AI Engine | Gemini 1.5 Flash via `api/generate/+server.ts` |
| Payments | Paystack, Stripe, Flutterwave, KoraPay, Seerbit |
| Email | Resend (transactional: welcome, password reset, payment confirmation) |
| Validation | Zod (runtime type safety on all API endpoints) |
| Testing | Vitest (37 unit tests) + Playwright (E2E) |
| Deployment | Cloudflare Pages via `@sveltejs/adapter-cloudflare` |
| CI/CD | GitHub Actions (lint → build → deploy → Docker) |

---

## Quick Start

```bash
git clone https://github.com/Omaledanjumaogale/SchoolCBT.git
cd SchoolCBT
cp .env.example .env.local   # fill in your keys
npm install --legacy-peer-deps
npm run dev                   # http://localhost:5173
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build (Cloudflare adapter) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run 37 unit tests (Vitest) |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Auto-format all files |

---

## Project Structure (57 files, 9 routes)

```
schoolcbt/
├── src/
│   ├── app.html                   # HTML shell
│   ├── app.css                    # 529-line design system
│   ├── hooks.server.ts            # 7 security headers
│   ├── routes/
│   │   ├── +layout.svelte         # Shared layout (Nav, Footer, AuthModals, Toast)
│   │   ├── +page.svelte           # Landing (55 lines — composes 8 section components)
│   │   ├── about/+page.svelte     # Mission, story, tech stack
│   │   ├── pricing/+page.svelte   # Standalone pricing
│   │   ├── curriculum/+page.svelte # NERDC-aligned exam types
│   │   ├── practice/+page.svelte  # Full CBT practice engine
│   │   ├── dashboard/
│   │   │   ├── +page.svelte       # Student dashboard (Convex queries)
│   │   │   └── +page.server.ts    # Server-side guard stub
│   │   ├── tutor/
│   │   │   ├── +page.svelte       # Tutor dashboard + earnings
│   │   │   └── +page.server.ts    # Server-side guard stub
│   │   ├── reset-password/+page.svelte  # Firebase password reset
│   │   ├── pay/+server.ts         # 5 payment providers
│   │   └── api/generate/+server.ts # AI question generation
│   └── lib/
│       ├── firebase.ts            # Auth + Firestore helpers
│       ├── convex.ts              # Convex client (singleton, queries, mutations)
│       ├── email.ts               # Resend service + HTML templates
│       ├── seo.ts                 # OG meta, JSON-LD schemas
│       ├── validation.ts          # Zod schemas (PaymentRequest, GenerateQuestions)
│       ├── plans.ts               # Payment plan config
│       ├── auth/guard.ts          # requireAuth, requireRole utilities
│       ├── stores/index.ts        # Auth, CBT, Dashboard, UI stores
│       ├── utils/grading.ts       # WAEC A1-F9, star ratings
│       └── components/            # 19 reusable Svelte 5 components
│           ├── Nav.svelte         # Glass-nav, hamburger, auth-aware
│           ├── HeroSection.svelte # Hero with CBT panel slot
│           ├── CBTPanel.svelte    # Reusable CBT question panel
│           ├── CBTDemo.svelte     # Full interactive CBT demo
│           ├── FeaturesGrid.svelte # 9-feature grid
│           ├── HowItWorks.svelte  # Step-by-step + AI agents card
│           ├── PricingSection.svelte
│           ├── PricingCard.svelte
│           ├── FAQSection.svelte  # Accordion FAQ
│           ├── CTABanner.svelte
│           ├── SiteFooter.svelte
│           ├── AuthModals.svelte  # Signup/Login with Firebase
│           ├── Badge.svelte
│           ├── ProgressBar.svelte
│           ├── TimerRing.svelte   # SVG countdown
│           ├── StatCard.svelte
│           ├── FeatureCard.svelte
│           ├── Modal.svelte
│           ├── Toast.svelte
│           ├── ErrorBoundary.svelte
│           ├── LoadingSpinner.svelte
│           └── EmptyState.svelte
├── convex/                        # Convex backend (6 query files + schema)
│   ├── schema.ts                  # 8 tables with typed indexes
│   ├── users.ts, questions.ts, sessions.ts
│   ├── analytics.ts, tutors.ts, payments.ts
│   └── _generated/                # Type stubs
├── tests/                         # 37 unit tests (Vitest)
│   ├── validation.test.ts         # 17 tests
│   ├── grading.test.ts            # 14 tests
│   └── plans.test.ts              # 6 tests
├── static/
│   ├── favicon.svg, og-image.svg
│   ├── icon-192.svg, icon-512.svg, apple-touch-icon.svg
│   ├── sitemap.xml, robots.txt
│   ├── manifest.json, service-worker.js, offline.html
├── Dockerfile, .dockerignore
├── .github/workflows/deploy.yml   # CI/CD pipeline
├── vitest.config.ts, playwright.config.ts
└── package.json
```

---

## Environment Variables

```env
# Firebase Auth
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Convex (real-time backend)
VITE_CONVEX_URL=

# AI Generation
GEMINI_API_KEY=

# Payments
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=
KORAPAY_SECRET_KEY=
SEERBIT_SECRET_KEY=
SEERBIT_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Email (Resend)
VITE_RESEND_API_KEY=

# App
PUBLIC_APP_URL=https://schoolcbt.ewinproject.org
```

---

## API Reference

### `POST /api/generate` — Generate AI Questions

Body (validated by Zod):
```json
{
  "subject": "Physics",
  "examType": "WAEC",
  "count": 5,
  "topics": ["Mechanics"],
  "difficulty": "Medium"
}
```

Response: `{ questions: Question[], source: "gemini"|"static-fallback" }`

### `POST /pay` — Initiate Payment

Body (validated by Zod):
```json
{
  "plan": "student-single",
  "uid": "abc123",
  "email": "user@example.com",
  "currency": "NGN",
  "provider": "flutterwave"
}
```
Supports: `paystack`, `stripe`, `flutterwave`, `korapay`, `seerbit`

### `GET /pay?reference=REF&provider=paystack` — Verify Payment

---

## Testing

```bash
npm run test           # 37 tests, 3 files, 100% pass
npm run test:coverage  # With v8 coverage
npm run test:e2e       # Playwright (Chromium, Firefox, mobile)
```

**Coverage:** Zod validation (17 tests), WAEC grading (14 tests), payment plans (6 tests)

---

## Convex Backend Schema

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | Student/tutor profiles | `by_uid`, `by_role`, `by_email` |
| `questions` | AI-generated question bank | `by_subject`, `by_exam`, `by_topic` |
| `sessions` | CBT practice sessions | `by_uid`, `by_uid_subject` |
| `analytics` | Aggregated performance stats | `by_uid` |
| `tutors` | Tutor profiles + earnings | `by_uid`, `by_subject` |
| `earnings` | Tutor payment records | `by_tutor`, `by_status` |
| `payments` | Payment transactions | `by_uid`, `by_reference` |
| `approvals` | Admin verification queue | `by_uid`, `by_status` |

---

## Design System (Tailwind + Custom CSS)

**Colors:** `cobalt` (#002366), `jade` (#50C878), `gold` (#FFD700), `scarlet` (#DC3545)
**Glassmorphism:** `.glass`, `.glass-card`, `.glass-deep`, `.glass-nav`
**Buttons:** `.btn-primary`, `.btn-gold`, `.btn-outline`, `.btn-ghost`
**Cards:** `.feature-card`, `.stat-card`, `.pricing-card`, `.wallet-card`
**Typography:** Sora (headings), DM Sans (body), JetBrains Mono (code/scores)

---

## Docker

```bash
docker build -t schoolcbt .
docker run -p 4173:4173 schoolcbt
```
Multi-stage build (node:20-alpine), non-root user, port 4173.

---

## Deployment

**Cloudflare Pages** (configured via `wrangler.toml`):
```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name schoolcbt
```

Or push to `master` — GitHub Actions CI/CD handles lint → build → deploy automatically.

---

## Made in Nigeria 🇳🇬

Built with ❤️ in Lagos, Nigeria.

> *"Every Nigerian student deserves guaranteed exam results — not just access to past questions."*

**Website:** https://schoolcbt.ewinproject.org
