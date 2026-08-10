import { supabaseAdmin } from '@/lib/supabase/admin'
import { createQikinkOrder, QikinkOrderPayload, toQikinkOrderNumber } from '@/lib/qikink'
import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { qikinkCreateOrderSchema } from '@/lib/validation/order'

export const POST = createApiHandler({
  schema: qikinkCreateOrderSchema,
  auth: 'optional', // Called internally mostly
  handler: async ({ body }) => {
    let orderId: string | undefined

    try {
      orderId = body.orderId

      // 1. Fetch order details with all related data
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            design_id,
            design_id_back,
            products (qikink_product_id, images),
            product_variants (qikink_variant_id)
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error(`Failed to fetch order: ${orderError?.message || 'Order not found'}`)
      }

      // 2. Skip this order entirely if fulfillment_type = 'manual'
      if (order.fulfillment_type === 'manual') {
        console.log(`[Qikink] Order ${orderId} is manual. Skipping Qikink push.`)
        return apiSuccess({ skipped: true, reason: 'manual_fulfillment' }, 200)
      }

      // Check if already synced to Qikink
      if (order.qikink_order_id) {
        return apiSuccess({ qikinkOrderId: order.qikink_order_id, alreadySynced: true }, 200)
      }

      // Fetch design image URLs for custom items
      const designIds = (order.order_items || [])
        .flatMap((item: any) => [item.design_id, item.design_id_back])
        .filter(Boolean)

      let designMap: Record<string, string> = {}
      if (designIds.length > 0) {
        const { data: designs } = await supabaseAdmin
          .from('designs')
          .select('id, image_url, thumbnail_url')
          .in('id', designIds)
        
        if (designs) {
          designMap = designs.reduce((acc: any, d: any) => {
            acc[d.id] = d
            return acc
          }, {})
        }
      }

      // 3. Fetch user email for shipping address
      let userEmail = 'customer@example.com'
      if (order.user_id) {
        const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
        if (userAuth?.user?.email) {
          userEmail = userAuth.user.email
        }
      }

      const sa = order.shipping_address as any

      // 4. Map line items to Qikink schema
      const mappedItems = order.order_items.map((item: any) => {
        const isCustom = item.design_id || item.design_id_back
        const sku = item.product_variants?.qikink_variant_id || item.products?.qikink_product_id || ''
        
        const li: any = {
          search_from_my_products: 0 as const,
          sku,
          quantity: item.quantity,
          price: Number(item.unit_price),
          print_type_id: 1, // Default DTG/Sublimation printing
        }

        if (isCustom) {
          const mockupUrl = item.products?.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
          const designs = []

          if (item.design_id && designMap[item.design_id]) {
            const d = designMap[item.design_id] as any
            designs.push({
              design_code: `DFRONT_${item.design_id.slice(-8).toUpperCase()}`,
              placement_sku: 'fr' as const,
              mockup_link: d.thumbnail_url || mockupUrl,
              design_link: d.image_url,
              width_inches: 10,
              height_inches: 12,
            })
          }

          if (item.design_id_back && designMap[item.design_id_back]) {
            const d = designMap[item.design_id_back] as any
            designs.push({
              design_code: `DBACK_${item.design_id_back.slice(-8).toUpperCase()}`,
              placement_sku: 'bk' as const,
              mockup_link: d.thumbnail_url || mockupUrl,
              design_link: d.image_url,
              width_inches: 10,
              height_inches: 12,
            })
          }

          if (designs.length > 0) {
            li.designs = designs
          }
        }

        return li
      })

      const line_items = mappedItems.filter((li: any) => li.sku)
      const missingSkuCount = mappedItems.length - line_items.length

      if (line_items.length === 0) {
        throw new Error('All order items are missing a Qikink SKU. Please ensure product variants have a valid Qikink Variant ID configured in the admin panel.')
      }

      if (missingSkuCount > 0) {
        console.warn(`[Qikink] Warning: Omitted ${missingSkuCount} items without SKUs from order ${orderId} before syncing to Qikink.`)
      }

      const payload: QikinkOrderPayload = {
        order_number: toQikinkOrderNumber(order.order_number),
        qikink_shipping: 1,
        gateway: 'Prepaid',
        total_order_value: parseFloat(order.total),
        line_items,
        shipping_address: {
          first_name: (sa.fullName || sa.name || 'Customer').split(' ')[0],
          last_name: (sa.fullName || sa.name || 'Customer').split(' ').slice(1).join(' ') || 'Customer',
          phone: sa.phone,
          email: userEmail,
          address1: sa.addressLine1 || sa.address1 || sa.address || '',
          address2: sa.addressLine2 || sa.address2 || '',
          city: sa.city,
          province: sa.state || sa.province || '',
          zip: sa.pincode || sa.zip || '',
          country_code: 'IN',
        },
      }

      // 5. Call Qikink API
      const qikinkRes = await createQikinkOrder(payload)

      // 6. Extract the Qikink order ID from response
      const qikinkOrderId = qikinkRes?.id || qikinkRes?.order_id || qikinkRes?.qikink_order_id || String(Date.now())

      // 7. Update order status in Supabase
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          qikink_order_id: qikinkOrderId.toString(),
          status: 'confirmed',
          admin_notes: null // clear any previous errors
        } as any)
        .eq('id', orderId)

      if (updateError) {
        console.error('[Qikink] Failed to update order status after Qikink creation:', updateError)
      }

      return apiSuccess({ qikinkOrderId }, 200)

    } catch (error: any) {
      console.error('[Qikink] Order Creation Route Error:', error.message)

      // Log failure status in DB so admin can identify and retry
      if (orderId) {
        await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'processing_error',
            admin_notes: `[Qikink Sync Error] ${error.message}`
          } as any)
          .eq('id', orderId)
          .then(({ error }) => {
            if (error) console.error('[Qikink] Failed to set processing_error status:', error)
          })
      }

      return apiError('QIKINK_ORDER_CREATION_FAILED', error.message || 'Failed to create Qikink order', 500)
    }
  }
})

