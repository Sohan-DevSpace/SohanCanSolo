import { z } from 'zod'

/**
 * Sanitizes input string to prevent HTML/script tag injection,
 * strip control characters and null bytes, and remove dangerous protocol handlers.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    // Remove null bytes and invisible control characters (ASCII 0-31 except \t, \n, \r)
    .replace(/[\0\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Remove inline JS event handlers (e.g. onload=, onerror=)
    .replace(/on\w+\s*=/gi, '')
    // Remove javascript: pseudo-protocol
    .replace(/javascript\s*:/gi, '')
    // Trim leading and trailing whitespace
    .trim()
}

/**
 * Server-side email schema with sanitization and length checks.
 */
export const emailServerSchema = z
  .string()
  .transform((val) => sanitizeInput(val).toLowerCase())
  .pipe(
    z
      .string()
      .min(5, 'Invalid email length')
      .max(254, 'Email exceeds maximum length')
      .email('Invalid email format')
  )

/**
 * Server-side password schema with sanitization and length limits.
 */
export const passwordServerSchema = z
  .string()
  .transform((val) => sanitizeInput(val))
  .pipe(
    z
      .string()
      .min(6, 'Password too short')
      .max(128, 'Password exceeds maximum length')
  )

/**
 * Server-side username schema with sanitization and format checks.
 */
export const usernameServerSchema = z
  .string()
  .transform((val) => sanitizeInput(val))
  .pipe(
    z
      .string()
      .min(3, 'Username too short')
      .max(30, 'Username exceeds maximum length')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters')
  )

/**
 * Server-side display name / full name schema.
 */
export const displayNameServerSchema = z
  .string()
  .transform((val) => sanitizeInput(val))
  .pipe(
    z
      .string()
      .min(2, 'Name too short')
      .max(70, 'Name exceeds maximum length')
      .regex(/^[a-zA-Z0-9\s'.-]+$/, 'Name contains invalid characters')
  )

/**
 * Complete login server schema.
 */
export const loginServerSchema = z.object({
  email: emailServerSchema,
  password: passwordServerSchema,
})

/**
 * Complete signup server schema.
 */
export const signupServerSchema = z.object({
  email: emailServerSchema,
  password: passwordServerSchema,
  fullName: displayNameServerSchema,
  username: usernameServerSchema.optional(),
})

export type LoginServerInput = z.infer<typeof loginServerSchema>
export type SignupServerInput = z.infer<typeof signupServerSchema>

export const GENERIC_AUTH_ERROR =
  'Incorrect email or password'

/**
 * Logs validation failures server-side for monitoring without exposing details to client.
 */
export function logValidationFailure(
  endpoint: string,
  error: unknown,
  req: Request
) {
  const clientIp =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  let formattedErrors: unknown = error
  if (error instanceof z.ZodError) {
    formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
    }))
  }

  console.error(`[AUTH_VALIDATION_FAILURE] [${endpoint}]`, {
    timestamp: new Date().toISOString(),
    clientIp,
    userAgent,
    errors: formattedErrors,
  })
}
