import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTextWithFailover, parseAIJsonResponse } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { viewedSlugs, searchTerms, likedCategories, preferredColors } = body as any
    const supabase = await createClient()

    // Fetch catalog products
    const { data: rawProducts } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, selling_price, compare_at_price, images,
        category:categories(name),
        material_info, product_highlights, is_bestseller, is_new_arrival, is_trending
      `)
      .eq('is_active', true)
      .limit(30)

    if (!rawProducts || rawProducts.length === 0) {
      return NextResponse.json({ success: true, recommendedProducts: [], explanation: 'Explore catalog items to build your Design DNA profile.' })
    }

    const catalog = rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.selling_price,
      compare_at_price: p.compare_at_price,
      category: (p.category as any)?.name || 'Apparel',
      image: p.images?.[0] || '',
      highlights: p.product_highlights || []
    }))

    const systemPrompt = `You are Alpona's Design DNA Recommendation Engine.
Analyze user interaction signals (recently viewed slugs, search queries, liked categories, color preferences) and match them with catalog products.

Return JSON ONLY with exact fields:
{
  "explanation": "Recommended because you frequently browse Japanese Streetwear & Dark Minimalist graphics.",
  "topPickSlugs": ["slug-1", "slug-2", "slug-3", "slug-4"]
}

Available Catalog Items:
${JSON.stringify(catalog)}`

    const userPrompt = `User Behavioral Signals:
- Recently Viewed Slugs: ${JSON.stringify(viewedSlugs || [])}
- Search History: ${JSON.stringify(searchTerms || [])}
- Liked Categories: ${JSON.stringify(likedCategories || [])}
- Preferred Colors: ${JSON.stringify(preferredColors || [])}`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: userPrompt,
      maxTokens: 500,
      temperature: 0.4,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      // Fallback: return bestsellers
      const fallbackPicks = catalog.slice(0, 4)
      return NextResponse.json({
        success: true,
        recommendedProducts: fallbackPicks,
        explanation: 'Trending popular choices curated for you.'
      })
    }

    const parsed = parseAIJsonResponse(aiResult.text || '', {
      explanation: 'Curated personalized picks based on your browsing style.',
      topPickSlugs: []
    })

    const topSlugs: string[] = parsed.topPickSlugs || []

    const recommendedProducts = catalog.filter(p => topSlugs.includes(p.slug)).slice(0, 4)
    const finalProducts = recommendedProducts.length > 0 ? recommendedProducts : catalog.slice(0, 4)

    return NextResponse.json({
      success: true,
      recommendedProducts: finalProducts,
      explanation: parsed.explanation || 'Curated personalized picks based on your browsing style.',
      provider: aiResult.provider
    })

  } catch (err: any) {
    console.error('AI Design DNA Error:', err)
    return NextResponse.json({ error: err.message || 'Design DNA calculation failed.' }, { status: 500 })
  }
  }
})

