// ────────────────────────────────────────────────────────────
// Alpona — Centralized Site Configuration
// ────────────────────────────────────────────────────────────
// Single source of truth for all site-wide constants.
// Import from here instead of hardcoding values in components.
// ────────────────────────────────────────────────────────────

export const siteConfig = {
  name: 'Alpona',
  tagline: 'Wear Your Imagination',
  description:
    'Custom print-on-demand — pick a design, we print & ship. Discover 120+ original streetwear designs or build your custom t-shirts, hoodies, and accessories.',

  /** Base URL — reads from env at runtime, falls back for SSG/dev */
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /** OG image path (relative to public/) */
  ogImage: '/images/og-home.png',

  /** Social links */
  social: {
    instagram: 'https://instagram.com/alpona.in',
    facebook: 'https://facebook.com/alponaindia',
    twitter: 'https://twitter.com/alponaindia',
  },

  /** Contact info */
  contact: {
    email: 'support@alpona.in',
    phone: '+91-9876543210',
    supportHours: 'Mon–Sat, 10AM–6PM IST',
  },

  /** Currency */
  currency: {
    code: 'INR' as const,
    symbol: '₹',
    locale: 'en-IN',
  },

  /** Locale */
  locale: 'en_IN',
  lang: 'en',

  /** Supported languages */
  languages: ['en', 'hi', 'bn'] as const,

  /** Company details for JSON-LD */
  legalName: 'Alpona India',
  foundingDate: '2025',
  areaServed: 'IN',

  /** Vercel deployment URL */
  vercelUrl: 'https://alpona.vercel.app',
} as const

// Re-exports for backward compatibility with existing imports
export const SITE_NAME = siteConfig.name
export const SITE_URL = siteConfig.url
export const CURRENCY = siteConfig.currency.code
export const CURRENCY_SYMBOL = siteConfig.currency.symbol
