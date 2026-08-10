import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { signupServerSchema } from '@/lib/validation/auth'
import { AuthService } from '@/lib/security/auth-service'

export const POST = createApiHandler({
  schema: signupServerSchema,
  auth: 'optional',
  handler: async ({ req, body, supabase }) => {
    const { email, password, fullName, username } = body

    // Prepare 12-round salt bcrypt password hash
    const securePasswordHash = await AuthService.prepareSignupPassword(password)

    const requestUrl = new URL(req.url)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...(username ? { username } : {}),
          password_hash_v2: securePasswordHash,
        },
        emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      console.warn(`[AUTH_SIGNUP_FAILED] Email: ${email.slice(0, 3)}*** - ${authError.message}`)
      return apiError(
        'SIGNUP_FAILED', 
        'Unable to process registration with the provided details.', 
        400
      )
    }

    return apiSuccess({
      sessionExists: !!authData.session,
      user: authData.user,
    }, 200)
  }
})
