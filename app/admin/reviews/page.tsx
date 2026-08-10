export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { ReviewsClient } from './ReviewsClient'

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, product:products(name), profiles(full_name)`)
    .order('created_at', { ascending: false })

  return <ReviewsClient reviews={reviews || []} />
}

