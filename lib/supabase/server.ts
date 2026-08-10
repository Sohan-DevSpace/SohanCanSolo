import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const id = setTimeout(() => controller.abort(), 10000)
          return fetch(url, {
            ...options,
            signal: controller.signal,
          })
            .catch((err) => {
              if (err.name === 'AbortError') {
                return new Response(JSON.stringify({ error: 'Request timed out' }), {
                  status: 408,
                  headers: { 'Content-Type': 'application/json' },
                })
              }
              throw err
            })
            .finally(() => clearTimeout(id))
        }
      }
    }
  )
}
