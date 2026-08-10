interface RateLimitStore {
  [key: string]: { count: number; expiresAt: number }
}

const store: RateLimitStore = {}

/**
 * In-memory sliding window rate limiter
 * @param identifier IP or user token
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 1 minute)
 */
export function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = store[identifier]

  if (!record || record.expiresAt < now) {
    store[identifier] = { count: 1, expiresAt: now + windowMs }
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count += 1
  return { success: true, remaining: limit - record.count }
}
