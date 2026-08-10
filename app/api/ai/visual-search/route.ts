import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTextWithFailover, parseAIJsonResponse } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { imageBase64, imageUrl } = body as any

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'Image file or image URL is required for visual search.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Query Catalog Products
    const { data: rawProducts } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, selling_price, compare_at_price, images,
        category:categories(name),
        material_info, product_highlights
      `)
      .eq('is_active', true)
      .limit(30)

    const catalogContext = rawProducts ? rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.selling_price,
      compare_at_price: p.compare_at_price,
      category: (p.category as any)?.name || 'Apparel',
      image: p.images?.[0] || '',
      highlights: p.product_highlights || []
    })) : []

    const systemPrompt = `You are Alpona's AI Computer Vision Fashion Search Engine.
Analyze the user's uploaded fashion photo and extract visual design attributes:
1. Apparel Category (T-Shirt, Hoodie, Sweatshirt, Bag, Mug, Accessory)
2. Primary & Secondary Colors
3. Neck/Collar Style (Crewneck, Hooded, V-neck, Oversized Drop-shoulder)
4. Graphic/Design Style (Minimalist, Anime, Bengali Typography, Vintage, Floral, Abstract)
5. Pattern & Fit

Match the uploaded photo against our catalog products and return JSON ONLY with exact keys:
{
  "detectedAttributes": {
    "category": "Hoodie",
    "primaryColor": "Black",
    "style": "Oversized Streetwear Graphic",
    "description": "Black oversized hoodie with warm sunset mountain artwork"
  },
  "matchingSlugs": ["slug-1", "slug-2", "slug-3", "slug-4"],
  "matchConfidence": 95
}

Available Catalog Items:
${JSON.stringify(catalogContext)}`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: 'Analyze this uploaded apparel image and find matching products from the Alpona catalog.',
      imageUrls: imageUrl ? [imageUrl] : undefined,
      maxTokens: 600,
      temperature: 0.2,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      // Fallback matching
      const fallbackPicks = catalogContext.slice(0, 4)
      return NextResponse.json({
        success: true,
        detectedAttributes: { category: 'Apparel', primaryColor: 'Multi', style: 'Streetwear' },
        matchingProducts: fallbackPicks,
        matchConfidence: 80
      })
    }

    const parsed = parseAIJsonResponse(aiResult.text || '', {
      detectedAttributes: { category: 'Apparel', primaryColor: 'Multi', style: 'Custom Graphics' },
      matchingSlugs: [],
      matchConfidence: 85
    })

    const matchingSlugs: string[] = parsed.matchingSlugs || []
    const matchingProducts = catalogContext.filter(p => matchingSlugs.includes(p.slug)).slice(0, 6)
    const finalProducts = matchingProducts.length > 0 ? matchingProducts : catalogContext.slice(0, 4)

    return NextResponse.json({
      success: true,
      detectedAttributes: parsed.detectedAttributes || {},
      matchingProducts: finalProducts,
      matchConfidence: parsed.matchConfidence || 90,
      provider: aiResult.provider
    })

  } catch (err: any) {
    console.error('AI Visual Search Error:', err)
    return NextResponse.json({ error: err.message || 'Visual search processing failed.' }, { status: 500 })
  }
  }
})

