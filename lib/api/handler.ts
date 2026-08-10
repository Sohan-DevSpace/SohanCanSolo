import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ────────────────────────────────────────────────────────────
// Standard API Response Types
// ────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ────────────────────────────────────────────────────────────
// API Context — passed to every handler
// ────────────────────────────────────────────────────────────

export interface ApiContext<TBody = unknown, TQuery = Record<string, string>> {
  req: NextRequest
  /** Validated request body (only for POST/PUT/PATCH) */
  body: TBody
  /** Parsed search params */
  query: TQuery
  /** Authenticated user (null if auth is 'optional' and user not logged in) */
  user: { id: string; email: string } | null
  /** Supabase client (authenticated as user or service role depending on config) */
  supabase: Awaited<ReturnType<typeof createClient>>
}

// ────────────────────────────────────────────────────────────
// API Handler Configuration
// ────────────────────────────────────────────────────────────

interface ApiHandlerConfig<TBody = unknown> {
  /** Auth requirement: 'required' (401 if not logged in), 'admin' (403 if not admin), 'optional' */
  auth?: 'required' | 'admin' | 'optional'
  /** Zod schema for request body validation (POST/PUT/PATCH only) */
  schema?: ZodSchema<TBody>
  /** The handler function */
  handler: (ctx: ApiContext<TBody>) => Promise<NextResponse>
}

// ────────────────────────────────────────────────────────────
// Helper: Build standard responses
// ────────────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200, meta?: ApiSuccessResponse['meta']): NextResponse {
  const body: ApiSuccessResponse<T> = { success: true, data }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  headers?: Record<string, string>
): NextResponse {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, ...(details !== undefined && { details }) },
  }
  return NextResponse.json(body, { status, headers })
}

// ────────────────────────────────────────────────────────────
// createApiHandler — the factory
// ────────────────────────────────────────────────────────────

/**
 * Factory that wraps API route handlers with:
 * - Authentication checking
 * - Request body validation
 * - Structured error responses
 * - Consistent logging
 *
 * Usage:
 * ```ts
 * export const POST = createApiHandler({
 *   auth: 'required',
 *   schema: createOrderSchema,
 *   handler: async (ctx) => {
 *     const order = await orderService.create(ctx.body, ctx.user!)
 *     return apiSuccess(order, 201)
 *   }
 * })
 * ```
 */
export function createApiHandler<TBody = unknown>(
  config: ApiHandlerConfig<TBody>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const supabase = await createClient()

      // ── Auth ─────────────────────────────────────────
      let user: ApiContext['user'] = null

      if (config.auth && config.auth !== 'optional') {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          return apiError('UNAUTHORIZED', 'Authentication required', 401)
        }

        user = { id: authUser.id, email: authUser.email ?? '' }

        // Admin check
        if (config.auth === 'admin') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

          if (!profile || profile.role !== 'admin') {
            return apiError('FORBIDDEN', 'Admin access required', 403)
          }
        }
      } else if (config.auth === 'optional') {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser()
          if (authUser) {
            user = { id: authUser.id, email: authUser.email ?? '' }
          }
        } catch {
          // Silently ignore auth errors for optional auth
        }
      }

      // ── Body Validation ──────────────────────────────
      let body = {} as TBody
      if (config.schema) {
        try {
          const rawBody = await req.json()
          const result = config.schema.safeParse(rawBody)
          if (!result.success) {
            return apiError(
              'VALIDATION_ERROR',
              'Invalid request body',
              400,
              result.error.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
              }))
            )
          }
          body = result.data
        } catch {
          return apiError('INVALID_JSON', 'Request body is not valid JSON', 400)
        }
      }

      // ── Query Params ─────────────────────────────────
      const query: Record<string, string> = {}
      req.nextUrl.searchParams.forEach((value, key) => {
        query[key] = value
      })

      // ── Execute Handler ──────────────────────────────
      const ctx: ApiContext<TBody> = { req, body, query, user, supabase }
      return await config.handler(ctx)
    } catch (error) {
      // Structured error logging
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined

      console.error('[API_ERROR]', {
        url: req.url,
        method: req.method,
        error: errorMessage,
        stack:
          process.env.NODE_ENV === 'development' ? errorStack : undefined,
      })

      return apiError(
        'INTERNAL_ERROR',
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : errorMessage,
        500
      )
    }
  }
}
