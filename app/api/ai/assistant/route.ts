import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTextWithFailover, AIMessage } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { messages, userQuery, trackingNumber, orderEmail } = body as any

    if (!userQuery && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Query or messages required.' }, { status: 400 })
    }

    const queryText = userQuery || messages[messages.length - 1]?.content || ''
    const supabase = await createClient()

    // 1. Check if user is asking for order tracking
    const isOrderQuery = /order|track|where|ship|status|delivery|ALP-/i.test(queryText)
    let orderContext = ''

    if (isOrderQuery && (trackingNumber || orderEmail || queryText.includes('ALP-'))) {
      const orderSearchTerm = trackingNumber || (queryText.match(/ALP-[\w]+/i)?.[0])
      
      let query = supabase.from('orders').select('*')
      if (orderSearchTerm) {
        query = query.ilike('order_number', `%${orderSearchTerm}%`)
      } else if (orderEmail) {
        query = query.eq('customer_email', orderEmail)
      }

      const { data: foundOrders } = await query.limit(3)
      if (foundOrders && foundOrders.length > 0) {
        orderContext = `Found matching customer orders: ${JSON.stringify(foundOrders.map(o => ({
          order_number: o.order_number,
          status: o.status,
          created_at: o.created_at,
          tracking_number: o.tracking_number || 'Processing in warehouse',
          courier: o.courier || 'Standard Express',
          estimated_delivery: o.estimated_delivery || '3-5 business days'
        })))}`
      }
    }

    // 2. Query Active Catalog Products from Supabase
    const { data: rawProducts } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, selling_price, compare_at_price, images,
        category:categories(name),
        material_info, product_highlights, is_bestseller, is_new_arrival, is_trending
      `)
      .eq('is_active', true)
      .limit(20)

    const catalogContext = rawProducts ? rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.selling_price,
      compare_at_price: p.compare_at_price,
      category: (p.category as any)?.name || 'Apparel',
      image: p.images?.[0] || '',
      highlights: p.product_highlights || [],
      material: p.material_info || '100% Premium Cotton'
    })) : []

    // 3. System Prompt & Structured Output Requirement
    const systemPrompt = `You are the Alpona AI Assistant—a helpful, friendly, and expert shopping assistant and support agent for Alpona (a premium streetwear & custom merchandise brand).

Your Responsibilities:
1. Understand natural language product requests (colors, price limit, style, oversized fit, occasion, gender).
2. Answer customer questions about products, sizing, order status, return policies, and custom merchandise.
3. Recommend exact relevant products from the catalog context.
4. If checking an order, provide clear tracking estimates and delivery status.
5. If no exact match is found, politely suggest similar items from the catalog.

Store Policies:
- Shipping: Free delivery across India on orders above ₹999. Standard shipping takes 3-5 business days.
- Returns & Exchanges: 7-day hassle-free return policy.
- Fabric Quality: 100% Combed Ring-Spun Heavyweight Cotton (180-240 GSM). Bio-washed & pre-shrunk.

Available Catalog Items:
${JSON.stringify(catalogContext)}

${orderContext ? `Order Information Context:\n${orderContext}` : ''}

Output Format Guidelines:
- Write conversational, concise, and helpful text.
- When recommending products, specify matching product slugs or IDs so the frontend can render product cards.
- End recommendations with helpful next steps or filter suggestions.
- Do NOT hallucinate products outside the available catalog.`

    const formattedMessages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ]

    if (queryText && (!messages || messages.length === 0)) {
      formattedMessages.push({ role: 'user', content: queryText })
    }

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      messages: formattedMessages,
      maxTokens: 1200,
      temperature: 0.7,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'AI service unavailable.' }, { status: 502 })
    }

    const responseText = aiResult.text || ''

    // Match recommended products by name or slug from catalogContext
    const recommendedProducts = catalogContext.filter(p => {
      const lowerText = responseText.toLowerCase()
      const lowerName = p.name.toLowerCase()
      const lowerSlug = p.slug.toLowerCase()
      return lowerText.includes(lowerName) || lowerText.includes(lowerSlug)
    }).slice(0, 4)

    return NextResponse.json({
      success: true,
      message: responseText,
      recommendedProducts,
      provider: aiResult.provider
    })

  } catch (err: any) {
    console.error('AI Assistant Endpoint Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
  }
})

