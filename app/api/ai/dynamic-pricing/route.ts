import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
    try {
      const { productName, baseCost, categoryName, targetMarginPct } = (body || {}) as any

      const costNum = Math.max(1, Number(baseCost) || 350)
      const desiredMargin = Math.min(90, Math.max(10, Number(targetMarginPct) || 55))

      const systemPrompt = `You are Alpona's AI E-Commerce Pricing & Revenue Optimizer.
Evaluate production base cost, target margin %, and Indian D2C streetwear market benchmarks to recommend optimal pricing.

Return JSON ONLY with exact keys:
{
  "recommendedPrice": 899,
  "recommendedCompareAtPrice": 1499,
  "projectedProfitAmount": 549,
  "projectedMarginPct": 61,
  "pricingTier": "Mid-Premium Streetwear",
  "rationale": "Pricing at ₹899 with ₹1499 MSRP yields 61% margin while positioning below the ₹999 free-shipping threshold to maximize conversion volume."
}`

      const userPrompt = `Product: "${productName || 'Streetwear Apparel'}", Base Production Cost: ₹${costNum}, Category: "${categoryName || 'T-Shirts'}", Target Margin: ${desiredMargin}%`

      const aiResult = await generateTextWithFailover({
        systemPrompt,
        prompt: userPrompt,
        maxTokens: 400,
        temperature: 0.2,
        preferredProvider: 'gemini'
      })

      const fallbackCalcPrice = Math.round(costNum / (1 - desiredMargin / 100))
      const defaultData = {
        recommendedPrice: fallbackCalcPrice,
        recommendedCompareAtPrice: Math.round(fallbackCalcPrice * 1.5),
        projectedProfitAmount: fallbackCalcPrice - costNum,
        projectedMarginPct: desiredMargin,
        pricingTier: "Standard D2C Streetwear",
        rationale: `Optimized from base cost ₹${costNum} with ${desiredMargin}% target margin.`
      }

      if (!aiResult.success || !aiResult.text) {
        return NextResponse.json({
          success: true,
          data: defaultData,
          provider: 'calculation-fallback'
        })
      }

      let parsed = defaultData
      try {
        let text = aiResult.text.trim()
        if (text.includes('```')) {
          const match = text.match(/```(?:json)?([\s\S]*?)```/)
          if (match && match[1]) text = match[1].trim()
        }
        parsed = { ...defaultData, ...JSON.parse(text) }
      } catch (parseErr) {
        console.warn('[AI DYNAMIC PRICING] Using mathematical fallback due to JSON parse error')
      }

      return NextResponse.json({
        success: true,
        data: parsed,
        provider: aiResult.provider || 'gemini'
      })

    } catch (err: any) {
      console.error('AI Dynamic Pricing Error:', err)
      const costNum = Number((body as any)?.baseCost) || 350
      const desiredMargin = Number((body as any)?.targetMarginPct) || 55
      const fallbackCalcPrice = Math.round(costNum / (1 - desiredMargin / 100))
      return NextResponse.json({
        success: true,
        data: {
          recommendedPrice: fallbackCalcPrice,
          recommendedCompareAtPrice: Math.round(fallbackCalcPrice * 1.5),
          projectedProfitAmount: fallbackCalcPrice - costNum,
          projectedMarginPct: desiredMargin,
          pricingTier: "Standard D2C Streetwear",
          rationale: `Calculated from base cost ₹${costNum} at ${desiredMargin}% target margin.`
        },
        provider: 'fallback'
      })
    }
  }
})
