export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import DesignsClient from './DesignsClient'

export const metadata = {
  title: 'Manage Designs - Admin',
}

export default async function AdminDesignsPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const { data: designs } = await supabase
    .from('designs')
    .select(`*, category:categories(name)`)
    .order('created_at', { ascending: false })

  return (
    <DesignsClient 
      initialDesigns={designs || []} 
      categories={categories || []} 
    />
  )
}

