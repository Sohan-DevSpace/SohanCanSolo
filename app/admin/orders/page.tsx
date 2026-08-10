import { createClient } from '@/lib/supabase/server'
import { OrdersClient } from './OrdersClient'
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        quantity,
        unit_price,
        total_price,
        product_name,
        design_name,
        size,
        color,
        product_id,
        design_id,
        variant_id,
        products(name, base_price, qikink_product_id),
        product_variants(size, color),
        designs:designs!order_items_design_id_fkey(name, image_url, thumbnail_url)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
  }

  return <OrdersClient initialOrders={orders || []} />
}
