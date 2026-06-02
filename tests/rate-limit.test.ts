import { describe, expect, it } from 'vitest'
import { createFixedWindowRateLimiter } from '../src/lib/server/rate-limit'

describe('createFixedWindowRateLimiter', () => {
  it('allows requests within the configured window and rejects overflow', async () => {
    let now = 1_000
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 2,
      windowMs: 1_000,
      now: () => now,
    })

    expect(await limiter.check('student-1')).toEqual({
      allowed: true,
      remaining: 1,
      resetAt: 2_000,
    })
    expect(await limiter.check('student-1')).toEqual({
      allowed: true,
      remaining: 0,
      resetAt: 2_000,
    })
    expect(await limiter.check('student-1')).toEqual({
      allowed: false,
      remaining: 0,
      resetAt: 2_000,
    })

    now = 2_001
    expect(await limiter.check('student-1')).toEqual({
      allowed: true,
      remaining: 1,
      resetAt: 3_001,
    })
  })
})
