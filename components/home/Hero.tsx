'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HeroFrameAnimation } from '@/components/ui/HeroFrameAnimation'
import {
  IconArrowRight,
  IconShieldLock,
  IconBadgeCheck,
  IconLock,
  IconPencil,
} from '@/components/shared/PremiumIcons'

const trustBadges = [
  { icon: IconShieldLock, title: 'Premium Quality', sub: 'Combed cotton' },
  { icon: IconBadgeCheck, title: 'Made on Order', sub: 'Zero waste' },
  { icon: IconLock, title: 'Secure Payments', sub: 'Razorpay encrypted' },
]

export function Hero() {
  return (
    <section className="relative w-full bg-[#FAF7F4] overflow-hidden -mt-20 lg:-mt-24 select-none">
      {/* Cinematic Ambient Blurs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#B8763C]/10 blur-[120px] mix-blend-multiply opacity-70" />
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#E8E2DB]/40 blur-[100px] mix-blend-multiply opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative z-10">
        
        {/* ── LEFT COLUMN — Content ── */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="relative flex flex-col justify-center pl-6 pr-6 sm:pl-8 lg:pl-20 xl:pl-28 pt-28 pb-12 lg:pt-36 lg:pb-16 z-20 order-2 lg:order-1"
        >
          {/* Eyebrow kicker */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="font-body text-[10px] font-bold tracking-[0.25em] uppercase text-[#B8763C] mb-6 flex items-center gap-3"
          >
            <span className="w-8 h-[2px] bg-[#B8763C] rounded-full" />
            Printed on Quality, Made for You
          </motion.p>

          {/* Headline */}
          <motion.h1 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.06 }
              }
            }}
            className="font-serif leading-[1.02] tracking-tight mb-8 text-balance relative"
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
                show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="block text-[clamp(40px,7vw,80px)] font-light text-[#1A1A1A]"
            >
              Wear Your
            </motion.span>
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
                show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="block text-[clamp(40px,7vw,80px)] font-light italic text-[#B8763C] pr-4 drop-shadow-[0_10px_20px_rgba(184,118,60,0.15)]"
            >
              Imagination.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="font-sans text-sm md:text-base leading-relaxed text-[#555555] max-w-[460px] mb-12 text-pretty"
          >
            Discover 120+ original designs or create something uniquely yours. Premium print-on-demand apparel, crafted with care and delivered across India.
          </motion.p>

          {/* Rating & Social Trust Badge */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#E8E2DB] shadow-sm mb-6 w-fit"
          >
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-stone-900 ml-1">4.9/5</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="text-xs font-semibold text-stone-700">25,000+ Happy Customers across India</span>
          </motion.div>

          {/* Primary Amber CTA + Secondary Outline CTA */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8"
          >
            <Link
              href="/shop"
              className="group relative inline-flex items-center justify-between pl-8 pr-2.5 py-3 bg-[#C87533] hover:bg-[#A65E28] text-white rounded-full text-sm font-bold tracking-wide overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_24px_-6px_rgba(200,117,51,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(200,117,51,0.5)] active:scale-[0.97] w-full sm:w-auto min-h-[48px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="mr-6 font-sans relative z-10">Shop Now</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shrink-0 relative z-10">
                <IconArrowRight size={14} color="currentColor" className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </Link>

            <Link
              href="/design-studio"
              className="group inline-flex items-center justify-between pl-8 pr-2.5 py-3 bg-transparent text-[#1A1A1A] rounded-full text-sm font-bold border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] w-full sm:w-auto min-h-[48px]"
            >
              <span className="mr-6 font-sans">Create Your Own</span>
              <div className="w-10 h-10 rounded-full bg-[#FAF7F4] group-hover:bg-white/20 flex items-center justify-center text-[#B8763C] group-hover:text-white transition-all duration-300 group-hover:scale-110 shrink-0 border border-[#E8E2DB]/50">
                <IconPencil size={14} color="currentColor" />
              </div>
            </Link>
          </motion.div>

          {/* Dispatch Precision & Payment Trust Strip */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-6 p-2.5 px-4 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E8E2DB] shadow-sm max-w-full"
          >
            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium whitespace-nowrap">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>🚚 Order in next <strong className="text-stone-900 font-bold">2h 15m</strong> for Dispatch Tomorrow</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-stone-300 shrink-0" />
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-stone-500 uppercase tracking-wider whitespace-nowrap">
              <span>UPI</span> • <span>Razorpay</span> • <span>COD</span> • <span>Delhivery</span>
            </div>
          </motion.div>
        </motion.div>
 
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative overflow-hidden order-1 lg:order-2 min-h-[50vh] lg:min-h-0 mix-blend-multiply"
        >
          {/* Gradient overlay — left edge, blends into left column */}
          <div className="absolute left-0 top-0 bottom-0 w-[150px] z-10 bg-gradient-to-r from-[#FAF7F4] via-[#FAF7F4]/80 to-transparent pointer-events-none hidden lg:block" />

          {/* Hero animation fills the column */}
          <HeroFrameAnimation
            priority
            className="absolute inset-0 w-full h-full"
          />

          {/* Mobile top/bottom gradients */}
          <div
            className="block lg:hidden absolute inset-x-0 bottom-0 h-[40%] pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to top, #FAF7F4 0%, transparent 100%)',
            }}
          />

          <div className="absolute bottom-10 left-6 lg:left-10 flex items-center gap-3 z-20 text-[#1A1A1A]/40">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll to explore</span>
            <div className="w-10 h-px bg-[#1A1A1A]/20" />
          </div>

        </motion.div>
      </div>
    </section>
  )
}
