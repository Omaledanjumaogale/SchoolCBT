// tests/validation.test.ts
// Unit tests for Zod validation schemas
import { describe, it, expect } from 'vitest'
import { PaymentRequestSchema, GenerateQuestionsSchema } from '../src/lib/validation'

describe('PaymentRequestSchema', () => {
  it('accepts valid payment request', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'student-single',
      uid: 'abc123',
      email: 'test@example.com',
      currency: 'NGN',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing plan', () => {
    const result = PaymentRequestSchema.safeParse({
      uid: 'abc123',
      email: 'test@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid plan', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'invalid-plan',
      uid: 'abc123',
      email: 'test@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'student-single',
      uid: 'abc123',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty uid', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'student-single',
      uid: '',
      email: 'test@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('defaults currency to NGN', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'student-single',
      uid: 'abc123',
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.currency).toBe('NGN')
  })

  it('accepts all valid plan types', () => {
    const plans = ['student-single', 'student-premium', 'school']
    for (const plan of plans) {
      const result = PaymentRequestSchema.safeParse({
        plan,
        uid: 'x',
        email: 'a@b.com',
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid currency', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'student-single',
      uid: 'abc123',
      email: 'test@example.com',
      currency: 'EUR',
    })
    expect(result.success).toBe(false)
  })

  it('accepts supported payment providers', () => {
    for (const provider of ['paystack', 'stripe', 'flutterwave', 'korapay', 'seerbit']) {
      const result = PaymentRequestSchema.safeParse({
        plan: 'student-single',
        uid: 'abc123',
        email: 'test@example.com',
        currency: provider === 'stripe' ? 'USD' : 'NGN',
        provider,
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects unsupported payment providers', () => {
    const result = PaymentRequestSchema.safeParse({
      plan: 'student-single',
      uid: 'abc123',
      email: 'test@example.com',
      provider: 'unknownpay',
    })

    expect(result.success).toBe(false)
  })
})

describe('GenerateQuestionsSchema', () => {
  it('accepts valid request', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
      count: 10,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing subject', () => {
    const result = GenerateQuestionsSchema.safeParse({
      examType: 'WAEC',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing examType', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
    })
    expect(result.success).toBe(false)
  })

  it('defaults count to 5', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.count).toBe(5)
  })

  it('rejects count > 50', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
      count: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects count < 1', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
      count: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional difficulty', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
      difficulty: 'Medium',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid difficulty', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
      difficulty: 'Expert',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional topics array', () => {
    const result = GenerateQuestionsSchema.safeParse({
      subject: 'Physics',
      examType: 'WAEC',
      topics: ['Mechanics', 'Waves'],
    })
    expect(result.success).toBe(true)
  })
})
