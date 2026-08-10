import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { productName, baseCost, categoryName, targetMarginPct } = body as any

    const costNum = Number(baseCost) || 350
    const desiredMargin = Number(targetMarginPct) || 55

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

    if (!aiResult.success) {
      const calcPrice = Math.round(costNum / (1 - desiredMargin / 100))
      return NextResponse.json({
        success: true,
        data: {
          recommendedPrice: calcPrice,
          recommendedCompareAtPrice: Math.round(calcPrice * 1.4),
          projectedProfitAmount: calcPrice - costNum,
          projectedMarginPct: desiredMargin,
          pricingTier: "Standard D2C",
          rationale: `Calculated from base cost ₹${costNum} at ${desiredMargin}% target margin.`
        }
      })
    }

    let text = aiResult.text || ''
    if (text.includes('```')) {
      const match = text.match(/```(?:json)?([\s\S]*?)```/)
      if (match && match[1]) text = match[1].trim()
    }

    const parsed = JSON.parse(text.trim())

    return NextResponse.json({
      success: true,
      data: parsed,
      provider: aiResult.provider
    })

  } catch (err: any) {
    console.error('AI Dynamic Pricing Error:', err)
    return NextResponse.json({ error: err.message || 'Dynamic pricing failed.' }, { status: 500 })
  }
  }
})

