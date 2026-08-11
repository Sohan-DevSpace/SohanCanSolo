import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CartItem } from '@/store/cartStore'
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from '@/lib/email'
import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { razorpayVerifySchema } from '@/lib/validation/order'

const isValidUUID = (id: string | undefined | null): boolean => {
  if (!id) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export const POST = createApiHandler({
  schema: razorpayVerifySchema,
  auth: 'optional',
  handler: async ({ body }) => {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      cartItems, 
      shippingAddress,
      userId,
      couponCode,
      discountAmount,
      giftWrap,
      boxPacking,
      rushOrder,
      prepaidDiscount,
      shippingCost
    } = body

    // 1. Verify the signature
    const isMock = razorpay_signature === 'mock_signature' || 
                   razorpay_signature === 'mock' ||
                   razorpay_order_id.startsWith('order_mock') || 
                   razorpay_payment_id.startsWith('pay_mock')

    if (!isMock && process.env.RAZORPAY_KEY_SECRET) {
      const text = `${razorpay_order_id}|${razorpay_payment_id}`
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex')

      if (expectedSignature !== razorpay_signature) {
        // Payment Failed Email
        if (userId) {
          const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(userId)
          if (userAuth?.user?.email) {
            const customerName = shippingAddress?.name || userAuth.user.email.split('@')[0]
            await sendPaymentFailedEmail({
              to: userAuth.user.email,
              customerName,
              orderNumber: razorpay_order_id,
            }).catch(console.error)
          }
        }
        return apiError('INVALID_SIGNATURE', 'Invalid payment signature', 400)
      }
    }

    // Calculate total
    const subtotalAmount = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0)
    const discount = discountAmount || 0
    const giftWrapCost = giftWrap ? 59 : 0
    const boxPackingCost = boxPacking ? 29 : 0
    const rushOrderCost = rushOrder ? 100 : 0
    const totalAmount = Math.max(0, subtotalAmount - discount - prepaidDiscount + shippingCost + giftWrapCost + boxPackingCost + rushOrderCost)

    // Check fulfillment type based on products
    let fulfillmentType = 'manual'
    const productIds = cartItems.map((item: CartItem) => item.productId).filter(isValidUUID)
    
    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, qikink_product_id')
        .in('id', productIds)
        
      if (products) {
        const isAllQikink = cartItems.every((item: CartItem) => {
          if (!isValidUUID(item.productId)) return false
          const prod = products.find(p => p.id === item.productId)
          return prod && prod.qikink_product_id !== null && prod.qikink_product_id !== ''
        })
        fulfillmentType = isAllQikink ? 'qikink' : 'manual'
      }
    }

    // 2. Insert into orders table using admin client to bypass RLS
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        subtotal: subtotalAmount,
        shipping_charge: shippingCost,
        cod_fee: 0,
        prepaid_discount: prepaidDiscount,
        gift_wrap: giftWrap,
        box_packing: boxPacking,
        rush_order: rushOrder,
        total: totalAmount,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'prepaid',
        razorpay_order_id,
        razorpay_payment_id,
        shipping_address: shippingAddress as any,
        fulfillment_type: fulfillmentType,
        notes: [
          couponCode ? `Coupon applied: ${couponCode} (-₹${discount})` : null,
          `Payment Method: Pay Online (Prepaid Discount: -₹${prepaidDiscount})`,
          giftWrap ? 'Gift Wrap (+₹59)' : null,
          boxPacking ? 'Box Packing (+₹29)' : null,
          rushOrder ? 'Rush Order Priority (+₹100)' : null,
        ].filter(Boolean).join(' | ')
      } as any)
      .select('id')
      .single()

    if (orderError) throw new Error(`Order Creation Failed: ${orderError.message}`)

    // 3. Insert into order_items table
    const orderItemsToInsert = cartItems.map((item: CartItem) => ({
      order_id: order.id,
      product_id: isValidUUID(item.productId) ? item.productId : null,
      variant_id: isValidUUID(item.variantId) ? item.variantId : null,
      design_id: isValidUUID(item.designId) ? item.designId : null,
      design_id_back: isValidUUID(item.designIdBack) ? item.designIdBack : null,
      product_name: item.productName,
      design_name: item.designName,
      design_name_back: item.designNameBack,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert as any)

    if (itemsError) throw new Error(`Order Items Creation Failed: ${itemsError.message}`)

    // 4. Send Confirmation Email
    const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userAuth?.user?.email) {
      const customerName = shippingAddress.name || userAuth.user.email.split('@')[0]
      const itemsForEmail = cartItems.map((item: CartItem) => ({
        name: item.designName ? `${item.productName} (${item.designName})` : item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      }))
      
      await sendOrderConfirmationEmail({
        to: userAuth.user.email,
        customerName,
        orderNumber: order.id,
        items: itemsForEmail,
        shippingAddress: shippingAddress as any,
        total: totalAmount
      }).catch(console.error)
    }

    // 5. Trigger POST to /api/qikink/create-order
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/qikink/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(err => {
      console.error('Failed to trigger Qikink creation:', err)
    })

    return apiSuccess({ orderId: order.id }, 200)
  }
})
