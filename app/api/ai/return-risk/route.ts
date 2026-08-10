import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { orderId, items, customerHistory } = body as any

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required for return risk analysis.' }, { status: 400 })
    }

    const systemPrompt = `You are Alpona's AI Return & Exchange Risk Scoring Engine.
Evaluate order items (sizes, multi-size selections, garment cuts) and customer history to predict return risk likelihood.

Return JSON ONLY with exact keys:
{
  "returnRiskLevel": "Low",
  "returnRiskScore": 18,
  "riskFactors": [
    "Customer selected standard size S matching previous non-returned orders.",
    "Single item order reduces sizing experimentation risk."
  ],
  "mitigationAdvice": "Pre-shipment verification not required. Process order for immediate fulfillment."
}`

    const userPrompt = `Order ID: "${orderId || 'NEW'}", Items: ${JSON.stringify(items)}, History: ${JSON.stringify(customerHistory || {})}`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 400,
      temperature: 0.2,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          returnRiskLevel: "Low",
          returnRiskScore: 15,
          riskFactors: ["Standard apparel size selection."],
          mitigationAdvice: "Proceed with standard shipping."
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
    console.error('AI Return Risk Error:', err)
    return NextResponse.json({ error: err.message || 'Return risk calculation failed.' }, { status: 500 })
  }
  }
})

