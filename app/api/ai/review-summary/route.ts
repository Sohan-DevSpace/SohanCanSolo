import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { productName, reviews } = body as any

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          overallSummary: "No customer reviews submitted yet. Be the first to leave a review!",
          pros: ["100% Combed Heavyweight Cotton", "Vivid DTG Print Quality", "Relaxed Streetwear Silhouette"],
          cons: [],
          qualityScore: 95,
          fitScore: 94,
          comfortScore: 98,
          printScore: 96,
          sentimentPercentage: 98
        }
      })
    }

    const systemPrompt = `You are Alpona's AI Review Analytics System.
Analyze the customer reviews for '${productName}' and generate a structured review summary JSON.

Return JSON ONLY with exact keys:
{
  "overallSummary": "Customers overwhelmingly praise the thick 240 GSM organic cotton fabric, crisp DTG graphics, and streetwear drop-shoulder fit.",
  "pros": ["Premium heavyweight fabric", "Vivid long-lasting print", "Comfortable oversized fit"],
  "cons": ["Delivery took 4 days", "Runs slightly loose for slim fits"],
  "qualityScore": 96,
  "fitScore": 92,
  "comfortScore": 98,
  "printScore": 95,
  "sentimentPercentage": 96
}

Rules:
- Keep pros & cons short bullet points (max 4 words each).
- Return ONLY JSON.`

    const userPrompt = `Reviews for ${productName}:\n${JSON.stringify(reviews.map((r: any) => ({ rating: r.rating, text: r.comment || r.text })))}`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 600,
      temperature: 0.3,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'Failed to summarize reviews.' }, { status: 502 })
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
    console.error('AI Review Summarizer Error:', err)
    return NextResponse.json({ error: err.message || 'Review summary failed.' }, { status: 500 })
  }
  }
})

