export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import CategoriesClient from './CategoriesClient'

export const metadata = {
  title: 'Categories | Admin Panel',
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  return <CategoriesClient initialCategories={categories || []} />
}

