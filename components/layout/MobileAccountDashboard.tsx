'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  ChevronLeft, ChevronRight, PenLine, HeadphonesIcon, Smartphone, Globe, 
  ShieldCheck, MessageSquare, HelpCircle, FileText, Sparkles, Star,
  Package, Heart, Award, Tag, Palette, Truck, ShoppingBag, PenTool,
  ArrowRight, CheckCircle2, Clock, Gift, UserPlus, ChevronRight as ChevRight
} from 'lucide-react'
import {
  AnimatedMapPin,
  AnimatedPackage,
  AnimatedHeart,
  AnimatedSettings,
  AnimatedLogOut,
  AnimatedUser,
  AnimatedTag,
  AnimatedSparkles,
} from '@/components/shared/AnimatedIcons'

interface MobileLayoutManagerProps {
  fullName: string
  avatarUrl: string | null
  orderCount: number
  addressCount: number
  children: ReactNode
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning,'
  if (hour < 17) return 'Good Afternoon,'
  return 'Good Evening,'
}

// ── COUNT-UP HOOK ──
function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

export function MobileAccountDashboard({ fullName, avatarUrl, orderCount, addressCount, children }: MobileLayoutManagerProps) {
  const pathname = usePathname()
  const isRoot = pathname === '/account'

  // State for dynamic data
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isRoot) return
    let cancelled = false
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      // Recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`id, order_number, status, total, created_at, order_items ( product_name, products:product_id ( images ) )`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2)

      if (cancelled) return
      setRecentOrders(ordersData || [])

      // Wishlist count from localStorage
      const wishlistRaw = localStorage.getItem('alpona-wishlist')
      if (wishlistRaw) {
        try {
          const parsed = JSON.parse(wishlistRaw)
          if (!cancelled) {
            setWishlistCount(parsed?.state?.itemIds?.length || 0)
          }
        } catch {}
      }
      if (!cancelled) {
        setIsLoaded(true)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [isRoot])

  if (!isRoot) {
    let pageTitle = 'Account'
    if (pathname.includes('/orders')) pageTitle = 'Orders'
    else if (pathname.includes('/addresses')) pageTitle = 'Addresses'
    else if (pathname.includes('/wishlist')) pageTitle = 'Wishlist'
    else if (pathname.includes('/coupons')) pageTitle = 'Coupons'
    else if (pathname.includes('/settings')) pageTitle = 'Settings'
    else if (pathname.includes('/devices')) pageTitle = 'Manage Devices'
    else if (pathname.includes('/language')) pageTitle = 'Language & Region'
    else if (pathname.includes('/privacy')) pageTitle = 'Privacy Center'
    else if (pathname.includes('/reviews')) pageTitle = 'My Reviews'
    else if (pathname.includes('/qa')) pageTitle = 'Questions & Answers'
    else if (pathname.includes('/seller-hub')) pageTitle = 'Seller Hub'
    else if (pathname.includes('/legal')) pageTitle = 'Legal & Policies'
    else if (pathname.includes('/faq')) pageTitle = 'FAQ'
    else if (pathname.includes('/profile')) pageTitle = 'Edit Profile'

    return (
      <div className="flex flex-col min-h-[calc(100vh-100px)] animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="sticky top-0 z-50 bg-[#FAF7F4] pt-2 pb-6 flex items-center gap-4">
          <Link href="/account" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E8E2DB] text-[#1A1A1A] hover:bg-neutral-50 active:scale-95 transition-all">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-serif font-bold text-[#1A1A1A]">{pageTitle}</h1>
        </div>
        {children}
      </div>
    )
  }

  const greeting = getTimeGreeting()

  const statusColors: Record<string, { bg: string, text: string, dot: string }> = {
    pending:   { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
    shipped:   { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* ═══ SECTION 1: HERO BANNER ═══ */}
      <div className="relative pt-4 pb-6 rounded-[28px] overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FAF7F4] to-[#F5EDE3] border border-[#E8E2DB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] -mx-1 px-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(184,118,60,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[12px] font-semibold text-[#B8763C] mb-0.5">{greeting}</p>
            <h1 className="text-[22px] font-serif font-bold text-[#1A1A1A] tracking-tight leading-tight">{fullName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B8763C]/10 text-[9px] font-bold text-[#B8763C] uppercase tracking-wider border border-[#B8763C]/15">
                <Sparkles size={8} /> ALPONA Member
              </span>
            </div>
          </div>
          <div className="relative">
            {/* Avatar with status ring */}
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-[#B8763C] via-[#D4A574] to-[#B8763C] shadow-md">
              <div className="w-full h-full rounded-full bg-white overflow-hidden">
                <Image 
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=B8763C&color=fff`}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <Link href="/account/profile" className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E8E2DB] shadow-sm rounded-full flex items-center justify-center text-[#1A1A1A] hover:text-[#B8763C] transition-colors">
              <PenLine size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: STATS ROW ═══ */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-[#FFFBF5] rounded-[16px] p-3 border border-[#E8E2DB]/40 text-center">
          <Package size={16} className="text-[#B8763C] mx-auto mb-1" />
          <p className="text-[16px] font-bold text-[#1A1A1A]">{orderCount}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#8C8375]">Orders</p>
        </div>
        <div className="bg-[#FFF5F5] rounded-[16px] p-3 border border-[#E8E2DB]/40 text-center">
          <Heart size={16} className="text-[#E8636F] mx-auto mb-1" />
          <p className="text-[16px] font-bold text-[#1A1A1A]">{wishlistCount}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#8C8375]">Saved</p>
        </div>
        <div className="bg-[#F0F7FF] rounded-[16px] p-3 border border-[#E8E2DB]/40 text-center">
          <AnimatedMapPin size={16} className="text-[#3B82F6] mx-auto mb-1" />
          <p className="text-[16px] font-bold text-[#1A1A1A]">{addressCount}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#8C8375]">Addresses</p>
        </div>
      </div>

      {/* ═══ SECTION 3: QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/account/orders" className="group relative overflow-hidden bg-[#1A1A1A] rounded-[18px] p-4 hover:shadow-lg active:scale-[0.98] transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[radial-gradient(circle,rgba(184,118,60,0.15)_0%,transparent_70%)] pointer-events-none" />
          <Truck size={20} className="text-[#D4A574] mb-2.5" />
          <p className="text-[13px] font-bold text-white">Track Order</p>
          <p className="text-[10px] text-[#8C8375] mt-0.5">View status</p>
        </Link>
        <Link href="/shop" className="group relative overflow-hidden bg-gradient-to-br from-[#B8763C] to-[#8B5A2B] rounded-[18px] p-4 hover:shadow-lg active:scale-[0.98] transition-all">
          <ShoppingBag size={20} className="text-white/80 mb-2.5" />
          <p className="text-[13px] font-bold text-white">Browse</p>
          <p className="text-[10px] text-white/60 mt-0.5">New arrivals</p>
        </Link>
        <Link href="/design-studio" className="group bg-[#F5EDE3] rounded-[18px] p-4 border border-[#E8E2DB]/60 hover:shadow-md active:scale-[0.98] transition-all">
          <PenTool size={20} className="text-[#B8763C] mb-2.5" />
          <p className="text-[13px] font-bold text-[#1A1A1A]">Design</p>
          <p className="text-[10px] text-[#8C8375] mt-0.5">Create yours</p>
        </Link>
        <Link href="/account/wishlist" className="group bg-white rounded-[18px] p-4 border border-[#E8E2DB] hover:shadow-md active:scale-[0.98] transition-all">
          <Heart size={20} className="text-[#E8636F] mb-2.5" />
          <p className="text-[13px] font-bold text-[#1A1A1A]">Wishlist</p>
          <p className="text-[10px] text-[#8C8375] mt-0.5">{wishlistCount} items</p>
        </Link>
      </div>

      {/* ═══ SECTION 4: RECENT ORDERS ═══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#1A1A1A]">Recent Orders</h2>
          {recentOrders.length > 0 && (
            <Link href="/account/orders" className="text-[11px] font-semibold text-[#B8763C] flex items-center gap-0.5">
              View All <ArrowRight size={12} />
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="bg-[#FFFBF5] border border-[#E8E2DB]/60 rounded-[20px] p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mb-3">
              <AnimatedPackage size={24} className="text-[#C6B6A5]" />
            </div>
            <p className="text-[14px] font-bold text-[#1A1A1A] mb-1">No orders yet</p>
            <p className="text-[12px] text-[#8C8375] mb-4">Discover our curated collections</p>
            <Link href="/shop" className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl text-[12px] font-bold">
              <ShoppingBag size={14} /> Explore
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((order) => {
              const firstItem = order.order_items?.[0]
              const productImage = firstItem?.products?.images?.[0] || null
              const sc = statusColors[order.status] || statusColors.pending || { bg: '', text: '', dot: '' }
              return (
                <Link key={order.id} href="/account/orders" className="flex items-center gap-3 bg-white border border-[#E8E2DB]/60 rounded-[16px] p-3 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-[12px] bg-[#FAF7F4] border border-[#E8E2DB]/50 overflow-hidden shrink-0">
                    {productImage ? (
                      <Image src={productImage} alt="Product" width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-[#C6B6A5]" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1A1A1A] truncate">{firstItem?.product_name || 'Order'}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase mt-0.5 ${sc.bg} ${sc.text}`}>
                      <span className={`w-1 h-1 rounded-full ${sc.dot}`} />{order.status}
                    </span>
                  </div>
                  <p className="text-[14px] font-bold text-[#1A1A1A] shrink-0">₹{Number(order.total).toLocaleString()}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ SECTION 5: SHOPPING SUMMARY CARD ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2D2520] to-[#1A1A1A] rounded-[22px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(184,118,60,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B8763C]/20 text-[9px] font-bold text-[#D4A574] uppercase tracking-wider border border-[#B8763C]/20 mb-2">
              <Sparkles size={8} /> ALPONA Member
            </span>
            <p className="text-[16px] font-serif font-bold text-white">Your Shopping Summary</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[18px] font-bold text-white">{orderCount}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#D4A574]">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-white">{wishlistCount}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#D4A574]">Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 6: GROUPED SETTINGS ═══ */}
      <div className="flex flex-col gap-5 mt-1">
        
        {/* Account */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A39888] mb-2.5 ml-2">Account</h3>
          <div className="bg-white rounded-[22px] border border-[#E8E2DB]/60 shadow-sm flex flex-col overflow-hidden">
            <Link href="/account/profile" className="flex items-center justify-between p-4 hover:bg-[#FAF7F4] transition-colors border-b border-[#F1F3F6] group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F4] border border-[#E8E2DB]/60 flex items-center justify-center">
                  <AnimatedUser size={16} className="text-[#6B6259]" />
                </div>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">Profile</span>
              </div>
              <ChevronRight size={16} className="text-[#C6B6A5] group-hover:text-[#B8763C] transition-colors" />
            </Link>
            <Link href="/account/addresses" className="flex items-center justify-between p-4 hover:bg-[#FAF7F4] transition-colors border-b border-[#F1F3F6] group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F4] border border-[#E8E2DB]/60 flex items-center justify-center">
                  <AnimatedMapPin size={16} className="text-[#6B6259]" />
                </div>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">Addresses</span>
              </div>
              <ChevronRight size={16} className="text-[#C6B6A5] group-hover:text-[#B8763C] transition-colors" />
            </Link>
            <Link href="/account/settings" className="flex items-center justify-between p-4 hover:bg-[#FAF7F4] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F4] border border-[#E8E2DB]/60 flex items-center justify-center">
                  <AnimatedSettings size={16} className="text-[#6B6259]" />
                </div>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">Settings</span>
              </div>
              <ChevronRight size={16} className="text-[#C6B6A5] group-hover:text-[#B8763C] transition-colors" />
            </Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A39888] mb-2.5 ml-2">Support</h3>
          <div className="bg-white rounded-[22px] border border-[#E8E2DB]/60 shadow-sm flex flex-col overflow-hidden">
            <Link href="/account/faq" className="flex items-center justify-between p-4 hover:bg-[#FAF7F4] transition-colors border-b border-[#F1F3F6] group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F4] border border-[#E8E2DB]/60 flex items-center justify-center">
                  <HeadphonesIcon size={16} className="text-[#6B6259]" />
                </div>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">Help Center</span>
              </div>
              <ChevronRight size={16} className="text-[#C6B6A5] group-hover:text-[#B8763C] transition-colors" />
            </Link>
            <Link href="/account/legal" className="flex items-center justify-between p-4 hover:bg-[#FAF7F4] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F4] border border-[#E8E2DB]/60 flex items-center justify-center">
                  <FileText size={16} className="text-[#6B6259]" />
                </div>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">Legal</span>
              </div>
              <ChevronRight size={16} className="text-[#C6B6A5] group-hover:text-[#B8763C] transition-colors" />
            </Link>
          </div>
        </div>

        {/* Log Out */}
        <form action="/auth/signout" method="post" className="mt-1">
          <button type="submit" className="w-full bg-white border border-[#E8E2DB]/60 rounded-[20px] p-4 text-[14px] font-bold text-[#1A1A1A] shadow-sm flex items-center justify-center gap-2.5 hover:bg-[#FAF7F4] active:scale-[0.98] transition-all group">
            <AnimatedLogOut size={16} className="text-[#8C8375] group-hover:text-red-500 transition-colors" /> Log Out
          </button>
        </form>
      </div>
    </div>
  )
}
