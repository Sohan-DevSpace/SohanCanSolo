export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { CouponsClient } from './CouponsClient'

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return <CouponsClient coupons={coupons || []} />
}

