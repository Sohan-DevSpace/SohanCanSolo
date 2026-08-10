import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTextWithFailover } from '@/lib/ai/provider'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { orderQuery, orderEmail } = body as any

    if (!orderQuery && !orderEmail) {
      return NextResponse.json({ error: 'Order ID, tracking number, or email required.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Query matching order
    const orderNumMatch = orderQuery ? orderQuery.match(/ALP-[\w]+/i)?.[0] : null
    let query = supabase.from('orders').select('*')

    if (orderNumMatch) {
      query = query.ilike('order_number', `%${orderNumMatch}%`)
    } else if (orderQuery && orderQuery.length >= 4) {
      query = query.or(`order_number.ilike.%${orderQuery}%,customer_email.ilike.%${orderQuery}%`)
    } else if (orderEmail) {
      query = query.eq('customer_email', orderEmail)
    }

    const { data: foundOrders } = await query.order('created_at', { ascending: false }).limit(3)

    if (!foundOrders || foundOrders.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: `No active order found matching "${orderQuery || orderEmail}". Please check your order ID (e.g. ALP-104) or order confirmation email.`
      })
    }

    const targetOrder = foundOrders[0]

    const systemPrompt = `You are Alpona's Natural Language Order Tracking Assistant.
Analyze the customer order payload and generate a friendly, accurate order tracking status response with a timeline breakdown.

Return JSON ONLY with exact keys:
{
  "orderNumber": "ALP-104",
  "status": "In Transit",
  "formattedStatus": "Out for Delivery",
  "estimatedDelivery": "3 August 2026",
  "courier": "BlueDart Express",
  "trackingNumber": "BD-8849201",
  "timeline": [
    { "step": "Order Placed", "completed": true, "date": "29 July" },
    { "step": "Quality Inspection & Printed", "completed": true, "date": "30 July" },
    { "step": "Handed to Courier", "completed": true, "date-[#B8763C]": "1 August" },
    { "step": "Out for Delivery", "completed": true, "date": "Today" },
    { "step": "Delivered", "completed": false, "date": "Est. 3 August" }
  ],
  "cancellationEligible": false,
  "returnEligible": true,
  "aiSummary": "Your order #ALP-104 has been printed, inspected, and is currently out for delivery via BlueDart Express! Estimated delivery is by 3 August."
}

Order Data:
${JSON.stringify(targetOrder)}`

    const aiResult = await generateTextWithFailover({
      systemPrompt,
      prompt: `Generate order tracking timeline and response for order ${targetOrder.order_number}`,
      maxTokens: 600,
      temperature: 0.2,
      preferredProvider: 'gemini'
    })

    if (!aiResult.success) {
      return NextResponse.json({
        success: true,
        found: true,
        orderData: targetOrder,
        aiSummary: `Order #${targetOrder.order_number} status is currently ${targetOrder.status}.`
      })
    }

    let text = aiResult.text || ''
    if (text.includes('```')) {
      const match = text.match(/```(?:json)?([\s\S]*?)```/)
      if (match && match[1]) text = match[1].trim()
    }

    const parsed = JSON.parse(text.trim())

    return NextResponse.json({
      success: true,
      found: true,
      data: parsed,
      rawOrder: targetOrder,
      provider: aiResult.provider
    })

  } catch (err: any) {
    console.error('AI Order Tracking Error:', err)
    return NextResponse.json({ error: err.message || 'Order tracking lookup failed.' }, { status: 500 })
  }
  }
})

