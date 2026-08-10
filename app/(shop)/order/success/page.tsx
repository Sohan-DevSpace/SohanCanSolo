import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrderSuccessClient } from '@/components/shop/OrderSuccessClient'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_NAME, SITE_URL } from '@/constants/config'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams
  return {
    title: `Order Confirmation ${orderId ? `#${orderId.slice(0, 8)}` : ''} | ${SITE_NAME}`,
    description: 'Thank you for your order! Your apparel is being hand-crafted with custom atelier care.'
  }
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) {
    redirect('/shop')
  }

  const supabase = await createClient()

  // Fetch order details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        designs!order_items_design_id_fkey (image_url),
        products (images)
      ),
      studio_order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
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
