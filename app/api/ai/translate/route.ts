import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { targetLanguage, textToTranslate, context } = body as any

    if (!textToTranslate || !textToTranslate.trim()) {
      return NextResponse.json({ error: 'Text to translate is required.' }, { status: 400 })
    }

    const lang = targetLanguage || 'Hindi'

    const systemPrompt = `You are Alpona's AI Multilingual Apparel Copywriter & Translator.
Translate the input e-commerce text accurately into ${lang} while retaining premium brand tone, apparel terminology, and natural regional phrasing.

Return JSON ONLY with exact keys:
{
  "targetLanguage": "${lang}",
  "translatedText": "translated text here",
  "originalText": "original text here"
}`

    const userPrompt = `Context: "${context || 'Apparel description/review'}"
Text to translate into ${lang}:
"${textToTranslate}"`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 800,
      temperature: 0.3,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'Translation failed.' }, { status: 502 })
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
    console.error('AI Translate Error:', err)
    return NextResponse.json({ error: err.message || 'Translation failed.' }, { status: 500 })
  }
  }
})

