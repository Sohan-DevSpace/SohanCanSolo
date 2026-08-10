import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { imageUrls, categoryName, productName } = body as any

    if ((!imageUrls || imageUrls.length === 0) && !productName && !categoryName) {
      return NextResponse.json({ error: 'At least one image URL, product name, or category is required.' }, { status: 400 })
    }

    const systemPrompt = `You are a world-class luxury streetwear copywriter for Alpona (a premium streetwear & custom merchandise brand).
Analyze the uploaded product image(s) visually, along with any provided title/category.
Generate rich, high-converting, professional e-commerce product details in strictly valid JSON format.

CRITICAL REQUIREMENT FOR THE "description" FIELD:
The "description" field MUST be formatted as premium Markdown using EXACTLY these 5 structured headers:

## Aesthetic Inspiration
[High-fashion description of the visual design inspiration, graphic elements, motif, typography, mantra, and artistic mood.]

## Fit & Silhouette
[Details on relaxed boxy drop-shoulder cut, streetwear silhouette, drape, and comfortable layering proportions.]

## Fabric Feel
[Specific material details, e.g. 100% combed ring-spun cotton, ultra-heavyweight GSM, soft lived-in feel, and substantial durability.]

## Styling Advice
[Actionable styling suggestions, e.g. pairing with high-waisted denim, joggers, cargo pants, jackets, and minimalist accessories.]

## Design Craftsmanship
[Description of print technique like high-density screen printing or DTG, crisp lines, vibrant contrast, and Alpona's commitment to ethical Indian production.]

Return ONLY a JSON object matching this exact schema:
{
  "name": "Catchy Product Title (e.g. Tokyo Cyberpunk Heavyweight Oversized Hoodie)",
  "short_description": "Punchy 1-line tagline highlighting key aesthetic and weight",
  "description": "## Aesthetic Inspiration\\n[Content]\\n\\n## Fit & Silhouette\\n[Content]\\n\\n## Fabric Feel\\n[Content]\\n\\n## Styling Advice\\n[Content]\\n\\n## Design Craftsmanship\\n[Content]",
  "material_info": "100% Combed Ring-Spun Cotton, 400 GSM Ultra-Heavyweight",
  "product_care_info": "Machine wash cold inside out with like colors. Do not iron directly on graphic print. Tumble dry low or line dry in shade.",
  "product_highlights": [
    "400 GSM Ultra-Heavyweight Premium Cotton",
    "High-Density Screen Print / DTG Graphic",
    "Signature Relaxed Boxy Drop-Shoulder Silhouette",
    "Ethically Crafted & Quality Tested in India"
  ],
  "suggested_base_price": 799,
  "suggested_selling_price": 1499,
  "suggested_compare_at_price": 2499,
  "suggested_badges": {
    "is_new_arrival": true,
    "is_bestseller": false,
    "is_trending": true,
    "badge_reason": "Fresh streetwear release with high aesthetic appeal."
  }
}

Do NOT output markdown code fences (\`\`\`json). Output pure JSON.`

    const promptText = `Analyze this apparel product image. ${productName ? `Current title idea: "${productName}".` : ''} ${categoryName ? `Category: "${categoryName}".` : ''} Generate complete product details in JSON.`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: promptText,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      maxTokens: 2500,
      temperature: 0.7
    })

    if (!aiResult.success || !aiResult.text) {
      return NextResponse.json({ error: aiResult.error || 'Failed to generate product details' }, { status: 502 })
    }

    let text = aiResult.text.trim()
    if (text.includes('```')) {
      const match = text.match(/```(?:json)?([\s\S]*?)```/)
      if (match) {
        if (match && match[1]) text = match[1].trim()
      }
    }

    try {
      const parsedData = JSON.parse(text)
      return NextResponse.json({
        success: true,
        data: parsedData,
        provider: aiResult.provider
      })
    } catch (parseErr) {
      console.error('[AI PRODUCT WRITER] Failed to parse JSON response:', text)
      return NextResponse.json({ error: 'Failed to format product details as JSON.' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('[AI PRODUCT WRITER ERROR]:', error)
    return NextResponse.json({ error: error.message || 'AI Generation failed' }, { status: 500 })
  }
  }
})

