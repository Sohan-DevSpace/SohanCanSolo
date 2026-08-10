export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { CreateProductForm } from '@/app/admin/products/create/CreateProductForm'

export default async function CreateSellerProductPage() {
  const supabase = await createClient()

  // Fetch categories, subcategories, and product types
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('id, category_id, name')
    .order('name')

  const { data: productTypes } = await supabase
    .from('product_types')
    .select('id, subcategory_id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <CreateProductForm 
        categories={categories || []} 
        subcategories={subcategories || []} 
        productTypes={productTypes || []}
        redirectPath="/seller/products"
      />
    </div>
  )
}
