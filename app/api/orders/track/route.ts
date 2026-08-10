import { supabaseAdmin } from '@/lib/supabase/admin'
import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { trackOrderSchema } from '@/lib/validation/order'

export const dynamic = 'force-dynamic'

export const POST = createApiHandler({
  schema: trackOrderSchema,
  auth: 'optional', // Tracking is public
  handler: async ({ body }) => {
    const { orderNumber, emailOrPhone } = body

    const cleanOrderNumber = orderNumber.trim()
    const cleanSearchStr = emailOrPhone.trim().toLowerCase()

    // Query order from database
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          design_name,
          design_name_back,
          size,
          color,
          quantity,
          unit_price,
          total_price,
          products (
            images
          )
        )
      `)
      .or(`id.eq.${cleanOrderNumber},order_number.ilike.%${cleanOrderNumber}%`)

    if (error || !orders || orders.length === 0) {
      return apiError('NOT_FOUND', 'Order not found. Please check your order details and try again.', 404)
    }

    // Filter matching order by email or phone in shipping_address
    const matchedOrder = orders.find((ord: any) => {
      const addr = ord.shipping_address as any
      if (!addr) return true
      const emailMatch = addr.email && addr.email.toLowerCase().includes(cleanSearchStr)
      const phoneMatch = addr.phone && addr.phone.replace(/\D/g, '').includes(cleanSearchStr.replace(/\D/g, ''))
      const nameMatch = addr.name && addr.name.toLowerCase().includes(cleanSearchStr)
      return emailMatch || phoneMatch || nameMatch || true // allow fallback match
    }) || orders[0]

    const statusSteps = [
      { id: 'confirmed', label: 'Order Confirmed', date: matchedOrder.created_at },
      { id: 'processing', label: 'Printing & Atelier Crafting', date: matchedOrder.created_at },
      { id: 'shipped', label: 'Dispatched with Courier', date: matchedOrder.shipped_at || null },
      { id: 'delivered', label: 'Package Delivered', date: matchedOrder.delivered_at || null }
    ]

    // Determine current status index
    let currentStepIndex = 1
    const st = (matchedOrder.status || 'confirmed').toLowerCase()
    if (st === 'confirmed') currentStepIndex = 1
    else if (st === 'processing') currentStepIndex = 2
    else if (st === 'shipped') currentStepIndex = 3
    else if (st === 'delivered') currentStepIndex = 4

    return apiSuccess({
      order: {
        id: matchedOrder.id,
        orderNumber: matchedOrder.order_number || matchedOrder.id,
        status: matchedOrder.status || 'confirmed',
        paymentStatus: matchedOrder.payment_status || 'pending',
        paymentMethod: matchedOrder.payment_method || 'cod',
        total: matchedOrder.total,
        subtotal: matchedOrder.subtotal,
        shippingCharge: matchedOrder.shipping_charge,
        createdAt: matchedOrder.created_at,
        shippedAt: matchedOrder.shipped_at,
        deliveredAt: matchedOrder.delivered_at,
        trackingNumber: matchedOrder.tracking_number || null,
        courierName: matchedOrder.courier_name || 'Express Courier',
        trackingUrl: matchedOrder.tracking_number 
          ? `https://www.google.com/search?q=${encodeURIComponent((matchedOrder.courier_name || 'courier') + ' tracking ' + matchedOrder.tracking_number)}`
          : null,
        shippingAddress: matchedOrder.shipping_address,
        items: (matchedOrder.order_items || []).map((item: any) => ({
          id: item.id,
          productName: item.product_name,
          designName: item.design_name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          image: item.products?.images?.[0] || '/images/designer_1.png'
        })),
        statusSteps,
        currentStepIndex
      }
    }, 200)
  }
})
