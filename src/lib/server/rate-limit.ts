export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  now?: () => number
}

interface WindowEntry {
  count: number
  resetAt: number
}

interface KVLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export function createFixedWindowRateLimiter({
  maxRequests,
  windowMs,
  now = () => Date.now(),
}: RateLimitOptions) {
  const memory = new Map<string, WindowEntry>()

  async function check(key: string, kv?: KVLike): Promise<RateLimitResult> {
    const timestamp = now()
    const storageKey = `rl:${key}`
    const raw = kv ? await kv.get(storageKey) : null
    const current = raw ? (JSON.parse(raw) as WindowEntry) : memory.get(storageKey)

    if (!current || timestamp > current.resetAt) {
      const next = { count: 1, resetAt: timestamp + windowMs }
      await persist(storageKey, next, kv)
      return { allowed: true, remaining: maxRequests - 1, resetAt: next.resetAt }
    }

    if (current.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: current.resetAt }
    }

    const next = { ...current, count: current.count + 1 }
    await persist(storageKey, next, kv)
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - next.count),
      resetAt: next.resetAt,
    }
  }

  async function persist(key: string, entry: WindowEntry, kv?: KVLike) {
    if (kv) {
      await kv.put(key, JSON.stringify(entry), { expirationTtl: Math.ceil(windowMs / 1_000) })
      return
    }

    memory.set(key, entry)
  }

  return { check }
}
