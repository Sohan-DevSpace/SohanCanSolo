// ────────────────────────────────────────────────────────────
// Alpona — Route Constants
// ────────────────────────────────────────────────────────────
// All application routes defined in one place.
// Never hardcode route strings in components.
// ────────────────────────────────────────────────────────────

export const routes = {
  // ─── Public ───
  home: '/',
  shop: '/shop',
  productDetail: (slug: string) => `/shop/${slug}` as const,
  cart: '/cart',
  checkout: '/checkout',
  wishlist: '/wishlist',
  designStudio: '/design-studio',
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}` as const,

  // ─── Order ───
  orderSuccess: '/order/success',
  orderTrack: '/order/track',
  trackOrder: '/track-order',

  // ─── Info Pages ───
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  shipping: '/shipping',
  returns: '/returns',
  privacy: '/privacy',
  terms: '/terms',
  sizeGuide: '/size-guide',
  help: '/help',
  reviews: '/reviews',
  engineering: '/engineering',

  // ─── Features ───
  designDna: '/design-dna',
  styleMatch: '/style-match',
  giftCards: '/gift-cards',
  referral: '/referral',
  affiliate: '/affiliate',

  // ─── Auth ───
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    callback: '/auth/callback',
    signout: '/auth/signout',
    logout: '/auth/logout',
  },

  // ─── Customer Account ───
  account: {
    root: '/account',
    profile: '/account/profile',
    orders: '/account/orders',
    orderDetail: (id: string) => `/account/orders/${id}` as const,
    addresses: '/account/addresses',
    wishlist: '/account/wishlist',
    password: '/account/password',
    settings: '/account/settings',
    reviews: '/account/reviews',
    coupons: '/account/coupons',
    privacy: '/account/privacy',
    devices: '/account/devices',
    sellerHub: '/account/seller-hub',
    language: '/account/language',
    legal: '/account/legal',
    qa: '/account/qa',
    faq: '/account/faq',
  },

  // ─── Admin ───
  admin: {
    root: '/admin',
    products: '/admin/products',
    productNew: '/admin/products/new',
    productEdit: (id: string) => `/admin/products/${id}/edit` as const,
    orders: '/admin/orders',
    orderDetail: (id: string) => `/admin/orders/${id}` as const,
    customers: '/admin/customers',
    designs: '/admin/designs',
    categories: '/admin/categories',
    subcategories: '/admin/subcategories',
    productTypes: '/admin/product-types',
    coupons: '/admin/coupons',
    reviews: '/admin/reviews',
    settings: '/admin/settings',
    shipping: '/admin/shipping',
    analytics: '/admin/analytics',
    aiInsights: '/admin/ai-insights',
    support: '/admin/support',
    users: '/admin/users',
  },

  // ─── API ───
  api: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      signout: '/api/auth/signout',
    },
    ai: {
      root: '/api/ai',
      assistant: '/api/ai/assistant',
      generate: '/api/ai/generate',
      smartSearch: '/api/ai/smart-search',
      sizeRecommendation: '/api/ai/size-recommendation',
      describeProduct: '/api/ai/describe-product',
      designSuggestions: '/api/ai/design-suggestions',
      reviewSummary: '/api/ai/review-summary',
      visualSearch: '/api/ai/visual-search',
      autoTag: '/api/ai/auto-tag',
      translate: '/api/ai/translate',
      designDna: '/api/ai/design-dna',
      dynamicPricing: '/api/ai/dynamic-pricing',
      inventoryForecast: '/api/ai/inventory-forecast',
      returnRisk: '/api/ai/return-risk',
      orderTracking: '/api/ai/order-tracking',
      customerSegmentation: '/api/ai/customer-segmentation',
    },
    orders: {
      createCod: '/api/orders/create-cod',
      track: '/api/orders/track',
    },
    razorpay: {
      createOrder: '/api/razorpay/create-order',
      verify: '/api/razorpay/verify',
    },
    coupons: {
      validate: '/api/coupons/validate',
      available: '/api/coupons/available',
    },
    cloudinary: {
      upload: '/api/cloudinary/upload',
      delete: '/api/cloudinary/delete',
      sign: '/api/cloudinary/sign',
      migrate: '/api/cloudinary/migrate',
    },
    designs: {
      upload: '/api/designs/upload',
    },
    search: '/api/search',
    contact: '/api/contact',
    health: '/api/health',
  },
} as const

/**
 * Check if a pathname matches a protected route pattern.
 */
export function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin')
  )
}

/**
 * Check if a pathname is an admin route.
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/**
 * Build a login redirect URL with return path.
 */
export function loginRedirectUrl(returnPath: string): string {
  return `${routes.auth.login}?returnUrl=${encodeURIComponent(returnPath)}`
}
