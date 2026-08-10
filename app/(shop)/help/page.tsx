import type { Metadata } from 'next'
import { HelpCenterClient } from '@/components/shop/HelpCenterClient'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/constants/config'
import { Headphones, ShieldCheck, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: `Help Center & Concierge | ${SITE_NAME}`,
  description: 'Need assistance? Track your order status, request a return, or connect directly with Alpona support concierge.',
  alternates: {
    canonical: `${SITE_URL}/help`,
  },
}

export default function HelpCenterPage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pt-6 md:pt-10 pb-24 md:pb-32 font-sans relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#B8763C]/10 via-[#B8763C]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1A1A1A] font-bold">Help Center & Concierge</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] text-[10px] font-black uppercase tracking-[0.25em]">
            <Headphones size={13} />
            <span>Studio Concierge Care</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-extrabold text-[#1A1A1A] tracking-tight text-balance">
            Help Center & Concierge
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-lg mx-auto leading-relaxed">
            Direct priority support for your 240 GSM organic streetwear, custom studio drops, order inquiries, and size exchanges.
          </p>

          {/* Quick SLA Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Support Online
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1A1A1A] bg-white border border-[#E8E2DB] px-3 py-1 rounded-full shadow-2xs">
              <ShieldCheck size={13} className="text-[#B8763C]" />
              100% Quality Guarantee
            </span>
          </div>
        </div>
      </div>

      <HelpCenterClient />
    </div>
  )
}
