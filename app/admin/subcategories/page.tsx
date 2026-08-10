export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import SubcategoriesClient from './SubcategoriesClient'

export const metadata = {
  title: 'Subcategories | Admin Panel',
}

export default async function SubcategoriesPage() {
  const supabase = await createClient()

  // Fetch categories for the parent dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Fetch subcategories
  const { data: subcategories, error } = await supabase
    .from('subcategories')
    .select(`
      *,
      categories(name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subcategories:', error)
  }

  return (
    <SubcategoriesClient 
      initialSubcategories={subcategories || []} 
      categories={categories || []} 
    />
  )
}

