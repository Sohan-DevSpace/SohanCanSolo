import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import {
  loginServerSchema,
  logValidationFailure,
  GENERIC_AUTH_ERROR,
} from '@/lib/validation/auth'
import {
  checkIpRateLimit,
  isAccountLocked,
  getProgressiveDelayMs,
  recordFailedAttempt,
  resetFailedAttempts,
} from '@/lib/security/rate-limit'
import { AuthService } from '@/lib/security/auth-service'

// Helper function to pause execution for progressive delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const POST = createApiHandler({
  schema: loginServerSchema,
  auth: 'optional',
  handler: async ({ req, body, supabase }) => {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    // 1. IP Rate limit check: Max 10 requests per minute per IP
    const rateLimit = checkIpRateLimit(clientIp, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      console.warn(`[RATE_LIMIT_EXCEEDED] IP: ${clientIp}`)
      return apiError(
        'RATE_LIMIT_EXCEEDED', 
        'Too many requests. Please try again later.', 
        429,
        undefined,
        { 'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString() }
      )
    }

    const { email, password } = body

    // 2. Account lockout check (15 minutes lockout after 5 consecutive failed attempts)
    if (isAccountLocked(email)) {
      console.warn(`[LOGIN_BLOCKED_LOCKOUT] Email: ${email.slice(0, 3)}***`)
      await delay(1000)
      // Generic error response - never reveal lockout vs wrong password
      return apiError('UNAUTHORIZED', 'Incorrect email or password', 401)
    }

    // 3. Progressive delay based on prior failed attempts
    const progressiveDelayMs = getProgressiveDelayMs(email)
    if (progressiveDelayMs > 0) {
      await delay(progressiveDelayMs)
    }

    // 4. Supabase authentication
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Record failed attempt, calculate lockout & send lockout email if threshold reached
      const { failedCount, isLocked } = await recordFailedAttempt(email, clientIp)
      console.warn(
        `[AUTH_LOGIN_FAILED] Email: ${email.slice(0, 3)}*** - Failed attempts: ${failedCount} - Locked: ${isLocked}`
      )

      // Generic error response to prevent account/lockout enumeration
      return apiError('UNAUTHORIZED', 'Incorrect email or password', 401)
    }

    // 5. Reset failed attempts counter on successful login
    resetFailedAttempts(email)

    // 6. Legacy Password Hash Audit & Inline Migration
    const userMetadata = data.user?.user_metadata
    const existingHash = userMetadata?.password_hash || userMetadata?.legacy_hash

    if (existingHash) {
      const migrationResult = await AuthService.verifyAndMigrateLogin(password, existingHash)
      if (migrationResult.needsRehash && migrationResult.newHash && data.user) {
        await AuthService.applyHashMigration(data.user.id, migrationResult.newHash)
      }
    } else if (data.user && !userMetadata?.password_hash_v2) {
      // If missing 12-round bcrypt hash metadata, hash and save modern 12-round bcrypt hash
      const newHash = await AuthService.preparePasswordUpdate(password)
      await AuthService.applyHashMigration(data.user.id, newHash)
    }

    return apiSuccess({ user: data.user }, 200)
  }
})
