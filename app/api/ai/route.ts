import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export async function POST(req: Request) {
  try {
    const { mode = 'slogan', topic = 'streetwear', prompt: userPrompt } = await req.json()

    let systemPrompt = ''
    let prompt = ''

    if (mode === 'svg') {
      systemPrompt = `You are a world-class graphic designer specializing in vector artwork for print-on-demand t-shirts and hoodies.
Generate ONLY valid, clean, production-ready SVG code.
Do NOT include any markdown block syntax (like \`\`\`xml or \`\`\`svg), do NOT include explanations, do NOT include HTML wrappers.
Return ONLY raw <svg>...</svg> text.`
      prompt = userPrompt || `Create a vector graphic for ${topic}`
    } else if (mode === 'chat') {
      systemPrompt = `You are Alpona Assistant, an AI streetwear and print-on-demand expert. Be helpful, concise, and creative.`
      prompt = userPrompt
    } else {
      systemPrompt = `You are a creative copywriter for a high-end streetwear brand.
Generate 5 catchy, powerful slogans or quotes for print-on-demand t-shirts based on the topic.
Return ONLY a raw JSON array of strings, e.g. ["Slogan 1", "Slogan 2"]. No markdown formatting.`
      prompt = `Topic: ${topic}`
    }

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt,
      maxTokens: mode === 'svg' ? 2000 : 500,
      temperature: 0.7,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'AI generation failed.' }, { status: 502 })
    }

    let text = aiResult.text || ''

    if (mode === 'svg') {
      text = text.trim()
      if (text.includes('```')) {
        const match = text.match(/```(?:xml|svg)?([\s\S]*?)```/)
        if (match && match[1]) {
          text = match[1].trim()
        }
      }
      const svgStartIndex = text.indexOf('<svg')
      if (svgStartIndex !== -1) {
        text = text.substring(svgStartIndex)
      }
      const svgEndIndex = text.lastIndexOf('</svg>')
      if (svgEndIndex !== -1) {
        text = text.substring(0, svgEndIndex + 6)
      }

      const base64Svg = Buffer.from(text).toString('base64')
      const dataUri = `data:image/svg+xml;base64,${base64Svg}`

      return NextResponse.json({
        success: true,
        dataUri,
        rawSvg: text,
        provider: aiResult.provider
      })
    } else if (mode === 'chat') {
      return NextResponse.json({
        success: true,
        message: text,
        provider: aiResult.provider
      })
    } else {
      text = text.trim()
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/)
        if (match && match[1]) {
          text = match[1].trim()
        }
      }
      try {
        const parsed = JSON.parse(text)
        return NextResponse.json({
          success: true,
          slogans: parsed,
          provider: aiResult.provider
        })
      } catch (e) {
        return NextResponse.json({
          success: true,
          slogans: [text],
          provider: aiResult.provider
        })
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
