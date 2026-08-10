'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Package, Heart, Star, Tag, Palette, Award,
  ArrowRight, Truck, ShoppingBag, PenTool, Sparkles,
  CheckCircle2, Clock, Gift, UserPlus, ChevronRight
} from 'lucide-react'
import {
  AnimatedSparkles,
  AnimatedPackage,
  AnimatedHeart,
  AnimatedMapPin,
} from '@/components/shared/AnimatedIcons'

// ── ANIMATION VARIANTS ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } 
  }
}

// ── COUNT-UP HOOK ──
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

// ── STAT CARD COMPONENT ──
function StatCard({ icon, value, label, bgColor, iconBg, delay = 0 }: {
  icon: React.ReactNode, value: number, label: string, bgColor: string, iconBg: string, delay?: number
}) {
  const displayCount = useCountUp(value)
  return (
    <motion.div
      variants={itemVariants}
      className={`${bgColor} rounded-[22px] p-5 border border-[#E8E2DB] shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-default`}
    >
      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform shadow-sm`}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] tracking-tight">{displayCount.toLocaleString()}</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#8C857C] mt-0.5">{label}</p>
    </motion.div>
  )
}

// ── MAIN COMPONENT ──
export default function AccountOverviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([])
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Wishlist from localStorage
      const wishlistRaw = localStorage.getItem('alpona-wishlist')
      let wishlistIds: string[] = []
      if (wishlistRaw) {
        try {
          const parsed = JSON.parse(wishlistRaw)
          wishlistIds = parsed?.state?.itemIds || []
        } catch {}
      }

      const [profileRes, oCountRes, ordersRes, wishProductsRes, aCountRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orders')
          .select(`
            id, order_number, status, total, created_at,
            order_items (
              product_name, design_name, size, color, quantity, unit_price,
              products:product_id ( slug, images )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        wishlistIds.length > 0 
          ? supabase.from('products').select('id, name, slug, images, selling_price').in('id', wishlistIds.slice(0, 3))
          : Promise.resolve({ data: [] }),
        supabase.from('addresses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])

      const profileData = profileRes.data
      const oCount = oCountRes.count
      const ordersData = ordersRes.data
      const wishProducts = wishProductsRes.data
      const aCount = aCountRes.count

      setProfile(profileData)
      setHasProfile(!!(profileData?.full_name && profileData?.phone))
      setRecentOrders(ordersData || [])
      setWishlistProducts(wishProducts || [])
      setStats({
        orders: oCount || 0,
        wishlist: wishlistIds.length,
        addresses: aCount || 0,
      })
      
      setIsLoading(false)
    }
    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <AnimatedSparkles size={32} className="text-[#C87533]" />
        </motion.div>
      </div>
    )
  }

  const statusColors: Record<string, { bg: string, text: string, dot: string }> = {
    pending:   { bg: 'bg-amber-50 border border-amber-200/60', text: 'text-amber-800', dot: 'bg-amber-500' },
    confirmed: { bg: 'bg-blue-50 border border-blue-200/60', text: 'text-blue-800', dot: 'bg-blue-500' },
    shipped:   { bg: 'bg-purple-50 border border-purple-200/60', text: 'text-purple-800', dot: 'bg-purple-500' },
    delivered: { bg: 'bg-emerald-50 border border-emerald-200/60', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    cancelled: { bg: 'bg-rose-50 border border-rose-200/60', text: 'text-rose-800', dot: 'bg-rose-500' },
  }
  const defaultColor = statusColors.pending!
  const confirmedColor = statusColors.confirmed!

  // Build activity timeline from orders
  const activities = recentOrders.slice(0, 4).map((order) => {
    const status = order.status || 'pending'
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={14} />,
      confirmed: <CheckCircle2 size={14} />,
      shipped: <Truck size={14} />,
      delivered: <CheckCircle2 size={14} />,
    }
    const labels: Record<string, string> = {
      pending: `Order ${order.order_number} is being processed`,
      confirmed: `Order ${order.order_number} confirmed`,
      shipped: `Order ${order.order_number} shipped`,
      delivered: `Order ${order.order_number} delivered`,
    }
    return {
      icon: icons[status] || <Clock size={14} />,
      label: labels[status] || `Order ${order.order_number} — ${status}`,
      time: new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      color: statusColors[status] || defaultColor
    }
  })

  // Add default activity items if few orders
  if (activities.length < 3) {
    activities.push(
      { icon: <Gift size={14} />, label: 'Welcome to Alpona! Your journey begins.', time: 'Today', color: confirmedColor },
      { icon: <UserPlus size={14} />, label: 'Complete your profile to unlock rewards', time: 'Now', color: defaultColor },
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-8">

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 1: STATS GRID                      */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Package size={20} className="text-white" />} value={stats.orders} label="Orders Placed" bgColor="bg-[#FAF7F4]" iconBg="bg-[#C87533]" />
          <StatCard icon={<Heart size={20} className="text-white" />} value={stats.wishlist} label="Saved Wishlist" bgColor="bg-[#FAF7F4]" iconBg="bg-[#E8636F]" />
          <StatCard icon={<AnimatedMapPin size={20} className="text-white" />} value={stats.addresses} label="Saved Addresses" bgColor="bg-[#FAF7F4]" iconBg="bg-[#2E3F41]" />
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 2: QUICK ACTIONS                   */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Track Order */}
          <Link href="/account/orders" className="group relative overflow-hidden bg-[#1A1A1A] rounded-[22px] p-6 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all duration-300 border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(200,117,51,0.2)_0%,transparent_70%)] pointer-events-none" />
            <Truck size={22} className="text-[#E8A36E] mb-4 group-hover:translate-x-1 transition-transform" />
            <p className="text-base font-bold text-white mb-0.5">Track Order</p>
            <p className="text-xs text-[#A8A099]">View shipment status</p>
          </Link>

          {/* Browse Collection */}
          <Link href="/shop" className="group relative overflow-hidden bg-gradient-to-br from-[#C87533] to-[#A65E28] rounded-[22px] p-6 hover:shadow-[0_16px_40px_rgba(200,117,51,0.3)] hover:-translate-y-0.5 transition-all duration-300">
            <ShoppingBag size={22} className="text-white mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-base font-bold text-white mb-0.5">Browse Collection</p>
            <p className="text-xs text-white/80">Explore latest drops</p>
          </Link>

          {/* Continue Designing */}
          <Link href="/design-studio" className="group relative overflow-hidden bg-[#F5F1EC] rounded-[22px] p-6 border border-[#E8E2DB] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
            <PenTool size={22} className="text-[#C87533] mb-4 group-hover:rotate-[-8deg] transition-transform" />
            <p className="text-base font-bold text-[#1A1A1A] mb-0.5">Continue Designing</p>
            <p className="text-xs text-[#8C857C]">Pick up where you left</p>
          </Link>

          {/* Start New Design */}
          <Link href="/design-studio" className="group relative overflow-hidden bg-white rounded-[22px] p-6 border border-[#E8E2DB] hover:border-[#C87533]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
            <Sparkles size={22} className="text-[#C87533] mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-base font-bold text-[#1A1A1A] mb-0.5">Start New Design</p>
            <p className="text-xs text-[#8C857C]">Create something unique</p>
          </Link>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 3: RECENT ORDERS + ACTIVITY        */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Recent Orders — 3/5 width */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1A1A1A]">Recent Orders</h2>
            {recentOrders.length > 0 && (
              <Link href="/account/orders" className="text-xs font-bold text-[#C87533] hover:text-[#A65E28] flex items-center gap-1 transition-all duration-200">
                View All <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            /* Empty State */
            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center mb-4 text-[#C87533]">
                <AnimatedPackage size={28} className="text-[#C87533]" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-1">No orders yet</h3>
              <p className="text-xs text-[#8C857C] mb-6 max-w-xs mx-auto leading-relaxed">
                Explore our curated collections and find your next favorite piece.
              </p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#C87533] transition-all duration-300 active:scale-95 shadow-sm">
                <ShoppingBag size={14} /> Explore Collection
              </Link>
            </div>
          ) : (
            /* Order Cards */
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const firstItem = order.order_items?.[0]
                const productImage = firstItem?.products?.images?.[0] || null
                const sc = statusColors[order.status] || defaultColor
                return (
                  <Link key={order.id} href="/account/orders" className="flex items-center gap-4 bg-white border border-[#E8E2DB] rounded-2xl p-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#C87533]/30 transition-all duration-300 group active:scale-[0.98]">
                    {/* Product thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#FAF7F4] border border-[#E8E2DB] overflow-hidden shrink-0 relative">
                      {productImage ? (
                        <Image src={productImage} alt={firstItem?.product_name || 'Product'} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C857C]">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    {/* Order details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate">{firstItem?.product_name || 'Order'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.status}
                        </span>
                        <span className="text-xs text-[#8C857C]">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    {/* Price + arrow */}
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-[#1A1A1A]">₹{Number(order.total).toLocaleString()}</p>
                      <ChevronRight size={16} className="text-[#8C857C] ml-auto mt-1 group-hover:text-[#C87533] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Activity Timeline — 2/5 width */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-[#1A1A1A] mb-4">Recent Activity</h2>
          <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-5">
            <div className="space-y-0">
              {activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  {/* Timeline connector */}
                  {i < activities.length - 1 && (
                    <div className="absolute left-[15px] top-[30px] w-[2px] h-[calc(100%-6px)] bg-[#E8E2DB]" />
                  )}
                  {/* Dot */}
                  <div className={`w-8 h-8 rounded-full ${activity.color.bg} flex items-center justify-center shrink-0 z-10 ${activity.color.text}`}>
                    {activity.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-5">
                    <p className="text-xs font-bold text-[#1A1A1A] leading-snug">{activity.label}</p>
                    <p className="text-[11px] text-[#8C857C] mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 4: ALPONA MEMBER CARD               */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1C1A] via-[#161413] to-[#0E0D0C] rounded-3xl p-8 md:p-10 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
          {/* Glowing background highlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(200,117,51,0.2)_0%,transparent_65%)] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C87533]/20 text-[11px] font-bold text-[#E8A36E] uppercase tracking-wider border border-[#C87533]/30">
                  <Sparkles size={11} /> ALPONA Member
                </span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">Your Creator Summary</h3>
              <p className="text-xs text-[#B3ABA3]">Track your activity, saved items, and exclusive perks</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stats.orders}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8A36E] mt-0.5">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stats.wishlist}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8A36E] mt-0.5">Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stats.addresses}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8A36E] mt-0.5">Addresses</p>
              </div>
            </div>
          </div>

          {/* Benefits row */}
          <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#B3ABA3]">
              <Truck size={14} className="text-[#E8A36E]" />
              <span>Free Shipping over ₹999</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#B3ABA3]">
              <Clock size={14} className="text-[#E8A36E]" />
              <span>7 Days Easy Swaps</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#B3ABA3]">
              <Star size={14} className="text-[#E8A36E]" />
              <span>Custom Workbench Access</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#B3ABA3]">
              <Gift size={14} className="text-[#E8A36E]" />
              <span>VIP Early Drops</span>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
