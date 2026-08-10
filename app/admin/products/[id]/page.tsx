import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditProductForm } from './EditProductForm'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`*, product_variants(*), product_designs(design_id)`)
    .eq('id', id)
    .single()

  if (!product) return notFound()

  // Fetch all categories, subcategories, product types for admin edit
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
    <EditProductForm 
      product={product} 
      categories={categories || []} 
      subcategories={subcategories || []} 
      productTypes={productTypes || []}
    />
  )
}
