import { createClient } from '@supabase/supabase-js'

/**
 * A public Supabase client for data fetching in Server Components.
 * This client does NOT use cookies or session headers, ensuring it does NOT
 * opt the route into Next.js Dynamic Rendering.
 * 
 * Use this to fetch public data like catalogs, products, and articles, 
 * which will allow Next.js to Statically Generate (SSG) the page and cache it.
 */
export const createPublicClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const id = setTimeout(() => controller.abort(), 10000)
          return fetch(url, {
            ...options,
            // Opt-in to Next.js ISR (Incremental Static Regeneration)
            next: { revalidate: 60, tags: ['public-data'] },
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
