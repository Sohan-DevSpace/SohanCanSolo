import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { HeadphonesIcon, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  AnimatedUser,
  AnimatedMapPin,
  AnimatedPackage,
  AnimatedLogOut,
  AnimatedHeart,
  AnimatedSettings,
  AnimatedTag,
  AnimatedSparkles,
  AnimatedCalendar,
} from '@/components/shared/AnimatedIcons'
import { AccountNavLink } from '@/components/layout/AccountNavLink'
import { MobileAccountDashboard } from '@/components/layout/MobileAccountDashboard'
import { AnimatedCounter } from './AnimatedCounter'
import Image from 'next/image'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning,'
  if (hour < 17) return 'Good Afternoon,'
  return 'Good Evening,'
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profileResult, orderCountResult, addressCountResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('addresses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  const profile = profileResult.data
  const orderCount = orderCountResult.count
  const addressCount = addressCountResult.count

  const fullName = profile?.full_name || user.email?.split('@')[0] || 'Member'
  const avatarUrl = profile?.avatar_url || null
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently'
  const greeting = getTimeGreeting()

  const HeroBanner = (
    <div className="rounded-[2.5rem] p-2 bg-gradient-to-b from-white via-[#FAF7F4] to-[#E8E2DB] shadow-[0_16px_40px_-15px_rgba(0,0,0,0.06)] border border-[#E8E2DB] mb-8">
      <div className="relative bg-gradient-to-br from-[#FAF7F4] via-[#F5F1EC] to-[#EDE7DF] rounded-[calc(2.5rem-0.5rem)] p-8 md:p-10 overflow-hidden border border-white/80">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_top_right,rgba(200,117,51,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[radial-gradient(circle_at_bottom_left,rgba(200,117,51,0.06)_0%,transparent_65%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-6">
            {/* Avatar with status ring */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#C87533] via-[#D4A574] to-[#B8763C] shadow-md">
                <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={fullName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FAF7F4] text-[#C87533]">
                      <AnimatedUser size={36} className="text-[#C87533]" />
                    </div>
                  )}
                </div>
              </div>
              {/* Member badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#C87533] to-[#964E1B] rounded-full flex items-center justify-center shadow-md border-2 border-white text-white">
                <AnimatedSparkles size={14} className="text-white" />
              </div>
            </div>

            {/* Text info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#C87533] mb-1">{greeting}</p>
              <h1 className="text-balance text-2xl md:text-3xl font-display font-bold text-[#1A1A1A] tracking-tight leading-tight">{fullName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C87533]/15 text-[11px] font-bold text-[#C87533] uppercase tracking-wider border border-[#C87533]/25 backdrop-blur-sm">
                  <AnimatedSparkles size={10} className="text-[#C87533]" />
                  ALPONA Member
                </span>
                <span className="flex items-center gap-1 text-xs text-[#8C857C] font-medium">
                  <AnimatedCalendar size={12} className="text-[#8C857C]" />
                  Member Since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-4 border-t border-[#E8E2DB] pt-6 md:pt-0 md:border-0">
            <div className="px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm text-center min-w-[110px] hover:shadow-md transition-all duration-300">
              <p className="text-2xl font-display font-bold text-[#1A1A1A]">
                <AnimatedCounter value={orderCount || 0} />
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C857C] mt-0.5">Orders</p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm text-center min-w-[110px] hover:shadow-md transition-all duration-300">
              <p className="text-2xl font-display font-bold text-[#1A1A1A]">
                <AnimatedCounter value={addressCount || 0} />
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C857C] mt-0.5">Addresses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F4] text-[#1A1A1A] pt-0 lg:pt-8 pb-20 select-none">
      <div className="container mx-auto px-4 lg:px-12 xl:px-20 max-w-[1440px]">
        {/* ✨ DESKTOP HERO BANNER ✨ */}
        <div className="hidden lg:block">
          {HeroBanner}
        </div>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden lg:flex flex-row gap-8">
          {/* ── SIDEBAR NAVIGATION ── */}
          <aside className="w-64 shrink-0">
            <nav className="flex flex-col gap-6 sticky top-8 bg-white/80 backdrop-blur-xl border border-[#E8E2DB] rounded-3xl p-5 shadow-sm">
              
              {/* Overview */}
              <div>
                <AccountNavLink href="/account" icon={<AnimatedSparkles size={16} />}>Overview</AccountNavLink>
              </div>

              {/* Shopping */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C857C] mb-2 px-3">Shopping</h4>
                <div className="flex flex-col gap-0.5">
                  <AccountNavLink href="/account/orders" icon={<AnimatedPackage size={16} />}>Orders</AccountNavLink>
                  <AccountNavLink href="/account/wishlist" icon={<AnimatedHeart size={16} />}>Wishlist</AccountNavLink>
                  <AccountNavLink href="/account/coupons" icon={<AnimatedTag size={16} />}>Coupons</AccountNavLink>
                </div>
              </div>

              {/* Account */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C857C] mb-2 px-3">Account</h4>
                <div className="flex flex-col gap-0.5">
                  <AccountNavLink href="/account/profile" icon={<AnimatedUser size={16} />}>Profile</AccountNavLink>
                  <AccountNavLink href="/account/addresses" icon={<AnimatedMapPin size={16} />}>Addresses</AccountNavLink>
                  <AccountNavLink href="/account/settings" icon={<AnimatedSettings size={16} />}>Settings</AccountNavLink>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C857C] mb-2 px-3">Support</h4>
                <div className="flex flex-col gap-0.5">
                  <AccountNavLink href="/account/faq" icon={<HeadphonesIcon size={16} />}>Help Center</AccountNavLink>
                  <AccountNavLink href="/account/legal" icon={<FileText size={16} />}>Legal</AccountNavLink>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-3 border-t border-[#E8E2DB]/80">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[#8C857C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 w-full text-left font-bold text-xs uppercase tracking-wider cursor-pointer group active:scale-[0.97]"
                  >
                    <AnimatedLogOut size={16} className="text-[#8C857C] group-hover:text-rose-500 transition-colors" />
                    Log Out
                  </button>
                </form>
              </div>

            </nav>
          </aside>

          {/* ── MAIN CONTENT CONTAINER ── */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-[#E8E2DB] shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-[2.25rem] p-6 md:p-10">
              {children}
            </div>
          </main>
        </div>

        {/* ── MOBILE LAYOUT WRAPPER ── */}
        <div className="lg:hidden">
          <MobileAccountDashboard 
            fullName={fullName}
            avatarUrl={avatarUrl}
            orderCount={orderCount || 0}
            addressCount={addressCount || 0}
          >
            {children}
          </MobileAccountDashboard>
        </div>
      </div>
    </div>
  )
}
