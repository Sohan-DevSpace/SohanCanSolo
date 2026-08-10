export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CURRENCY_SYMBOL } from '@/constants/config'
import {
  TrendingUp,
  Clock,
  Users,
  Calculator,
  Activity,
  Database,
  ShieldCheck,
  Cpu,
  Star,
  AlertOctagon,
} from 'lucide-react'
import { DashboardChart } from './DashboardChart'
import { AIInsightsCard } from '@/components/admin/AIInsightsCard'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: revToday },
    { data: revWeek },
    { data: revMonth },
    { count: pendingOrdersCount },
    { count: processingOrdersCount },
    { count: shippedOrdersCount },
    { count: totalCustomersCount },
    { data: allPaidOrders },
    { data: liveOrders },
    { data: liveCustomers },
    { data: liveReviews },
    { data: liveFailedPayments },
    { data: last14DaysOrders },
  ] = await Promise.all([
    supabase.from('orders').select('total').gte('created_at', todayStart).eq('payment_status', 'paid').neq('status', 'cancelled'),
    supabase.from('orders').select('total').gte('created_at', oneWeekAgo).eq('payment_status', 'paid').neq('status', 'cancelled'),
    supabase.from('orders').select('total').gte('created_at', oneMonthAgo).eq('payment_status', 'paid').neq('status', 'cancelled'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'shipped'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('payment_status', 'paid').neq('status', 'cancelled'),
    supabase.from('orders').select('id, order_number, total, created_at, status, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('reviews').select('id, rating, comment, created_at, products(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('finance_transactions').select('id, razorpay_payment_id, amount, created_at').eq('status', 'failed').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('created_at, total, status').gte('created_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const revenueToday = revToday?.reduce((acc, o) => acc + Number(o.total), 0) || 0
  const revenueWeekly = revWeek?.reduce((acc, o) => acc + Number(o.total), 0) || 0
  const revenueMonthly = revMonth?.reduce((acc, o) => acc + Number(o.total), 0) || 0

  const totalPaidOrdersCount = allPaidOrders?.length || 0
  const averageOrderValue = totalPaidOrdersCount > 0
    ? allPaidOrders!.reduce((acc, o) => acc + Number(o.total), 0) / totalPaidOrdersCount
    : 0

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const isQikinkConfigured = !!process.env.QIKINK_CLIENT_ID
  const isRazorpayConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch relative z-10">
        <div className="flex-grow bg-[#121214]/80 backdrop-blur-md border border-white/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8763C]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance relative z-10">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1 relative z-10">Overview of your store's performance and activity.</p>
        </div>
        <div className="bg-[#121214]/80 backdrop-blur-md border border-white/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-5 min-w-[280px]">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#B8763C]" /> Gateway Status
          </p>
          <div className="space-y-2.5 text-xs">
            {[
              { name: 'Supabase', icon: Database, ok: isSupabaseConfigured },
              { name: 'Qikink', icon: Cpu, ok: isQikinkConfigured },
              { name: 'Razorpay', icon: ShieldCheck, ok: isRazorpayConfigured },
            ].map(g => (
              <div key={g.name} className="flex items-center justify-between group">
                <span className="text-zinc-400 flex items-center gap-2 group-hover:text-zinc-300 transition-colors">
                  <g.icon className="w-3.5 h-3.5" /> {g.name}
                </span>
                <span className={`flex items-center gap-1.5 text-[11px] font-medium ${g.ok ? 'text-zinc-300' : 'text-rose-400'}`}>
                  {g.ok ? 'Active' : 'Offline'}
                  <span className={`w-1.5 h-1.5 rounded-full ${g.ok ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Financial & Business Insights Card */}
      <AIInsightsCard />

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `${CURRENCY_SYMBOL}${revenueToday.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Active Orders', value: (pendingOrdersCount || 0) + (processingOrdersCount || 0), icon: Clock, color: 'text-amber-500' },
          { label: 'Total Customers', value: totalCustomersCount || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Avg Order Value', value: `${CURRENCY_SYMBOL}${Math.round(averageOrderValue).toLocaleString('en-IN')}`, icon: Calculator, color: 'text-purple-500' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm hover:shadow-xl hover:shadow-[#B8763C]/5 hover:-translate-y-1 rounded-2xl p-5 hover:border-white/[0.08] transition-all duration-300 group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-display font-semibold text-zinc-100 tracking-tight tabular-nums group-hover:text-white transition-colors">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-6 text-balance">Revenue Breakdown</h3>
          <div className="space-y-5">
            {[
              { label: 'Weekly', value: revenueWeekly },
              { label: 'Monthly', value: revenueMonthly },
              { label: 'Shipped', value: shippedOrdersCount || 0, isCurrency: false },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between pb-4 border-b border-white/[0.02] last:border-0 last:pb-0">
                <span className="text-xs text-zinc-400 font-medium">{s.label}</span>
                <span className="text-lg font-display font-semibold text-zinc-100 tabular-nums">
                  {s.isCurrency === false ? s.value : `${CURRENCY_SYMBOL}${s.value.toLocaleString('en-IN')}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <DashboardChart orders={last14DaysOrders || []} />
        </div>
      </div>

      {/* Live Activity Feeds */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Recent Orders */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2 text-balance">
            Recent Orders <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          </h3>
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden divide-y divide-white/[0.02]">
            {liveOrders && liveOrders.length > 0 ? liveOrders.map((o: any) => (
              <Link href="/admin/orders" key={o.id} className="block p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-[#B8763C] transition-colors">{o.order_number}</span>
                  <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">{CURRENCY_SYMBOL}{Number(o.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">{(o.profiles as any)?.full_name || 'Guest'}</span>
                  <span className="text-[10px] text-emerald-400/90 capitalize font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{o.status}</span>
                </div>
              </Link>
            )) : (
              <div className="p-8 text-center text-[11px] text-zinc-500">No recent orders</div>
            )}
          </div>
        </div>

        {/* New Signups */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest text-balance">New Signups</h3>
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden divide-y divide-white/[0.02]">
            {liveCustomers && liveCustomers.length > 0 ? liveCustomers.map((c: any) => (
              <div key={c.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="text-xs font-semibold text-zinc-200 mb-1 group-hover:text-white transition-colors">{c.full_name || 'Anonymous'}</div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">{new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span className="text-zinc-400 capitalize bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.05]">{c.role || 'customer'}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-xs text-zinc-500">No new signups</div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest text-balance">Recent Reviews</h3>
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden divide-y divide-white/[0.02]">
            {liveReviews && liveReviews.length > 0 ? liveReviews.map((r: any) => (
              <div key={r.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex gap-0.5 text-amber-500 mb-1.5 drop-shadow-sm">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="text-xs font-medium text-zinc-300 line-clamp-1 italic mb-1.5 group-hover:text-white transition-colors">"{r.comment}"</div>
                <div className="text-[11px] text-zinc-500 truncate">{(r.products as any)?.name}</div>
              </div>
            )) : (
              <div className="p-8 text-center text-xs text-zinc-500">No reviews yet</div>
            )}
          </div>
        </div>

        {/* Failed Transactions */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest text-balance">Failed Transactions</h3>
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden divide-y divide-white/[0.02]">
            {liveFailedPayments && liveFailedPayments.length > 0 ? liveFailedPayments.map((p: any) => (
              <div key={p.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">{p.razorpay_payment_id}</span>
                  <span className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors">{CURRENCY_SYMBOL}{Number(p.amount)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-rose-400/90 font-medium px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">Failed</span>
                  <span className="text-zinc-500">{new Date(p.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-xs text-zinc-500">No failed transactions</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
