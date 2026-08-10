import { sendAccountLockoutEmail } from '@/lib/email'

interface RateLimitRecord {
  count: number
  resetTime: number
}

interface LockoutRecord {
  failedAttempts: number
  lockoutUntil: number
  lastAttemptTime: number
}

// In-memory stores with TTL
const ipRateLimitStore = new Map<string, RateLimitRecord>()
const lockoutStore = new Map<string, LockoutRecord>()

// Clean up expired entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of ipRateLimitStore.entries()) {
      if (now > record.resetTime) {
        ipRateLimitStore.delete(ip)
      }
    }
    for (const [email, record] of lockoutStore.entries()) {
      if (now > record.lockoutUntil && now - record.lastAttemptTime > 15 * 60 * 1000) {
        lockoutStore.delete(email)
      }
    }
  }, 5 * 60 * 1000)
}

/**
 * IP-based Rate Limiter: Max 10 requests per minute per IP.
 */
export function checkIpRateLimit(ip: string, limit = 10, windowMs = 60 * 1000): {
  allowed: boolean
  remaining: number
  resetMs: number
} {
  const now = Date.now()
  const record = ipRateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    }
    ipRateLimitStore.set(ip, newRecord)
    return { allowed: true, remaining: limit - 1, resetMs: windowMs }
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetTime - now),
    }
  }

  record.count += 1
  return {
    allowed: true,
    remaining: limit - record.count,
    resetMs: Math.max(0, record.resetTime - now),
  }
}

/**
 * Checks if an account is currently locked out (15 minute duration).
 */
export function isAccountLocked(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase()
  const record = lockoutStore.get(normalizedEmail)
  if (!record) return false

  const now = Date.now()
  if (record.lockoutUntil > now) {
    return true
  }

  return false
}

/**
 * Returns progressive delay in milliseconds based on consecutive failed attempts.
 * 1st fail: 0s, 2nd fail: 1s, 3rd fail: 2s, 4th fail: 4s, 5th fail+: 8s
 */
export function getProgressiveDelayMs(email: string): number {
  const normalizedEmail = email.trim().toLowerCase()
  const record = lockoutStore.get(normalizedEmail)
  if (!record || record.failedAttempts <= 1) return 0

  // 2nd fail: 1s, 3rd fail: 2s, 4th fail: 4s, 5th fail: 8s
  const exponent = Math.min(record.failedAttempts - 2, 3)
  return Math.pow(2, exponent) * 1000
}

/**
 * Records a failed login attempt.
 * Increments failed attempts, calculates lockout, and triggers notification on 5th failure.
 */
export async function recordFailedAttempt(email: string, ip: string): Promise<{
  failedCount: number
  isLocked: boolean
}> {
  const normalizedEmail = email.trim().toLowerCase()
  const now = Date.now()
  const record = lockoutStore.get(normalizedEmail) || {
    failedAttempts: 0,
    lockoutUntil: 0,
    lastAttemptTime: now,
  }

  record.failedAttempts += 1
  record.lastAttemptTime = now

  const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
  const MAX_ATTEMPTS = 5

  let newlyLocked = false

  if (record.failedAttempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS
    newlyLocked = true

    console.warn(`[ACCOUNT_LOCKOUT_TRIGGERED] Account locked for 15m. Email: ${normalizedEmail.slice(0, 3)}*** IP: ${ip}`)

    // Send email notification with reset link asynchronously
    sendAccountLockoutEmail({ to: normalizedEmail }).catch((err) => {
      console.error(`[LOCKOUT_EMAIL_ERROR] Failed to send email to ${normalizedEmail.slice(0, 3)}***`, err)
    })
  }

  lockoutStore.set(normalizedEmail, record)

  return {
    failedCount: record.failedAttempts,
    isLocked: record.failedAttempts >= MAX_ATTEMPTS || record.lockoutUntil > now,
  }
}

/**
 * Resets failed login attempt counter upon successful authentication.
 */
export function resetFailedAttempts(email: string): void {
  const normalizedEmail = email.trim().toLowerCase()
  lockoutStore.delete(normalizedEmail)
}
