# SchoolCBT — Nigeria's Premier AI-Powered CBT Platform

> **Results as a Service** — Multi-agent AI prepares Nigerian students for JAMB, WAEC, NECO & NABTEB with personalized question batches, predictive pass analytics, tutor matching, and automated report cards.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit%205-FF3E00)](https://kit.svelte.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS%203-38BDF8)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6)](https://typescriptlang.org)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Features](#-features)
- [API Reference](#-api-reference)
- [Deployment](#-deployment-to-cloudflare-pages)
- [Design System](#-design-system)
- [AI Architecture](#-ai-architecture)
- [Contributing](#-contributing)

---

## 🚀 Overview

SchoolCBT is an enterprise-grade CBT (Computer-Based Testing) platform purpose-built for Nigerian secondary school and tertiary students. It combines:

- **Multi-Agent AI Engine** (Google Vertex AI + Gemini 1.5 Pro) to generate curriculum-accurate question batches
- **Results as a Service (RaaS)** — predictive pass probability, WAEC-style grading, Bloom's Taxonomy tagging
- **Verified Tutor Marketplace** — AI-powered matching, integrated earnings wallet
- **Cloudflare Edge Deployment** — sub-100ms response globally

**Supported Examinations:**
| Exam | Full Name | Coverage |
|------|-----------|----------|
| JAMB | Joint Admissions and Matriculation Board UTME | Full UTME syllabus |
| WAEC | West African Examinations Council SSCE | All core & elective subjects |
| NECO | National Examinations Council | Full NECO syllabus |
| NABTEB | National Business & Technical Examinations Board | Technical subjects |
| POST-UTME | Post-UTME Screening | University-specific |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | SvelteKit 5 (Svelte 5 runes) |
| **Language** | TypeScript 5.4 |
| **Styling** | Tailwind CSS 3.4 + custom design system |
| **Auth** | Firebase Authentication (Email, OTP, NIN verification) |
| **Database** | Firebase Firestore |
| **AI Engine** | Google Vertex AI / Gemini 1.5 Pro |
| **Payments** | Paystack (NGN) + Stripe (USD) |
| **Deployment** | Cloudflare Pages + Workers |
| **CDN** | Cloudflare global edge network |

---

## 📁 Project Structure

```
schoolcbt/
├── src/
│   ├── app.css                    # Global design system styles
│   ├── app.html                   # HTML shell
│   ├── routes/
│   │   ├── +layout.svelte         # Root layout (SEO, fonts, structured data)
│   │   ├── +page.svelte           # Landing page (all sections)
│   │   ├── dashboard/
│   │   │   └── +page.svelte       # Student dashboard
│   │   ├── practice/
│   │   │   └── +page.svelte       # CBT practice engine
│   │   ├── tutor/
│   │   │   └── +page.svelte       # Tutor dashboard
│   │   ├── pay/
│   │   │   └── +server.ts         # Payment API (Paystack + Stripe)
│   │   └── api/
│   │       └── generate/
│   │           └── +server.ts     # AI question generation API
│   └── lib/
│       ├── firebase.ts            # Firebase config + helpers
│       ├── stores/
│       │   └── index.ts           # Svelte stores (auth, CBT, UI)
│       ├── components/
│       │   ├── Nav.svelte          # Navigation component
│       │   ├── CBTPanel.svelte     # Reusable CBT question panel
│       │   ├── TimerRing.svelte    # Animated SVG timer
│       │   ├── ProgressBar.svelte  # Progress bar component
│       │   ├── Badge.svelte        # Badge/chip component
│       │   ├── Modal.svelte        # Modal wrapper
│       │   ├── Toast.svelte        # Toast notification
│       │   ├── StatCard.svelte     # Dashboard stat card
│       │   ├── FeatureCard.svelte  # Feature grid card
│       │   └── PricingCard.svelte  # Pricing tier card
│       └── utils/
│           ├── grading.ts          # WAEC grading utilities
│           ├── bloom.ts            # Bloom's Taxonomy helpers
│           └── analytics.ts        # Pass probability calculator
├── static/
│   ├── favicon.svg
│   ├── og-image.png               # Open Graph image (1200×630)
│   └── robots.txt
├── tailwind.config.ts
├── svelte.config.js
├── vite.config.ts
├── wrangler.toml                  # Cloudflare Pages config
├── tsconfig.json
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- A Firebase project
- (Optional) Gemini API key for AI generation
- (Optional) Paystack / Stripe keys for payments

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/schoolcbt.git
cd schoolcbt

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your environment variables (see below)
nano .env.local

# 5. Start the development server
npm run dev

# 6. Open http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Firebase ──────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ── AI (Gemini / Vertex AI) ────────────────────────────────────
# Used server-side only — never exposed to client
GEMINI_API_KEY=your_gemini_api_key

# ── Payments ──────────────────────────────────────────────────
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# ── App ───────────────────────────────────────────────────────
PUBLIC_APP_URL=https://schoolcbt.com.ng
PUBLIC_APP_NAME=SchoolCBT
```

For Cloudflare Pages, add these as **Environment Variables** in the Pages dashboard or via `wrangler secret put`.

---

## ✨ Features

### Student Features
- ✅ **AI CBT Engine** — 50-question batches with 50s countdown timer
- ✅ **Instant Feedback** — ✅/❌ per question with explanation
- ✅ **WAEC Grading** — A1 through F9 after every batch
- ✅ **Bloom's Taxonomy** — Knowledge, Comprehension, Application, Analysis tagging
- ✅ **Predictive Analytics** — Pass probability per subject
- ✅ **AI Study Plans** — Generated from uploaded academic reports
- ✅ **Report Vault** — Full history of all batch reports
- ✅ **Awards System** — Gold/Silver badges, streak tracking, national ranking
- ✅ **Tutor Booking** — Book AI-matched verified tutors
- ✅ **Mobile-First** — Full CBT on any smartphone

### Tutor Features
- ✅ **Earnings Dashboard** — Per-subject, per-hour, per-student tracking
- ✅ **Student Monitor** — Real-time performance view of assigned students
- ✅ **Wallet** — Withdrawal to Nigerian bank accounts
- ✅ **Verification** — NIN + admin approval workflow

### Platform Features
- ✅ **5 AI Agents** — Coordinator, Intake, Researcher, Composer, Evaluator
- ✅ **90%+ Grounding Accuracy** — Against NERDC Nigerian curriculum
- ✅ **Rate Limiting** — Server-side and Cloudflare edge protection
- ✅ **Model Armor** — I/O sanitization for AI safety
- ✅ **OTP Auth** — Phone verification via Firebase
- ✅ **SEO + AEO + GEO** — Structured data, LLM-discoverable content

---

## 🔌 API Reference

### `POST /api/generate` — Generate Questions

```typescript
// Request
{
  subject:    string;       // "Physics" | "Mathematics" | "English" | ...
  examType:   string;       // "JAMB" | "WAEC" | "NECO" | "NABTEB"
  topics?:    string[];     // Optional topic filter
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  count?:     number;       // 1–50 (default: 5)
  uid?:       string;       // Firebase UID (for personalization)
}

// Response
{
  questions: Question[];
  source:    "gemini" | "static-fallback";
  subject:   string;
  examType:  string;
}

// Question shape
interface Question {
  id:         string;
  q:          string;          // Question text
  opts:       string[];        // 4 answer options
  correct:    number;          // Index of correct answer (0-3)
  bloom:      string;          // Bloom's level
  exp:        string;          // Explanation
  subject:    string;
  topic:      string;
  examType:   string;
  difficulty: "Easy" | "Medium" | "Hard";
}
```

### `POST /pay` — Initiate Payment

```typescript
// Request
{
  plan:     "student-single" | "student-premium" | "school";
  uid:      string;           // Firebase UID
  email:    string;
  currency?: "NGN" | "USD";  // Default: NGN
}

// Response (Paystack)
{
  provider:          "paystack";
  authorization_url: string;    // Redirect user here
  reference:         string;
  plan:              string;
  amount:            number;    // In Naira
}
```

---

## 🚀 Deployment to Cloudflare Pages

### Option 1: CLI Deployment

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Pages
wrangler pages deploy .svelte-kit/cloudflare --project-name schoolcbt
```

### Option 2: Git Integration (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
3. Create a new project → Connect to Git
4. Select your repository
5. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `.svelte-kit/cloudflare`
   - **Node version:** `20`
6. Add environment variables from `.env.local`
7. Deploy!

### Custom Domain Setup

```bash
# Add your domain
wrangler pages domain add schoolcbt.com.ng --project-name schoolcbt
```

---

## 🎨 Design System

### Color Palette
```css
--cobalt:      #002366;  /* Deep royal blue — primary brand */
--cobalt-l:    #003399;  /* Lighter cobalt — hover states */
--jade:        #50C878;  /* Nigerian jade green — success/positive */
--gold:        #FFD700;  /* Bright gold — CTAs and highlights */
--scarlet:     #DC3545;  /* Alert red — errors and warnings */
--bg-base:     #04091a;  /* Dark navy base background */
```

### Typography
- **Headings:** Sora (Google Fonts) — extrabold, tight tracking
- **Body:** DM Sans — clean, readable, modern
- **Code/Mono:** JetBrains Mono — timer, scores, labels

### Glass Morphism Levels
```css
.glass       /* Navigation, overlays */
.glass-card  /* Content cards */
.glass-deep  /* Modals, dialogs */
```

---

## 🤖 AI Architecture

```
Student Request
      │
      ▼
┌─────────────────────────────────────┐
│         Coordinator Agent            │
│  Orchestrates all agent interactions  │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
┌────────┐ ┌──────────┐ ┌─────────────┐
│ Intake │ │Researcher│ │  Composer   │
│ Agent  │ │  Agent   │ │   Agent     │
│        │ │  (RAG)   │ │  (COSTAR)   │
└────────┘ └──────────┘ └──────┬──────┘
                                │
                                ▼
                    ┌───────────────────┐
                    │  Quality Evaluator │
                    │  (90%+ grounding)  │
                    └──────────┬────────┘
                               │
                               ▼
                    50 Validated Questions
```

**Technology:**
- Google Vertex AI Agent Builder (orchestration runtime)
- Gemini 1.5 Pro (question generation, evaluation)
- Nigerian curriculum RAG system (grounding)
- COSTAR prompt methodology (structured generation)
- Model Armor (I/O sanitization)

---

## 📊 SEO / AEO / GEO Optimization

SchoolCBT is optimized for:

- **Traditional SEO** — Semantic HTML, structured data (Schema.org), sitemap
- **AEO (Answer Engine Optimization)** — FAQ schema, concise authoritative answers
- **GEO (Generative Engine Optimization)** — LLM-parseable entity-rich content, JSON-LD

Key structured data types implemented:
- `Organization`
- `SoftwareApplication`
- `FAQPage`
- `Course`
- `EducationalOccupationalProgram`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please read `CONTRIBUTING.md` for code style guidelines.

---

## 📄 License

MIT License — see `LICENSE` file for details.

---

## 🇳🇬 Made in Nigeria

Built with ❤️ in Lagos, Nigeria by the SchoolCBT team.

> *"Every Nigerian student deserves guaranteed exam results — not just access to past questions."*

**Contact:** hello@schoolcbt.com.ng | **Twitter:** @SchoolCBT | **WhatsApp:** +234 XXX XXX XXXX
