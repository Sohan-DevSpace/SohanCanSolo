import { z } from 'zod'

// ────────────────────────────────────────────────────────────
// Runtime Environment Validation
// ────────────────────────────────────────────────────────────
// Validates all required environment variables at build/boot time.
// Fails fast with clear errors instead of cryptic runtime crashes.
// ────────────────────────────────────────────────────────────

/**
 * Server-only environment variables.
 * These are NEVER exposed to the browser.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Supabase (server)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Razorpay
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),

  // Qikink
  QIKINK_MOCK_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  QIKINK_API_URL: z.string().url().default('https://api.qikink.com'),
  QIKINK_CLIENT_ID: z.string().min(1, 'QIKINK_CLIENT_ID is required'),
  QIKINK_CLIENT_SECRET: z.string().min(1, 'QIKINK_CLIENT_SECRET is required'),

  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

  // AI
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Cloudinary
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
})

/**
 * Client-safe environment variables (NEXT_PUBLIC_*).
 * These ARE exposed to the browser bundle.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required'),
})

// ─── Parse & Export ────────────────────────────────────────

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>,
  label: string
): z.infer<T> {
  const result = schema.safeParse(source)

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    console.error(
      `\n❌ Invalid ${label} environment variables:\n${formatted}\n`
    )

    // In production, fail hard. In dev, warn but continue (some vars may not be needed for all tasks).
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing or invalid ${label} environment variables`)
    }

    // Return a partial object in dev so the app can still boot
    return source as z.infer<T>
  }

  return result.data
}

/**
 * Validated server environment variables.
 * Only import this in server-side code (API routes, server components, middleware).
 */
export const serverEnv = parseEnv(
  serverEnvSchema,
  process.env as Record<string, string | undefined>,
  'server'
)

/**
 * Validated client environment variables.
 * Safe to import anywhere — these are all NEXT_PUBLIC_*.
 */
export const clientEnv = parseEnv(
  clientEnvSchema,
  process.env as Record<string, string | undefined>,
  'client'
)

/**
 * Combined env for convenience in server contexts.
 */
export const env = { ...clientEnv, ...serverEnv } as typeof clientEnv &
  typeof serverEnv
