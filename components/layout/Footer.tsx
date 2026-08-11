'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_URL } from '@/constants/config'
import { AlponaLogoMark } from '@/components/shared/AlponaLogo'
import { 
  MapPin, 
  Recycle, 
  ShieldCheck, 
  RotateCcw, 
  MessageCircle, 
  ArrowUp, 
  ArrowRight,
} from 'lucide-react'

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  )
}

function TwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
}

interface NavLink {
  label: string
  href: string
}

const shopLinks: NavLink[] = [
  { label: 'New Arrivals', href: '/shop?sortBy=newest' },
  { label: 'Best Sellers', href: '/shop?sortBy=best-selling' },
  { label: 'T-Shirts & Hoodies', href: '/shop?category=t-shirts' },
  { label: 'Oversized Fit', href: '/shop?category=oversized' },
  { label: 'Design Studio', href: '/design-studio' },
]

const supportLinks: NavLink[] = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Track Order', href: '/order/track' },
  { label: 'FAQs & Shipping', href: '/faq' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Privacy & Terms', href: '/privacy' },
]

const socials = [
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/alpona.store' },
  { Icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
  { Icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com' },
  { Icon: TwitterIcon, label: 'Twitter', href: 'https://x.com' },
]

const trustBadges = [
  { Icon: MapPin, title: 'Designed in India', desc: 'Proudly made for creators' },
  { Icon: Recycle, title: 'Print On Demand', desc: 'Zero waste sustainable' },
  { Icon: ShieldCheck, title: '256-Bit SSL Secure', desc: 'Encrypted Razorpay UPI' },
  { Icon: RotateCcw, title: '7 Days Easy Returns', desc: 'Hassle-free size swaps' },
]

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative text-[13px] leading-[1.7] text-[#A09A94] transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8763C] rounded group inline-block font-medium"
    >
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-[#B8763C] transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const footerSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Footer Site Navigation',
    itemListElement: [...shopLinks, ...supportLinks].map((link, idx) => ({
      '@type': 'SiteNavigationElement',
      position: idx + 1,
      name: link.label,
      url: `${SITE_URL}${link.href}`,
    })),
  }

  return (
    <footer ref={ref} className="bg-[#0A0A0A] text-white border-t border-white/10 relative overflow-hidden select-none">
      <JsonLd data={footerSchema} />
      
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[300px] bg-gradient-to-b from-[#B8763C]/10 via-[#B8763C]/3 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* ══════════ MAIN COMPACT GRID ══════════ */}
      <div className="mx-auto max-w-[1360px] px-6 lg:px-12 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.3fr] gap-8 py-10 lg:py-12 items-start"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {/* ── 1. BRAND COLUMN ── */}
          <motion.div variants={fadeUpVariant} className="flex flex-col items-start">
            <Link href="/" aria-label="Alpona Home" className="group inline-flex items-center gap-2.5 mb-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]">
              <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <AlponaLogoMark size={34} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-[#B8763C] transition-colors">
                Alpona
              </span>
            </Link>

            <p className="font-body text-xs text-[#9A938C] leading-relaxed max-w-[240px] mb-4">
              Thoughtful streetwear apparel & custom print-on-demand studio for creators.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mb-4">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#B8763C] hover:bg-[#B8763C]/15 hover:text-[#B8763C] hover:scale-110 flex items-center justify-center text-[#A09A94] transition-all duration-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Compact Business Info */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#A09A94] bg-white/[0.03] border border-white/10 px-3 py-2 rounded-xl">
              <span><strong className="text-white">GSTIN:</strong> 19AAACA1234A1Z5</span>
              <span className="text-white/20" aria-hidden="true">•</span>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-[#B8763C] hover:underline font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8763C] rounded">
                <MessageCircle className="w-3 h-3" /> WhatsApp Support
              </a>
            </div>
          </motion.div>

          {/* ── 2 & 3. SHOP & SUPPORT LINKS (Side-by-Side 2-Column Grid on Mobile) ── */}
          <div className="grid grid-cols-2 gap-6 lg:contents">
            <motion.nav variants={fadeUpVariant} aria-label="Shop Navigation">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white mb-3">
                Shop
              </h3>
              <ul className="flex flex-col gap-2">
                {shopLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </motion.nav>

            <motion.nav variants={fadeUpVariant} aria-label="Support Navigation">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white mb-3">
                Support
              </h3>
              <ul className="flex flex-col gap-2">
                {supportLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </div>

          {/* ── 4. INSTAGRAM & COMMUNITY CARD ── */}
          <motion.div variants={fadeUpVariant} className="flex flex-col">
            <div className="rounded-2xl bg-zinc-900/90 border border-white/10 p-4 backdrop-blur-xl relative overflow-hidden group hover:border-[#B8763C]/40 transition-all duration-500 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8763C] flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5 text-[#B8763C]" />
                  @alpona.store
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Community
                </span>
              </div>

              <p className="text-[11px] text-[#B3ABA3] leading-snug mb-3">
                Worn with pride. Tag us on Instagram to get featured.
              </p>

              {/* 3 Thumbnails */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-zinc-800">
                    <Image
                      src={`/images/instagram/insta-${n}.png`}
                      alt={`Community post ${n}`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                ))}
              </div>

              <a
                href="https://instagram.com/alpona.store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-gradient-to-r from-[#B8763C] to-amber-600 hover:from-amber-600 hover:to-[#B8763C] text-white text-[10px] font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
              >
                <span>Follow on Instagram</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* ══════════ UNIFIED TRUST STRIP ══════════ */}
        <div className="border-t border-white/10 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B8763C] shrink-0 group-hover:border-[#B8763C] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{title}</p>
                  <p className="text-[10px] text-[#8C857C] leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM COMPACT BAR ══════════ */}
      <div className="border-t border-white/10 bg-black/80 relative z-10">
        <div className="mx-auto max-w-[1360px] px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <p className="text-[11px] text-[#8C857C] font-body tracking-wide order-2 sm:order-1">
            &copy; {new Date().getFullYear()} Alpona. All rights reserved.
          </p>

          {/* Payment Chips */}
          <div className="flex flex-wrap items-center gap-1 order-1 sm:order-2">
            {['VISA', 'MASTERCARD', 'RAZORPAY', 'UPI', 'GPAY', 'PAYTM', 'PHONEPE', 'COD'].map((brand) => (
              <span
                key={brand}
                className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[8px] font-bold tracking-widest text-[#A09A94] uppercase hover:text-white transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>

          {/* Region & Scroll-to-Top */}
          <div className="flex items-center gap-3 order-3">
            <span className="text-[11px] font-medium text-[#A09A94] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              India (INR ₹)
            </span>

            <button
              onClick={scrollToTop}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-[#B8763C] hover:border-[#B8763C] text-white flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  )
}
