import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderShippingUpdateEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    console.log('Shiprocket Webhook Payload:', payload)

    const {
      order_id,
      awb,
      courier_name,
      current_status,
      etd
    } = payload

    if (!order_id && !awb) {
      return NextResponse.json({ error: 'Missing tracking reference' }, { status: 400 })
    }

    let mappedStatus = 'processing'
    const statusLower = (current_status || '').toLowerCase()
    if (statusLower.includes('shipped') || statusLower.includes('in transit') || statusLower.includes('out for delivery')) {
      mappedStatus = 'shipped'
    } else if (statusLower.includes('delivered')) {
      mappedStatus = 'delivered'
    } else if (statusLower.includes('canceled') || statusLower.includes('rto')) {
      mappedStatus = 'cancelled'
    }

    // Query order
    let query = supabaseAdmin.from('orders').select('*')
    if (order_id) {
      query = query.or(`id.eq.${order_id},order_number.eq.${order_id}`)
    } else {
      query = query.eq('tracking_number', awb)
    }

    const { data: orders, error: fetchErr } = await query
    if (fetchErr || !orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    const updateData: any = {
      status: mappedStatus,
      updated_at: new Date().toISOString()
    }
    if (awb) updateData.tracking_number = awb
    if (courier_name) updateData.courier_name = courier_name
    if (mappedStatus === 'shipped' && !order.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    }
    if (mappedStatus === 'delivered' && !order.delivered_at) {
      updateData.delivered_at = new Date().toISOString()
    }

    await supabaseAdmin.from('orders').update(updateData).eq('id', order.id)

    // Notify customer
    if (mappedStatus === 'shipped' && awb) {
      const shippingAddress = order.shipping_address as any
      const customerEmail = shippingAddress?.email || (order.user_id ? (await supabaseAdmin.auth.admin.getUserById(order.user_id)).data?.user?.email : null)
      const customerName = shippingAddress?.full_name || shippingAddress?.name || 'Customer'

      if (customerEmail) {
        await sendOrderShippingUpdateEmail({
          to: customerEmail,
          customerName,
          orderNumber: order.order_number || order.id,
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order`
        }).catch(console.error)
      }
    }

    return NextResponse.json({ success: true, orderId: order.id, status: mappedStatus })
  } catch (error: any) {
    console.error('Shiprocket Webhook Error:', error)
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 })
  }
}
