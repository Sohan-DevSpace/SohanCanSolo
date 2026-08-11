import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
    try {
      const { imageUrls, categoryName, productName } = (body || {}) as any

      const title = (productName || '').trim()
      const category = (categoryName || 'Streetwear Apparel').trim()
      const images = Array.isArray(imageUrls) ? imageUrls.filter((u: any) => typeof u === 'string' && u.trim().length > 0) : []

      const defaultProductData = {
        name: title || `${category} - Signature Edition`,
        short_description: "Heavyweight 240 GSM organic cotton streetwear graphic tee.",
        description: `## Aesthetic Inspiration\nVisual aesthetic inspired by Indian heritage motifs and contemporary streetwear culture.\n\n## Fit & Silhouette\nSignature relaxed boxy drop-shoulder cut with comfortable layering proportions.\n\n## Fabric Feel\n240 GSM 100% combed ring-spun cotton with ultra-soft lived-in handfeel.\n\n## Styling Advice\nPair with relaxed denim, cargo pants, joggers, or layer under a utility jacket.\n\n## Design Craftsmanship\nHigh-density screen printing crafted ethically and quality tested in India.`,
        material_info: "100% Combed Ring-Spun Cotton, 240 GSM Heavyweight",
        product_care_info: "Machine wash cold inside out with like colors. Line dry in shade. Do not iron directly on graphic print.",
        product_highlights: [
          "240 GSM Heavyweight Premium Cotton",
          "High-Density Graphic Print",
          "Signature Boxy Drop-Shoulder Fit",
          "Ethically Crafted & Quality Tested in India"
        ],
        suggested_base_price: 399,
        suggested_selling_price: 999,
        suggested_compare_at_price: 1499,
        suggested_badges: {
          is_new_arrival: true,
          is_bestseller: false,
          is_trending: true,
          badge_reason: "Fresh release with high aesthetic appeal."
        }
      }

      const systemPrompt = `You are a world-class luxury streetwear copywriter and OCR visual analyst for Alpona (a premium Indian streetwear & custom apparel studio).

CRITICAL GRAPHIC TYPOGRAPHY OCR INSTRUCTION:
1. Examine the uploaded garment image with extreme visual precision.
2. If there is text or typography printed on the garment (including Bengali script like "ভাবছি সিগারেটটা ছেড়েই দেব", Hindi, or English text/motifs), perform OCR and read it verbatim.
3. Transliterate non-English script into standard Romanized text (e.g., "ভাবছি সিগারেটটা ছেড়েই দেব" -> "Bhabchi Cigerette Ta Cherei Debo").
4. Name the product accurately incorporating the read typography quote along with fit details!
   FORMAT FOR "name": "[Transliterated Graphic Quote] – Regular Fit, Round Neck, Half Sleeves" (or Oversized Fit, depending on silhouette).
   Example: "Bhabchi Cigerette Ta Cherei Debo – Regular Fit, Round Neck, Half Sleeves".

CRITICAL REQUIREMENT FOR THE "description" FIELD:
The "description" field MUST be formatted as premium Markdown using EXACTLY these 5 structured headers:

## Aesthetic Inspiration
[High-fashion description of the visual design inspiration, graphic elements, motif, Bengali/Hindi/English typography, mantra, and artistic mood.]

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
  "name": "Bhabchi Cigerette Ta Cherei Debo – Regular Fit, Round Neck, Half Sleeves",
  "short_description": "Punchy 1-line tagline highlighting key aesthetic and weight",
  "description": "## Aesthetic Inspiration\\n[Content]\\n\\n## Fit & Silhouette\\n[Content]\\n\\n## Fabric Feel\\n[Content]\\n\\n## Styling Advice\\n[Content]\\n\\n## Design Craftsmanship\\n[Content]",
  "material_info": "100% Combed Ring-Spun Cotton, 240 GSM Heavyweight",
  "product_care_info": "Machine wash cold inside out with like colors. Do not iron directly on graphic print. Tumble dry low or line dry in shade.",
  "product_highlights": [
    "240 GSM Premium Cotton Fabric",
    "High-Density Screen Print / DTG Graphic",
    "Signature Regular Fit & Round Neck",
    "Ethically Crafted & Quality Tested in India"
  ],
  "suggested_base_price": 399,
  "suggested_selling_price": 899,
  "suggested_compare_at_price": 1499,
  "suggested_badges": {
    "is_new_arrival": true,
    "is_bestseller": false,
    "is_trending": true,
    "badge_reason": "Fresh Bengali typography streetwear release."
  }
}

Do NOT output markdown code fences (\`\`\`json). Output pure JSON.`

      const promptText = `Analyze this apparel product image carefully using OCR. Read any printed typography (such as Bengali text "ভাবছি সিগারেটটা ছেড়েই দেব"). ${title ? `Current title idea: "${title}".` : ''} ${category ? `Category: "${category}".` : ''} Generate complete product details in JSON.`

      const aiResult = await generateTextWithFailover({
        systemPrompt,
        prompt: promptText,
        imageUrls: images,
        maxTokens: 2500,
        temperature: 0.7
      })

      if (!aiResult.success || !aiResult.text) {
        return NextResponse.json({
          success: true,
          data: defaultProductData,
          provider: 'fallback'
        })
      }

      let parsedData = defaultProductData
      try {
        let text = aiResult.text.trim()
        if (text.includes('```')) {
          const match = text.match(/```(?:json)?([\s\S]*?)```/)
          if (match && match[1]) text = match[1].trim()
        }
        parsedData = { ...defaultProductData, ...JSON.parse(text) }
      } catch (parseErr) {
        console.warn('[AI PRODUCT WRITER] Failed to parse JSON, returning default product fallback')
      }

      return NextResponse.json({
        success: true,
        data: parsedData,
        provider: aiResult.provider || 'gemini'
      })

    } catch (error: any) {
      console.error('[AI PRODUCT WRITER ERROR]:', error)
      return NextResponse.json({
        success: true,
        data: {
          name: "Signature Streetwear Oversized Tee",
          short_description: "Heavyweight 240 GSM organic cotton streetwear graphic tee.",
          description: "## Aesthetic Inspiration\nStreetwear motif inspired by Indian heritage and modern cyberpunk art.\n\n## Fit & Silhouette\nSignature relaxed boxy drop-shoulder silhouette.\n\n## Fabric Feel\n240 GSM 100% combed ring-spun cotton with soft luxurious handfeel.\n\n## Styling Advice\nPair with oversized denim, cargo trousers, or layer under an open flannel.\n\n## Design Craftsmanship\nHigh-density screen printing crafted ethically in India.",
          material_info: "100% Combed Ring-Spun Cotton, 240 GSM",
          product_care_info: "Machine wash cold inside out with like colors. Line dry in shade.",
          product_highlights: [
            "240 GSM Heavyweight Premium Cotton",
            "High-Density Graphic Print",
            "Relaxed Boxy Drop-Shoulder Fit",
            "Ethically Crafted in India"
          ],
          suggested_base_price: 399,
          suggested_selling_price: 999,
          suggested_compare_at_price: 1499,
          suggested_badges: {
            is_new_arrival: true,
            is_bestseller: false,
            is_trending: true,
            badge_reason: "Fresh release"
          }
        },
        provider: 'error-fallback'
      })
    }
  }
})
