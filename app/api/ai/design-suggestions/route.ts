import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { themePrompt, apparelCategory } = body as any

    if (!themePrompt || !themePrompt.trim()) {
      return NextResponse.json({ error: 'Theme prompt or concept keyword is required.' }, { status: 400 })
    }

    const systemPrompt = `You are Alpona's AI Design Copilot & Creative Director.
Generate streetwear graphic ideas, typography concepts, slogans, and color palettes based on the user's theme.

Return JSON ONLY with exact keys:
{
  "themeTitle": "Minimalist Cyberpunk Peak",
  "artworkPrompt": "A futuristic geometric mountain silhouette with neon cyan sunrise grid and Japanese kanji typography.",
  "sloganIdeas": [
    { "text": "THE HARDEST CLIMB PREPARES THE BEST VIEW", "style": "Inspirational Bold" },
    { "text": "NEON SUMMIT 2088", "style": "Cyber Streetwear" }
  ],
  "colorPalette": [
    { "name": "Obsidian Black", "hex": "#121214" },
    { "name": "Warm Sunset Gold", "hex": "#B8763C" },
    { "name": "Neon Cyan", "hex": "#00F0FF" },
    { "name": "Cream Canvas", "hex": "#FAF7F4" }
  ],
  "fontPairings": ["Cormorant Garamond (Serif Display)", "Manrope (Bold Sans)"]
}`

    const userPrompt = `Theme Concept: "${themePrompt.trim()}", Category: "${apparelCategory || 'T-Shirt'}"`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 600,
      temperature: 0.7,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'Failed to generate design suggestions.' }, { status: 502 })
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
    console.error('AI Design Suggestions Error:', err)
    return NextResponse.json({ error: err.message || 'Design suggestion processing failed.' }, { status: 500 })
  }
  }
})

