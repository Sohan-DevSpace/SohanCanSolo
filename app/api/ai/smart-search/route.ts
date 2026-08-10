import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { query } = body as any

    if (!query || !query.trim()) {
      return NextResponse.json({ success: true, correctedQuery: '', suggestions: [] })
    }

    const systemPrompt = `You are Alpona's Smart Search AI.
Analyze user search queries for typos, apparel synonyms, and shopping intent.

Examples:
"blck tshrt" -> corrected: "Black T-Shirt", intent: "t-shirts", suggestions: ["Black Graphic Tee", "Black Oversized Tee", "Streetwear T-Shirt"]
"hoody" -> corrected: "Hoodies", intent: "hoodies", suggestions: ["Oversized Hoodie", "Heavyweight Sweatshirt", "Black Hoodie"]

Return JSON ONLY with exact keys:
{
  "correctedQuery": "Black T-Shirt",
  "detectedCategory": "T-Shirts",
  "suggestions": ["Black Oversized Tee", "Graphic Print Tee", "Minimalist Black Tee"]
}`

    const userPrompt = `Search Query: "${query.trim()}"`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 300,
      temperature: 0.2,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({
        success: true,
        correctedQuery: query,
        suggestions: [query]
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
    console.error('AI Smart Search Error:', err)
    return NextResponse.json({ error: err.message || 'Smart search failed.' }, { status: 500 })
  }
  }
})

