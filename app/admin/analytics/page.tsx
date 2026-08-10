export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { TrendingUp, ShoppingBag, Package, Users, AlertTriangle } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: monthlyOrders },
    { data: ordersByStatus },
    { data: topProducts },
    { data: newCustomers },
  ] = await Promise.all([
    supabase.from('orders').select('created_at, total, status, payment_status').gte('created_at', thirtyDaysAgo),
    supabase.from('orders').select('status'),
    supabase.from('order_items').select('product_name, quantity, total_price').limit(100),
    supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo),
  ])

  const paidOrders = monthlyOrders?.filter(o => o.payment_status === 'paid') || []
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = paidOrders.length
  const failedCount = monthlyOrders?.filter(o => o.payment_status === 'failed').length || 0

  // Status breakdown
  const statusCounts: Record<string, number> = {}
  ordersByStatus?.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })

  // Top products
  const productRevenue: Record<string, { qty: number; revenue: number }> = {}
  topProducts?.forEach(item => {
    const name = item.product_name || 'Unknown'
    if (!productRevenue[name]) productRevenue[name] = { qty: 0, revenue: 0 }
    productRevenue[name].qty += item.quantity || 0
    productRevenue[name].revenue += Number(item.total_price) || 0
  })
  const topProductsList = Object.entries(productRevenue)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8)

  // Daily revenue chart
  const dailyRevenue: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyRevenue[d.toISOString().substring(0, 10)] = 0
  }
  paidOrders.forEach(o => {
    const key = o.created_at.substring(0, 10)
    dailyRevenue[key] = (dailyRevenue[key] || 0) + Number(o.total)
  })
  const chartEntries = Object.entries(dailyRevenue)
  const maxRevenue = Math.max(...Object.values(dailyRevenue), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white ">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Revenue, orders, and customer insights — last 30 days.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: `${CURRENCY_SYMBOL}${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Paid Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
          { label: 'New Customers', value: newCustomers?.length || 0, icon: Users, color: 'text-purple-500' },
          { label: 'Failed Payments', value: failedCount, icon: AlertTriangle, color: 'text-rose-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#121214] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-colors">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100 font-mono tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-5">Daily Revenue — 30 Days</h3>
        <div className="flex items-end gap-[2px] h-40">
          {chartEntries.map(([date, value], i) => (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div
                className="w-full bg-[#B8763C]/20 hover:bg-[#B8763C]/40 rounded-t transition-colors duration-150 min-h-[2px]"
                style={{ height: `${Math.max((value / maxRevenue) * 100, 2)}%` }}
                title={`${new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}: ${CURRENCY_SYMBOL}${value.toLocaleString('en-IN')}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-zinc-600">
          <span>{new Date(chartEntries[0]?.[0] || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
          <span>{new Date(chartEntries[chartEntries.length - 1]?.[0] || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by Status */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 capitalize font-medium">{status}</span>
                    <span className="text-zinc-500 font-mono">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#B8763C]/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Top Products by Revenue</h3>
          <div className="space-y-3">
            {topProductsList.length > 0 ? topProductsList.map(([name, data], i) => (
              <div key={name} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-600 font-mono w-4">{i + 1}.</span>
                  <span className="text-xs text-zinc-200 font-medium truncate max-w-[200px]">{name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-white">{CURRENCY_SYMBOL}{data.revenue.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-zinc-500 ml-2">{data.qty} sold</span>
                </div>
              </div>
            )) : (
              <p className="text-[11px] text-zinc-500">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

