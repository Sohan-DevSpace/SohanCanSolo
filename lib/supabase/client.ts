import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const id = setTimeout(() => controller.abort(), 12000)
          return fetch(url, {
            ...options,
            signal: controller.signal,
          })
            .catch((err) => {
              if (err?.name === 'AbortError') {
                return new Response(JSON.stringify({ error: 'Request timed out' }), {
                  status: 408,
                  headers: { 'Content-Type': 'application/json' },
                })
              }
              // Handle network error (e.g. Failed to fetch / connection closed)
              return new Response(JSON.stringify({ error: err?.message || 'Network error' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              })
            })
            .finally(() => clearTimeout(id))
        }
      }
    }
  )
}
