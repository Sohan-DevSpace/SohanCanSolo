/**
 * Helper to get the canonical URL for OAuth redirects and auth callbacks.
 * Works seamlessly across Localhost, Vercel deployments, and Production domains.
 */
export function getURL(path: string = ''): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://alpona.vercel.app')

  // Ensure protocol
  url = url.includes('http') ? url : `https://${url}`
  // Remove trailing slash
  url = url.replace(/\/$/, '')

  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${url}${cleanPath}`
}
