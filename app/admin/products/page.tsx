export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from './ProductsClient'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      subcategory:subcategories(id, name),
      product_type:product_types(id, name),
      product_variants(id, size, color, stock, qikink_variant_id)
    `)
    .order('created_at', { ascending: false })

  return <ProductsClient products={products || []} />
}
