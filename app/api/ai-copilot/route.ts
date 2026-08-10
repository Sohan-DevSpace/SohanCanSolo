import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateTextWithFailover, parseAIJsonResponse } from '@/lib/ai/provider'
import {
  SHOPPING_ASSISTANT_SYSTEM_PROMPT,
  PRODUCT_RECOMMENDATIONS_SYSTEM_PROMPT,
  FRAUD_RISK_SYSTEM_PROMPT,
  BUSINESS_INSIGHTS_SYSTEM_PROMPT,
  calculateOrderRiskHeuristics,
  OrderRiskInput
} from '@/lib/ai/copilot'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { mode, message, history, productId, categoryId, orderId, ordersList } = body

    if (!mode) {
      return NextResponse.json({ error: 'Missing required field: mode' }, { status: 400 })
    }

    // ─────────────────────────────────────────────────────────────
    // MODE 1: shopping_assistant (Customer-facing)
    // ─────────────────────────────────────────────────────────────
    if (mode === 'shopping_assistant') {
      const userMessage = (message || '').trim()
      if (!userMessage) {
        return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
      }

      // Fetch active catalog slice from Supabase safely
      let products: any[] = []
      try {
        const prodRes = await supabaseAdmin
          .from('products')
          .select('id, name, slug, base_price, description, is_active, category_id, image_url')
          .eq('is_active', true)
          .limit(20)
        if (prodRes.data) {
          products = prodRes.data
        }
      } catch (dbErr) {
        console.warn('[AI COPILOT] Supabase fetch fallback warning:', dbErr)
      }

      const catalogSummary = (products || []).map(p => 
        `ID: ${p.id} | Name: ${p.name} | Price: ₹${p.base_price} | Image: ${p.image_url || 'N/A'} | Desc: ${p.description?.slice(0, 100) || 'N/A'}`
      ).join('\n')

      const promptText = `
Available Catalog Slice:
${catalogSummary}

User Request: "${userMessage}"
Recent Conversation Context: ${JSON.stringify(history || [])}

Provide your recommendation text and select up to 3 matching product IDs from the catalog above.
`

      const aiResponse = await generateTextWithFailover({
        systemPrompt: SHOPPING_ASSISTANT_SYSTEM_PROMPT,
        prompt: promptText,
        maxTokens: 500,
        temperature: 0.7
      })

      if (!aiResponse.success || !aiResponse.text) {
        // Fallback response if AI is unavailable
        const defaultProduct = products?.[0]
        return NextResponse.json({
          success: true,
          text: "I'm having a quick connection moment! Based on our catalog, check out our featured top-quality apparel below.",
          products: defaultProduct ? [{
            id: defaultProduct.id,
            name: defaultProduct.name,
            slug: defaultProduct.slug,
            price: defaultProduct.base_price,
            image_url: defaultProduct.image_url
          }] : []
        })
      }

      const parsed = parseAIJsonResponse(aiResponse.text, {
        text: "Here are some top picks from Alpona that match your style preferences!",
        recommendedProductIds: []
      })

      // Hydrate recommended product cards
      const matchedIds = (parsed.recommendedProductIds || []) as string[]
      let recommendedProducts: any[] = []
      
      if (matchedIds.length > 0) {
        recommendedProducts = (products || []).filter((p: any) => matchedIds.includes(p.id))
      }
      if (recommendedProducts.length === 0 && (products || []).length > 0) {
        recommendedProducts = (products || []).slice(0, 2)
      }

      return NextResponse.json({
        success: true,
        text: parsed.text || "Here are some top recommendations from Alpona!",
        products: recommendedProducts.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.base_price,
          image_url: p.image_url
        }))
      })
    }

    // ─────────────────────────────────────────────────────────────
    // MODE 2: product_recommendations (Customer-facing)
    // ─────────────────────────────────────────────────────────────
    if (mode === 'product_recommendations') {
      let query = supabaseAdmin
        .from('products')
        .select('id, name, slug, base_price, category_id, image_url, description')
        .eq('is_active', true)
        .limit(10)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data: candidates } = await query

      if (!candidates || candidates.length === 0) {
        return NextResponse.json({ success: true, items: [] })
      }

      // Fast category fallback if only 1 item or AI skipped
      const candidateListStr = candidates.map(c => `ID: ${c.id} | Name: ${c.name} | Price: ₹${c.base_price}`).join('\n')

      const promptText = `
Candidate Products:
${candidateListStr}

Target Product ID: ${productId || 'Homepage Feature'}

Select the top 4 products and provide a short 1-line personalized recommendation reason for each.
`

      const aiResponse = await generateTextWithFailover({
        systemPrompt: PRODUCT_RECOMMENDATIONS_SYSTEM_PROMPT,
        prompt: promptText,
        maxTokens: 400,
        temperature: 0.6
      }).catch(() => ({ success: false, text: '' }))

      if (aiResponse.success && aiResponse.text) {
        const parsed = parseAIJsonResponse(aiResponse.text, { recommendations: [] })
        if (parsed.recommendations && parsed.recommendations.length > 0) {
          const items = parsed.recommendations.map((rec: any) => {
            const prod = candidates.find((c: any) => c.id === rec.productId) || candidates[0]
            if (!prod) return null
            return {
              id: prod.id,
              name: prod.name,
              slug: prod.slug,
              price: prod.base_price,
              image_url: prod.image_url,
              reason: rec.reason || "Pairs well with your curated style"
            }
          }).filter(Boolean)

          return NextResponse.json({ success: true, items: items.slice(0, 4) })
        }
      }

      // Fast Fallback: Category-based similarity without AI
      const items = candidates.slice(0, 4).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        price: c.base_price,
        image_url: c.image_url,
        reason: "Popular recommendation in this category"
      }))

      return NextResponse.json({ success: true, items })
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN AUTHENTICATION GUARD (Required for Modes 3 & 4)
    // ─────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || user.user_metadata?.role === 'admin' || user.email?.endsWith('@alpona.in')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 })
    }

    // ─────────────────────────────────────────────────────────────
    // MODE 3: fraud_risk (Admin-facing)
    // ─────────────────────────────────────────────────────────────
    if (mode === 'fraud_risk') {
      let riskInput: OrderRiskInput

      if (orderId) {
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('*, profiles(created_at, email)')
          .eq('id', orderId)
          .single()

        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Fetch customer history aggregate
        const { data: userOrders } = await supabaseAdmin
          .from('orders')
          .select('total, created_at')
          .eq('user_id', order.user_id)

        const pastTotals = (userOrders || []).map(o => Number(o.total) || 0)
        const avgTotal = pastTotals.length > 0 ? pastTotals.reduce((a, b) => a + b, 0) / pastTotals.length : 0

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const recentCount = (userOrders || []).filter(o => o.created_at >= oneDayAgo).length

        riskInput = {
          orderId: order.id,
          orderNumber: order.order_number,
          total: order.total,
          paymentMethod: order.payment_method || 'Razorpay Prepaid',
          createdAt: order.created_at,
          shippingAddress: order.shipping_address || {},
          userEmail: order.profiles?.email,
          userCreatedAt: order.profiles?.created_at,
          customerOrderCount: userOrders?.length || 0,
          customerAvgTotal: avgTotal,
          recentOrdersCount24h: recentCount
        }
      } else {
        // Direct payload analysis for bulk admin rendering
        riskInput = body.orderData || {
          orderId: 'ORD-TMP',
          orderNumber: 'ORD-TMP',
          total: 5000,
          paymentMethod: 'Prepaid',
          createdAt: new Date().toISOString(),
          shippingAddress: {}
        }
      }

      // Compute Heuristics first
      const heuristics = calculateOrderRiskHeuristics(riskInput)

      // Call Gemini for plain-English explanation
      const promptText = `
Order Number: ${riskInput.orderNumber}
Total Amount: ₹${riskInput.total}
Payment Method: ${riskInput.paymentMethod}
Detected Risk Score: ${heuristics.score}/100 (${heuristics.level} Risk)
Detected Risk Signals:
- ${heuristics.signals.join('\n- ')}

Provide a concise, plain-English advisory risk explanation for the admin dashboard.
`

      const aiResponse = await generateTextWithFailover({
        systemPrompt: FRAUD_RISK_SYSTEM_PROMPT,
        prompt: promptText,
        maxTokens: 200,
        temperature: 0.3
      }).catch(() => ({ success: false, text: '' }))

      let explanation = `${heuristics.level} Risk detected based on heuristic transaction signals: ${heuristics.signals.join(', ')}.`

      if (aiResponse.success && aiResponse.text) {
        const parsed = parseAIJsonResponse(aiResponse.text, { explanation: '' })
        if (parsed.explanation) {
          explanation = parsed.explanation
        }
      }

      return NextResponse.json({
        success: true,
        score: heuristics.score,
        level: heuristics.level,
        signals: heuristics.signals,
        explanation
      })
    }

    // ─────────────────────────────────────────────────────────────
    // MODE 4: business_insights (Admin-facing)
    // ─────────────────────────────────────────────────────────────
    if (mode === 'business_insights') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [{ data: orders30 }, { data: orders7 }, { data: orderItems }] = await Promise.all([
        supabaseAdmin.from('orders').select('total, created_at, status, payment_status').gte('created_at', thirtyDaysAgo),
        supabaseAdmin.from('orders').select('total, created_at, status, payment_status').gte('created_at', sevenDaysAgo),
        supabaseAdmin.from('order_items').select('product_name, quantity, total_price').limit(50)
      ])

      const totalRev30 = (orders30 || []).filter(o => o.payment_status === 'paid').reduce((a, b) => a + (Number(b.total) || 0), 0)
      const totalRev7 = (orders7 || []).filter(o => o.payment_status === 'paid').reduce((a, b) => a + (Number(b.total) || 0), 0)
      const totalOrders30 = (orders30 || []).length
      const cancelledCount30 = (orders30 || []).filter(o => o.status === 'cancelled').length

      // Top products summary
      const productCounts: Record<string, number> = {}
      ;(orderItems || []).forEach(item => {
        if (item.product_name) {
          productCounts[item.product_name] = (productCounts[item.product_name] || 0) + (item.quantity || 1)
        }
      })
      const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, qty]) => `${name} (${qty} sold)`)

      const summaryText = `
30-Day Total Revenue: ₹${totalRev30.toLocaleString('en-IN')}
7-Day Total Revenue: ₹${totalRev7.toLocaleString('en-IN')}
Total 30-Day Orders: ${totalOrders30}
30-Day Cancelled/Failed Orders: ${cancelledCount30}
Top Performing Apparel Items: ${topProducts.join(', ') || 'Custom Printed Apparel'}
`

      const aiResponse = await generateTextWithFailover({
        systemPrompt: BUSINESS_INSIGHTS_SYSTEM_PROMPT,
        prompt: `Analyze the following store performance metrics and generate 3 to 4 actionable financial and sales insights:\n${summaryText}`,
        maxTokens: 500,
        temperature: 0.5
      })

      if (!aiResponse.success || !aiResponse.text) {
        return NextResponse.json({
          success: true,
          insights: [
            `Weekly revenue reached ₹${totalRev7.toLocaleString('en-IN')} with strong demand in custom printed apparel.`,
            `Overall 30-day conversion is steady with ${totalOrders30} total orders completed.`,
            `Consider running promotional campaigns on top-selling hoodies and t-shirts to boost average order value.`
          ],
          generatedAt: new Date().toISOString()
        })
      }

      const parsed = parseAIJsonResponse(aiResponse.text, { insights: [] })

      return NextResponse.json({
        success: true,
        insights: parsed.insights && parsed.insights.length > 0 ? parsed.insights : [
          `Weekly revenue stands at ₹${totalRev7.toLocaleString('en-IN')}.`,
          `Apparel category shows consistent customer retention.`,
          `Optimize cart checkout flow to reduce abandoned orders.`
        ],
        generatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: `Invalid mode: ${mode}` }, { status: 400 })

  } catch (error: any) {
    console.error('[AI COPILOT ROUTE ERROR]:', error)
    return NextResponse.json({
      error: 'Internal AI Copilot Error',
      details: error.message || String(error)
    }, { status: 500 })
  }
}
