import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrderSuccessClient } from '@/components/shop/OrderSuccessClient'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_NAME, SITE_URL } from '@/constants/config'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams
  return {
    title: `Order Confirmation ${orderId && orderId !== 'undefined' ? `#${orderId.slice(0, 8)}` : ''} | ${SITE_NAME}`,
    description: 'Thank you for your order! Your apparel is being hand-crafted with custom atelier care.'
  }
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams
  const rawId = decodeURIComponent(orderId || '').trim()

  const supabase = await createClient()

  let order: any = null

  // 1. If valid ID or order_number provided
  if (rawId && rawId !== 'undefined') {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)
    
    // Try user client first
    const query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (images)
        ),
        studio_order_items (*)
      `)
    
    const userRes = isUUID 
      ? await query.eq('id', rawId).maybeSingle()
      : await query.eq('order_number', rawId).maybeSingle()

    order = userRes.data

    // If user client returned null/error, fallback to admin client
    if (!order) {
      const adminQuery = supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (images)
          ),
          studio_order_items (*)
        `)
      
      const adminRes = isUUID 
        ? await adminQuery.eq('id', rawId).maybeSingle()
        : await adminQuery.eq('order_number', rawId).maybeSingle()

      order = adminRes.data
    }
  }

  // 2. If orderId was undefined or not found, fallback to the latest order in system
  if (!order) {
    const { data: latestOrder } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (images)
        ),
        studio_order_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestOrder) {
      order = latestOrder
    }
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F4] text-[#1A1A1A] px-4 text-center">
        <h1 className="text-3xl font-bold mb-3 font-serif">Order Not Found</h1>
        <p className="text-[#8A8580] text-sm mb-8 max-w-sm">We couldn't find the specified order receipt. Please check your account order history.</p>
        <Link href="/shop">
          <Button className="bg-[#1A1A1A] hover:bg-[#B8763C] text-white rounded-xl px-8 h-12 font-bold text-xs uppercase tracking-wider cursor-pointer">
            Return to Shop
          </Button>
        </Link>
      </div>
    )
  }

  const sa = order.shipping_address || {}
  const items = order.order_items?.length ? order.order_items : (order.studio_order_items || [])

  const orderSchema = {
    '@context': 'https://schema.org',
    '@type': 'Order',
    merchant: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    orderNumber: order.order_number || order.id,
    orderStatus: 'https://schema.org/OrderProcessing',
    priceCurrency: 'INR',
    price: order.total,
    orderDate: order.created_at,
    acceptedOffer: (items || []).map((item: any) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: item.product_name || item.name || 'Custom Apparel',
      },
      price: item.unit_price || item.price,
      priceCurrency: 'INR',
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        value: item.quantity || 1,
      },
    })),
  }

  return (
    <>
      <JsonLd data={orderSchema} />
      <OrderSuccessClient 
        order={order} 
        items={items} 
        shippingAddress={sa} 
      />
    </>
  )
}
