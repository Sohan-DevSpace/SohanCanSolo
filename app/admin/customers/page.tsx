export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { CustomersClient } from './CustomersClient'

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch order history for rich customer insights
  const { data: orders } = await supabase
    .from('orders')
    .select('id, user_id, order_number, total, status, created_at, payment_status')
    .order('created_at', { ascending: false })

  const userOrdersMap: Record<string, any[]> = {}
  const statsMap: Record<string, { count: number; total: number }> = {}

  orders?.forEach(o => {
    if (!o.user_id) return
    
    let userStats = statsMap[o.user_id]
    if (!userStats) {
      userStats = { count: 0, total: 0 }
      statsMap[o.user_id] = userStats
    }
    userStats.count++
    userStats.total += Number(o.total) || 0

    let userOrders = userOrdersMap[o.user_id]
    if (!userOrders) {
      userOrders = []
      userOrdersMap[o.user_id] = userOrders
    }
    userOrders.push(o)
  })

  const customers = (profiles || []).map(p => {
    const stats = statsMap[p.id]
    const orders = userOrdersMap[p.id] || []
    return {
      ...p,
      order_count: stats?.count || 0,
      total_spent: stats?.total || 0,
      orders
    }
  })

  return <CustomersClient customers={customers} />
}
