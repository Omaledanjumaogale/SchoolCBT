// src/lib/email.ts
// Resend email service for SchoolCBT
// Docs: https://resend.com/docs/send-with-sveltekit
import { env } from '$env/dynamic/private'

const RESEND_API_URL = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'SchoolCBT <noreply@schoolcbt.ewinproject.org>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured — skipping email send')
    return false
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
        text: text ?? html.replace(/<[^>]*>/g, ''),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Email] Resend API error:', err)
      return false
    }

    return true
  } catch (e) {
    console.error('[Email] Failed to send:', e)
    return false
  }
}

// ─── TEMPLATE HELPERS ──────────────────────────────────────

export function welcomeEmail(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#04091a;color:#dde4f5;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#FFD700;font-size:24px;margin:0">Welcome to SchoolCBT, ${name}!</h1>
        <p style="color:#8892a4;font-size:14px">Nigeria's Premier AI-Powered CBT Platform</p>
      </div>
      <p style="font-size:14px;line-height:1.6">Your account has been created and your email is being verified. Here's what to do next:</p>
      <div style="background:rgba(0,51,153,0.3);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px"><strong>1.</strong> Verify your email address</p>
        <p style="margin:0 0 8px"><strong>2.</strong> Complete your student/tutor profile</p>
        <p style="margin:0"><strong>3.</strong> Start your first CBT practice session</p>
      </div>
      <a href="https://schoolcbt.ewinproject.org/dashboard" style="display:inline-block;background:linear-gradient(135deg,#FFD700,#CCA900);color:#002366;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">Go to Dashboard →</a>
      <p style="font-size:12px;color:#445566;margin-top:24px">© 2025 SchoolCBT Technologies Ltd. Lagos, Nigeria.</p>
    </div>`
}

export function passwordResetEmail(name: string, resetLink: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#04091a;color:#dde4f5;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#FFD700;font-size:24px;margin:0">Password Reset</h1>
        <p style="color:#8892a4;font-size:14px">SchoolCBT Account Recovery</p>
      </div>
      <p style="font-size:14px;line-height:1.6">Hi ${name}, we received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#FFD700,#CCA900);color:#002366;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">Reset Password →</a>
      </div>
      <p style="font-size:12px;color:#445566">If you didn't request this, you can ignore this email. The link expires in 1 hour.</p>
      <p style="font-size:12px;color:#445566;margin-top:24px">© 2025 SchoolCBT Technologies Ltd. Lagos, Nigeria.</p>
    </div>`
}

export function paymentConfirmationEmail(name: string, amount: string, plan: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#04091a;color:#dde4f5;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#50C878;font-size:24px;margin:0">✅ Payment Confirmed</h1>
        <p style="color:#8892a4;font-size:14px">SchoolCBT Subscription Active</p>
      </div>
      <div style="background:rgba(0,51,153,0.3);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0"><strong>Plan:</strong> ${plan}</p>
        <p style="margin:4px 0"><strong>Amount:</strong> ${amount}</p>
        <p style="margin:4px 0"><strong>Status:</strong> Active ✅</p>
      </div>
      <p style="font-size:14px">Thank you for subscribing, ${name}! Your full CBT platform access is now active.</p>
      <a href="https://schoolcbt.ewinproject.org/dashboard" style="display:inline-block;background:linear-gradient(135deg,#FFD700,#CCA900);color:#002366;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin-top:16px">Start Practicing →</a>
      <p style="font-size:12px;color:#445566;margin-top:24px">© 2025 SchoolCBT Technologies Ltd. Lagos, Nigeria.</p>
    </div>`
}
