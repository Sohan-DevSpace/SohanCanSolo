import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { heightCm, weightKg, age, gender, bodyType, fitPreference, productName, availableSizes } = body as any

    if (!heightCm || !weightKg || !gender) {
      return NextResponse.json({ error: 'Height, weight, and gender are required.' }, { status: 400 })
    }

    const systemPrompt = `You are Alpona's AI Apparel Fit Specialist.
Predict the optimal garment size for the customer based on their physical metrics, body type, and fit preference.

Available Sizes: ${JSON.stringify(availableSizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'])}
Default apparel fit profile: Alpona garments are streetwear cut with drop-shoulder relaxed tailoring.

Calculate and return JSON ONLY with exact fields:
{
  "recommendedSize": "Oversized M",
  "confidenceScore": 92,
  "reason": "Based on your height (175cm), weight (68kg) and preference for a streetwear drop-shoulder fit.",
  "alternativeSize": "L",
  "orderTwoSizesRecommendation": false
}

Rules:
- If confidenceScore < 70%, set orderTwoSizesRecommendation = true and suggest ordering two sizes for easy exchange.
- Output ONLY JSON. Do not wrap in markdown or extra text.`

    const userPrompt = `Customer Specs:
- Product: ${productName || 'Streetwear Apparel'}
- Gender: ${gender}
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Age: ${age || 25}
- Body Type: ${bodyType || 'Average'}
- Fit Preference: ${fitPreference || 'Oversized'}`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 500,
      temperature: 0.3,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'Size calculation failed.' }, { status: 502 })
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
    console.error('AI Size Recommender Error:', err)
    return NextResponse.json({ error: err.message || 'Size calculation failed.' }, { status: 500 })
  }
  }
})

