// ────────────────────────────────────────────────────────────
// Alpona — Feature Flags
// ────────────────────────────────────────────────────────────
// Controls feature rollout. Flip these before deployment.
// Future: Move to a remote config service (LaunchDarkly, PostHog).
// ────────────────────────────────────────────────────────────

export const features = {
  /** Core */
  designStudio: true,
  aiAssistant: true,
  aiSearch: true,
  aiSizeRecommender: true,

  /** Ecommerce */
  giftCards: false,
  multiCurrency: false,
  abandonedCartRecovery: false,
  guestCheckout: false,
  cashOnDelivery: true,
  wishlistSync: false, // Persist wishlist to DB (currently client-only)

  /** Panels */
  sellerPanel: false, // Internal team product upload panel
  adminAiDashboard: true,

  /** UX */
  commandPalette: false,
  darkMode: false,
  offlineDetection: false,
  pushNotifications: false,

  /** Analytics */
  googleAnalytics: false,
  posthog: false,
  sentry: false,
  webVitalsReporting: true,

  /** Marketing */
  referralProgram: false,
  affiliateProgram: false,
  loyaltyProgram: false,

  /** Integrations */
  qikinkMockMode: process.env.QIKINK_MOCK_MODE === 'true',
} as const

export type FeatureKey = keyof typeof features
