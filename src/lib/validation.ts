// src/lib/validation.ts
// Zod validation schemas for SchoolCBT API endpoints
import { z } from 'zod';

export const PlanIdSchema = z.enum(['student-single', 'student-premium', 'school']);
export const CurrencySchema = z.enum(['NGN', 'USD']);

export const PaymentRequestSchema = z.object({
  plan:     PlanIdSchema,
  uid:      z.string().min(1, 'User ID required'),
  email:    z.string().email('Valid email required'),
  currency: CurrencySchema.optional().default('NGN')
});

export const GenerateQuestionsSchema = z.object({
  subject:  z.string().min(1, 'Subject is required'),
  examType: z.string().min(1, 'Exam type is required'),
  count:    z.number().int().min(1).max(50).optional().default(5),
  topics:   z.array(z.string()).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional()
});

// Type exports
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
export type GenerateQuestionsRequest = z.infer<typeof GenerateQuestionsSchema>;
