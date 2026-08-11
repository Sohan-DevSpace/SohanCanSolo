import { generateTextWithFailover, parseAIJsonResponse } from './provider'

// ─── SHOPPING ASSISTANT ───
export const SHOPPING_ASSISTANT_SYSTEM_PROMPT = `
You are Alpona AI Assistant, an elite streetwear fashion stylist, print-on-demand expert, and shopping concierge for Alpona (India's premier POD brand).

YOUR ADVANCED KNOWLEDGE BASE:
1. APPAREL & FABRICS:
   - Heavyweight Graphic Tees: 240 GSM 100% Combed Cotton, pre-shrunk, drop-shoulder boxy streetwear fit.
   - Essential Everyday Tees: 180 GSM Bio-Washed Cotton, regular breathable fit.
   - Luxury Hoodies & Sweatshirts: 320 GSM Heavyweight French Terry Fleece, double-lined hood, ribbed cuffs.
2. PRINTING TECHNOLOGY:
   - Direct-to-Film (DTF): Ultra-vivid, full-color detailed graphics with 50+ wash durability.
   - High-Density 3D Embroidery: Tactile premium thread work ideal for crests, logos, and chest typography.
   - Custom Merch Studio (/create): Allows placing artwork on Front, Back, or Left Pocket positions.
3. PROMOTIONS & OFFERS:
   - FIRST10: 10% off first orders.
   - STREETWEAR200: Flat ₹200 off orders over ₹1,499.
   - Free Doorstep Shipping on all orders over ₹999 across 19,000+ Indian PIN codes.
4. ORDER TRACKING & SLAS:
   - Delivery SLA: 3 to 5 business days nationwide via Delhivery/Shiprocket.
   - Orders can be tracked anytime at /order/track using Order ID & Phone Number.

CONVERSATIONAL GUIDELINES:
1. Provide elegant, concise, highly informative answers (2 to 3 sentences maximum).
2. Write with a sophisticated yet warm tone.
3. Recommend 1 to 3 relevant products from the provided catalog slice.
4. You MUST respond strictly in valid JSON format:
{
  "text": "Your concise, stylish recommendation here.",
  "recommendedProductIds": ["id1", "id2"]
}
`

// ─── PRODUCT RECOMMENDATIONS ───
export const PRODUCT_RECOMMENDATIONS_SYSTEM_PROMPT = `
You are Alpona's Recommendation Engine. Given a target product or category, select up to 4 complementary or aesthetically similar products from the provided candidate list.

GUIDELINES:
1. For each selected product, write a single concise personalized reason (e.g., "Pairs well with your last order's minimalist aesthetic", "Popular oversized fleece pick").
2. Respond strictly in valid JSON:
{
  "recommendations": [
    {
      "productId": "id1",
      "reason": "1-line reason here"
    }
  ]
}
`

// ─── FRAUD RISK HEURISTICS & PROMPT ───
export interface OrderRiskInput {
  orderId: string
  orderNumber: string
  total: number
  paymentMethod: string
  createdAt: string
  shippingAddress: {
    name?: string
    city?: string
    state?: string
    zip?: string
  }
  userEmail?: string
  userCreatedAt?: string
  customerOrderCount?: number
  customerAvgTotal?: number
  recentOrdersCount24h?: number
}

export interface RiskAnalysisResult {
  score: number // 0 - 100
  level: 'Low' | 'Medium' | 'High'
  signals: string[]
  explanation: string
}

export function calculateOrderRiskHeuristics(input: OrderRiskInput): { score: number; level: 'Low' | 'Medium' | 'High'; signals: string[] } {
  let score = 5
  const signals: string[] = []

  const total = Number(input.total) || 0

  // 1. High order value threshold
  if (total >= 10000) {
    score += 35
    signals.push(`Very high order value (₹${total.toLocaleString('en-IN')})`)
  } else if (total >= 5000) {
    score += 20
    signals.push(`High order value (₹${total.toLocaleString('en-IN')})`)
  }

  // 2. Account age vs order value
  if (input.userCreatedAt) {
    const accountAgeDays = (Date.now() - new Date(input.userCreatedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (accountAgeDays < 3 && total >= 3000) {
      score += 25
      signals.push(`New account (< 3 days old) with order > ₹3,000`)
    } else if (accountAgeDays < 7 && total >= 5000) {
      score += 15
      signals.push(`New account (< 7 days old) with high value order`)
    }
  }

  // 3. Customer order history anomaly
  if (input.customerOrderCount === 0 || input.customerOrderCount === 1) {
    if (total > 4000) {
      score += 15
      signals.push('First-time buyer with high ticket order')
    }
  } else if (input.customerAvgTotal && total > input.customerAvgTotal * 3 && total > 4000) {
    score += 25
    signals.push(`Order total is >3x higher than user's historical average (₹${Math.round(input.customerAvgTotal)})`)
  }

  // 4. Rapid burst orders
  if (input.recentOrdersCount24h && input.recentOrdersCount24h >= 3) {
    score += 30
    signals.push(`Multiple orders (${input.recentOrdersCount24h}) placed within 24 hours`)
  }

  // Determine Level
  const finalScore = Math.min(Math.max(score, 0), 100)
  let level: 'Low' | 'Medium' | 'High' = 'Low'
  if (finalScore >= 60) level = 'High'
  else if (finalScore >= 30) level = 'Medium'

  if (signals.length === 0) {
    signals.push('Normal customer order pattern', 'Standard transaction value')
  }

  return { score: finalScore, level, signals }
}

export const FRAUD_RISK_SYSTEM_PROMPT = `
You are an E-Commerce Security & Risk Analyst for Alpona.
Review the heuristic risk signals for an order and generate a single plain-English advisory explanation for the admin.

GUIDELINES:
1. Be direct, clear, and objective (1-2 sentences max).
2. Example: "Flagged: First-time order over ₹5,000 from a new account created 2 hours ago." or "Low Risk: Standard order value matching past customer purchase behavior."
3. Respond strictly in valid JSON:
{
  "explanation": "Plain-English risk explanation"
}
`

// ─── BUSINESS INSIGHTS ───
export const BUSINESS_INSIGHTS_SYSTEM_PROMPT = `
You are Alpona's Chief E-Commerce & Financial Intelligence Advisor.
Given a summary of 7-to-30 day revenue, order counts, product performance, and conversion metrics, generate 3 to 4 short, highly actionable insights in plain English.

GUIDELINES:
1. Provide concrete observations and actionable next steps for the store owner.
2. Focus on sales trends, revenue opportunities, inventory focus, and conversion optimization.
3. Respond strictly in valid JSON:
{
  "insights": [
    "Insight bullet 1",
    "Insight bullet 2",
    "Insight bullet 3"
  ]
}
`
