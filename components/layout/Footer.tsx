'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import toast from 'react-hot-toast'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_URL } from '@/constants/config'
import {
  IconArrowRight,
  IconArrowUp,
  IconHeart,
  IconInstagram,
  IconFacebook,
  IconYoutube,
  IconMail,
  IconMapPin,
  IconRecycle,
  IconRefresh,
  IconStar,
} from '@/components/shared/PremiumIcons'
import { MessageSquare } from 'lucide-react'

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

// ─── Data Architecture ────────────────────────────────────────────────────────
interface NavLink {
  label: string
  href: string
}

const navColumns: { title: string; links: NavLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', href: '/shop?sortBy=newest' },
      { label: 'Best Sellers', href: '/shop?sortBy=best-selling' },
      { label: 'T-Shirts & Hoodies', href: '/shop?category=t-shirts' },
      { label: 'Oversized Fit', href: '/shop?category=oversized' },
      { label: 'All Collections', href: '/shop' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Track Order', href: '/order/track' },
      { label: 'FAQs & Shipping', href: '/faq' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Help Center', href: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Alpona', href: '/about' },
      { label: 'Sustainability', href: '/about' },
      { label: 'Design Studio', href: '/design-studio' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
]

const socials = [
  { Icon: IconInstagram, label: 'Instagram', href: 'https://instagram.com/alpona.store' },
  { Icon: IconFacebook, label: 'Facebook', href: '#' },
  { Icon: IconYoutube, label: 'YouTube', href: '#' },
  { Icon: IconMail, label: 'Email', href: 'mailto:hello@alpona.in' },
]

const trustBadges = [
  { Icon: IconMapPin, title: 'Designed in India', desc: 'Proudly made for creators' },
  { Icon: IconRecycle, title: 'Print On Demand', desc: 'Zero waste sustainable production' },
  { Icon: IconHeart, title: 'Loved by 25K+', desc: 'Creators trust Alpona' },
  { Icon: IconRefresh, title: '7 Days Easy Return', desc: 'Hassle-free size swaps' },
]

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative text-xs leading-[1.6] text-[#A09A94] transition-colors duration-300 hover:text-white group inline-block"
    >
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-[#C87533] transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      toast.success('Thank you for subscribing to Alpona Insider drops!')
      setNewsletterEmail('')
      setSubmitting(false)
    }, 600)
  }

  const footerSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Footer Site Navigation',
    itemListElement: navColumns.flatMap(c => c.links).map((link, idx) => ({
      '@type': 'SiteNavigationElement',
      position: idx + 1,
      name: link.label,
      url: `${SITE_URL}${link.href}`,
    })),
  }

  return (
    <footer ref={ref} className="bg-[#0A0A0A] text-white border-t border-white/10 relative overflow-hidden select-none">
      <JsonLd data={footerSchema} />
      {/* Soft Ambient Luxury Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#C87533]/10 via-[#B8763C]/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* ══════════ MAIN FOOTER SECTION ══════════ */}
      <div className="mx-auto max-w-[1360px] px-6 lg:px-12 relative z-10">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr_1.5fr] gap-10 py-12 lg:py-16 items-start"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {/* ── 1. BRAND COLUMN ── */}
          <motion.div variants={fadeUpVariant} className="flex flex-col items-start">
            <Link href="/" className="group inline-flex items-center gap-3 mb-4">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo.png?v=7"
                  alt="Alpona"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Alpona
              </span>
            </Link>

            <p className="font-body text-xs text-[#9A938C] leading-relaxed max-w-[240px] mb-6">
              Thoughtful apparel designs. Premium sustainable quality. Crafted for creators & originals.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mb-5">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9A938C] hover:text-white hover:bg-white/10 hover:border-white/25 transition-all duration-300 active:scale-95"
                >
                  <Icon size={14} color="currentColor" />
                </a>
              ))}
            </div>

            {/* Ratings & Contact Info */}
            <div className="inline-flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 mb-2 max-w-[260px]">
              <div className="flex items-center gap-2 text-[11px] text-[#A09A94]">
                <span className="font-bold text-white">GSTIN:</span> 19AAACA1234A1Z5
              </div>
              <p className="text-[11px] text-[#8C857C] leading-snug">
                Salt Lake Sector V, Kolkata, WB 700091
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#C87533] font-semibold mt-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#C87533] inline" aria-hidden="true" />
                <span>WhatsApp: +91 98765 43210</span>
              </div>
            </div>
          </motion.div>

          {/* ── 2-4. NAV COLUMNS ── */}
          {navColumns.map((col) => (
            <motion.nav key={col.title} variants={fadeUpVariant} aria-label={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white mb-4">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}

          {/* ── 5. INSTAGRAM & COMMUNITY COMPACT CARD ── */}
          <motion.div variants={fadeUpVariant} className="flex flex-col">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C87533]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C87533] flex items-center gap-1.5">
                  <IconInstagram size={13} color="currentColor" />
                  @alpona.store
                </span>
                <span className="text-[10px] text-[#8C857C]">Community</span>
              </div>

              <p className="text-xs text-[#B3ABA3] leading-relaxed mb-4">
                Made with creativity. Worn with pride. Tag us to get featured.
              </p>

              {/* 3 Compact Post Preview Thumbnails */}
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group/img">
                    <Image
                      src={`/images/instagram/insta-${n}.png`}
                      alt={`Community post ${n}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <IconHeart size={14} color="white" />
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://instagram.com/alpona.store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-[#1A1A1A] hover:bg-[#FAF7F4] text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-sm"
              >
                Follow on Instagram
                <IconArrowRight size={13} color="currentColor" />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* ══════════ TRUST BADGES STRIP ══════════ */}
        <div className="border-t border-white/10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {trustBadges.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C87533] shrink-0">
                  <Icon size={16} color="currentColor" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{title}</p>
                  <p className="text-[11px] text-[#8C857C] leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM BAR ══════════ */}
      <div className="border-t border-white/10 bg-black/40 relative z-10">
        <div className="mx-auto max-w-[1360px] px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <p className="text-xs text-[#8C857C] font-body tracking-wide order-2 sm:order-1">
            &copy; {new Date().getFullYear()} Alpona. All rights reserved.
          </p>

          {/* Expanded Payment Method Badges */}
          <div className="flex flex-wrap items-center gap-1.5 order-1 sm:order-2">
            {['VISA', 'MASTERCARD', 'RAZORPAY', 'UPI', 'GPAY', 'PAYTM', 'PHONEPE', 'COD'].map((brand) => (
              <span
                key={brand}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold tracking-widest text-[#9A938C] uppercase"
              >
                {brand}
              </span>
            ))}
          </div>

          {/* Currency & Scroll-to-Top */}
          <div className="flex items-center gap-4 order-3">
            <span className="text-xs font-medium text-[#9A938C] flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span>India (INR ₹)</span>
            </span>

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-[#1A1A1A] text-white flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label="Back to top"
            >
              <IconArrowUp size={14} color="currentColor" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  )
}
