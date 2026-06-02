// src/app.d.ts
// SchoolCBT — TypeScript declarations for SvelteKit + Cloudflare bindings
import type {
  KVNamespace,
  D1Database,
  R2Bucket,
  DurableObjectNamespace,
  ExecutionContext,
} from '@cloudflare/workers-types'

declare global {
  namespace App {
    interface Error {
      message: string
      code?: string
      status?: number
    }

    interface Locals {
      user?: {
        uid: string
        email: string
        role: 'student' | 'tutor' | 'admin'
      }
    }

    interface PageData {
      user?: {
        uid: string
        email: string
        role: 'student' | 'tutor' | 'admin'
      }
    }

    interface PageState {}

    interface Platform {
      env: {
        PUBLIC_APP_NAME: string
        PUBLIC_APP_URL: string
        PAYSTACK_SECRET_KEY: string
        STRIPE_SECRET_KEY: string
        STRIPE_WEBHOOK_SECRET: string
        FLUTTERWAVE_SECRET_KEY: string
        KORAPAY_SECRET_KEY: string
        SEERBIT_SECRET_KEY: string
        SEERBIT_PUBLIC_KEY: string
        GEMINI_API_KEY: string
        RESEND_API_KEY: string
        PAYMENT_WEBHOOK_SECRET: string
        VITE_CONVEX_URL: string
        SESSION_SECRET: string
        RATE_LIMIT_KV?: KVNamespace
        // Uncomment when KV/D1/R2 bindings are added to wrangler.toml:
        // SESSIONS: KVNamespace;
        // DB: D1Database;
        // UPLOADS: R2Bucket;
      }
      cf: Record<string, unknown>
      ctx: ExecutionContext
    }
  }
}

export {}
