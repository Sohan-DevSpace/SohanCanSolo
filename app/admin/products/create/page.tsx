export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { CreateProductForm } from './CreateProductForm'

export default async function CreateProductPage() {
  const supabase = await createClient()

  // Fetch all active & inactive categories, subcategories, and product types for full admin control
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
    <CreateProductForm 
      categories={categories || []} 
      subcategories={subcategories || []} 
      productTypes={productTypes || []}
    />
  )
}
