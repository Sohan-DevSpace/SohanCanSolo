import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderShippingUpdateEmail } from '@/lib/email'
import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { qikinkWebhookSchema } from '@/lib/validation/order'
import crypto from 'crypto'

export const POST = createApiHandler({
  schema: qikinkWebhookSchema,
  auth: 'optional', // Webhook is public but requires signature check
  handler: async ({ req, body }) => {
    try {


      // Signature Verification (Basic check if header exists for now)
      const signature = req.headers.get('x-qikink-signature')
      if (process.env.QIKINK_WEBHOOK_SECRET && signature) {
        const payloadString = JSON.stringify(body)
        const expectedSignature = crypto
          .createHmac('sha256', process.env.QIKINK_WEBHOOK_SECRET)
          .update(payloadString)
          .digest('hex')
        
        // Use a basic length check before timingSafeEqual to avoid errors
        if (expectedSignature.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
          console.warn('[Qikink Webhook] Invalid signature detected')
          return apiError('INVALID_SIGNATURE', 'Invalid webhook signature', 401)
        }
      }

      const {
        qikink_order_id,
        client_order_id,
        status,
        tracking_code,
        courier_name,
        tracking_url
      } = body

      if (!client_order_id && !qikink_order_id) {
        return apiError('MISSING_ORDER_REF', 'Missing order reference', 400)
      }

      // Map Qikink status to Alpona order status
      let mappedStatus = 'processing'
      const statusLower = (status || '').toLowerCase()
      if (statusLower.includes('ship') || statusLower.includes('dispatched')) {
        mappedStatus = 'shipped'
      } else if (statusLower.includes('deliver')) {
        mappedStatus = 'delivered'
      } else if (statusLower.includes('cancel')) {
        mappedStatus = 'cancelled'
      }

      // 1. Find matching order in Supabase
      let query = supabaseAdmin.from('orders').select('*')
      if (client_order_id) {
        query = query.or(`id.eq.${client_order_id},order_number.eq.${client_order_id}`)
      } else {
        query = query.eq('qikink_order_id', qikink_order_id)
      }

      const { data: orders, error: fetchErr } = await query
      if (fetchErr || !orders || orders.length === 0) {
        return apiError('NOT_FOUND', 'Order not found', 404)
      }

      const order = orders[0]

      // 2. Update order record in database
      const updateData: any = {
        status: mappedStatus,
        updated_at: new Date().toISOString()
      }
      if (tracking_code) updateData.tracking_number = tracking_code
      if (courier_name) updateData.courier_name = courier_name
      if (qikink_order_id) updateData.qikink_order_id = qikink_order_id
      if (mappedStatus === 'shipped' && !order.shipped_at) {
        updateData.shipped_at = new Date().toISOString()
      }
      if (mappedStatus === 'delivered' && !order.delivered_at) {
        updateData.delivered_at = new Date().toISOString()
      }

      await supabaseAdmin.from('orders').update(updateData).eq('id', order.id)

      // 3. Send email update to customer if shipped
      if (mappedStatus === 'shipped' && tracking_code) {
        const shippingAddress = order.shipping_address as any
        const customerEmail = shippingAddress?.email || (order.user_id ? (await supabaseAdmin.auth.admin.getUserById(order.user_id)).data?.user?.email : null)
        const customerName = shippingAddress?.full_name || shippingAddress?.name || 'Customer'

        if (customerEmail) {
          await sendOrderShippingUpdateEmail({
            to: customerEmail,
            customerName,
            orderNumber: order.order_number || order.id,
            trackingUrl: tracking_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order`
          }).catch(err => console.error('Error sending shipment email:', err))
        }
      }

      return apiSuccess({ orderId: order.id, status: mappedStatus }, 200)
    } catch (error: any) {
      console.error('Qikink Webhook Error:', error)
      return apiError('WEBHOOK_FAILED', error.message || 'Webhook processing failed', 500)
    }
  }
})
