export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import ProductTypesClient from './ProductTypesClient'

export const metadata = {
  title: 'Product Types | Admin Panel',
}

export default async function ProductTypesPage() {
  const supabase = await createClient()

  // Fetch product types with their subcategories and categories
  const { data: productTypes, error } = await supabase
    .from('product_types')
    .select(`
      *,
      subcategories(
        id, 
        name,
        categories(
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching product types:', error)
  }

  // Fetch subcategories for the dropdown
  const { data: subcategories } = await supabase
    .from('subcategories')
    .select(`
      id, 
      name, 
      category_id,
      categories(name)
    `)
    .order('name')

  return (
    <ProductTypesClient 
      initialProductTypes={productTypes || []} 
      subcategories={(subcategories as any) || []} 
    />
  )
}

