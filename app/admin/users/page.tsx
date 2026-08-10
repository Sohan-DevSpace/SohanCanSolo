export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { UsersClient } from './UsersClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch all registered user profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch order summary stats to display user activity
  const { data: orderStats } = await supabase
    .from('orders')
    .select('user_id, total')

  const statsMap: Record<string, { count: number; total: number }> = {}
  orderStats?.forEach(o => {
    if (!o.user_id) return
    let userStats = statsMap[o.user_id]
    if (!userStats) {
      userStats = { count: 0, total: 0 }
      statsMap[o.user_id] = userStats
    }
    userStats.count++
    userStats.total += Number(o.total) || 0
  })

  const users = (profiles || []).map(u => ({
    ...u,
    order_count: statsMap[u.id]?.count || 0,
    total_spent: statsMap[u.id]?.total || 0,
  }))

  return <UsersClient users={users} />
}
