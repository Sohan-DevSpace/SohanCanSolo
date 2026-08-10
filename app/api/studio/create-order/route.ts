import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      razorpayPaymentId, 
      razorpayOrderId, 
      razorpaySignature, 
      studioItems,
      addressId
    } = body

    if (!studioItems || studioItems.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // 1. Verify Razorpay signature
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex')

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
      }
    }

    // 2. Calculate totals securely
    let grandTotal = 0
    let totalItems = 0
    studioItems.forEach((item: any) => {
      const quantity = Object.values(item.sizesQuantities).reduce((a: any, b: any) => a + b, 0) as number
      totalItems += quantity
      
      let itemPrice = item.qikinkBasePrice
      if (item.printingType === 'Embroidery') itemPrice += 350
      if (item.printingType === 'DTF') itemPrice += 250
      if (item.designBackUrl && !item.printPositions.includes('back')) itemPrice += 150
      
      grandTotal += itemPrice * quantity
    })

    if (!addressId) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    // Fetch real shipping address from user's addresses
    const { data: address, error: addrError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .single()

    if (addrError || !address) {
      console.error('Failed to fetch address:', addrError)
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 })
    }

    const shippingAddress = {
      name: address.full_name,
      street: `${address.address_line1} ${address.address_line2 || ''}`.trim(),
      city: address.city,
      state: address.state,
      zip: address.pincode,
      country: address.country || 'India',
      phone: address.phone
    }

    // 3. Insert into `orders` table
    const orderNumber = `ORD-STU-${Date.now().toString().slice(-6)}`
    
    const validTotal = isNaN(grandTotal) ? 0 : grandTotal

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal: validTotal,
        total: validTotal,
        payment_status: 'paid',
        status: 'pending',
        shipping_address: shippingAddress,
        is_studio_order: true,
        studio_status: 'pending_review'
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order: ' + JSON.stringify(orderError) }, { status: 500 })
    }

    // 4. Insert into `studio_order_items` table
    const itemsToInsert = studioItems.map((item: any) => ({
      order_id: order.id,
      qikink_product_sku: item.qikinkProductSku,
      qikink_product_name: item.qikinkProductName,
      qikink_collection: item.qikinkCollection,
      design_front_url: item.designFrontUrl || null,
      design_back_url: item.designBackUrl || null,
      design_left_pocket_url: item.designLeftPocketUrl || null,
      print_positions: item.printPositions,
      printing_type: item.printingType,
      selected_colors: item.selectedColors,
      product_base_color: item.productBaseColor,
      sizes_quantities: item.sizesQuantities,
      qikink_base_price: item.qikinkBasePrice,
      print_finish: item.printFinish,
      special_instructions: item.specialInstructions || null,
    }))

    const { error: itemsError } = await supabase
      .from('studio_order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Studio items error:', itemsError)
      return NextResponse.json({ error: 'Failed to insert studio items: ' + JSON.stringify(itemsError) }, { status: 500 })
    }

    // 5. Optionally insert into finance_transactions
    await supabase.from('finance_transactions').insert({
      type: 'income',
      category: 'studio_order',
      amount: grandTotal,
      description: `Studio Order ${orderNumber} via Razorpay`,
      status: 'completed',
      date: new Date().toISOString()
    })

    // (Mocking) Send email notification...

    return NextResponse.json({ success: true, orderId: order.id })
    
  } catch (error) {
    console.error('Studio checkout API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
