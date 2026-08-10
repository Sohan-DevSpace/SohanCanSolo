'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSearch,
  IconCart,
  IconUser,
  IconArrowRight,
  IconHeart,
  IconSparkles,
  IconStar,
  IconPencil,
  IconLogOut,
  IconSettings,
  IconTruck
} from '@/components/shared/PremiumIcons'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useUser } from '@/hooks/useUser'
import dynamic from 'next/dynamic'
import { Command } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SearchOverlay = dynamic(() => import('@/components/layout/SearchOverlay').then(mod => mod.SearchOverlay), { ssr: false })
import { MorphingIcon } from '@/components/shared/MorphingIcon'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

import { Dna, Sparkles, Star, Shirt, ShoppingBag, Smile, Flame } from 'lucide-react'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_URL } from '@/constants/config'

// ─── Premium Easing Constants ────────────────────────────────────────────────
const EASE_PREMIUM = [0.32, 0.72, 0, 1] as const
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const categoriesConfig = [
  { slug: 't-shirts', title: 'T-Shirts', description: 'Classic, oversized and everyday essentials', icon: Shirt },
  { slug: 'bags', title: 'Bags', description: 'Premium tote bags and drawstring bags', icon: ShoppingBag },
  { slug: 'kids', title: 'Kids', description: 'Comfortable clothing for young creators', icon: Smile },
  { slug: 'hoodies-sweatshirts', title: 'Hoodies & Sweatshirts', description: 'Premium custom cozy street drops', icon: Flame }
]

const mobileMenuContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
}

const mobileMenuItemVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

const megaMenuContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.06 } }
}

const megaMenuItemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO as any } }
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount } = useCartStore()
  const { itemIds } = useWishlistStore()
  const { user, profile } = useUser()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([])

  const closeTimeout = useRef<NodeJS.Timeout | null>(null)
  const accountCloseTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchCategoryTree = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, status, subcategories(id, name, slug, status, sort_order)')
        .neq('status', 'hidden')
        .order('sort_order', { ascending: true })
      
      if (data && !cancelled) {
        const sortedData = data.map((cat: any) => {
          if (cat.subcategories) {
            cat.subcategories.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          }
          return cat
        })
        setDynamicCategories(sortedData)
      }
    }
    fetchCategoryTree()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setIsMegaMenuOpen(false)
        setIsAccountMenuOpen(false)
        if (closeTimeout.current) clearTimeout(closeTimeout.current)
        if (accountCloseTimeout.current) clearTimeout(accountCloseTimeout.current)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setIsMegaMenuOpen(true)
    setIsAccountMenuOpen(false)
  }

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setIsMegaMenuOpen(false), 200)
  }

  const handleAccountEnter = () => {
    if (accountCloseTimeout.current) clearTimeout(accountCloseTimeout.current)
    setIsAccountMenuOpen(true)
    setIsMegaMenuOpen(false)
    setHoveredLink(null)
  }

  const handleAccountLeave = () => {
    accountCloseTimeout.current = setTimeout(() => setIsAccountMenuOpen(false), 200)
  }

  const categoriesList = useMemo(() => {
    return categoriesConfig.map(cfg => {
      const dbCat = dynamicCategories.find(c => c.slug === cfg.slug)
      return {
        ...cfg,
        status: dbCat?.status || (cfg.slug === 'hoodies-sweatshirts' ? 'coming_soon' : 'active'),
        href: `/shop?category=${cfg.slug}`
      }
    })
  }, [dynamicCategories])

  const collectionsList = [
    { 
      title: 'Style Match AI', 
      description: 'Personalized AI style finder', 
      href: '/style-match', 
      icon: Sparkles,
      badgeStyle: 'bg-[#B8763C]/10 border-[#B8763C]/25 text-[#B8763C]',
      hoverBg: 'group-hover:bg-[#B8763C] group-hover:text-white'
    },
    { 
      title: 'New Arrivals', 
      description: 'Latest premium drops', 
      href: '/shop?sort=newest', 
      icon: Sparkles,
      badgeStyle: 'bg-amber-500/10 border-amber-500/25 text-amber-600',
      hoverBg: 'group-hover:bg-amber-600 group-hover:text-white'
    },
    { 
      title: 'Best Sellers', 
      description: 'Most loved products', 
      href: '/shop?sort=best-selling', 
      icon: Star,
      badgeStyle: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600',
      hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white'
    },
  ]

  const navLinks = [
    { label: 'Shop', href: '/shop', hasDropdown: true },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/shop?sort=best-selling' },
    { label: 'Design Studio', href: '/design-studio' },
    { label: 'Reviews', href: '/#testimonials' },
    { label: 'Track Order', href: '/order/track' },
  ]

  const navSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Main Site Navigation',
    itemListElement: navLinks.map((link, idx) => ({
      '@type': 'SiteNavigationElement',
      position: idx + 1,
      name: link.label,
      url: `${SITE_URL}${link.href}`,
    })),
  }

  return (
    <>
      <JsonLd data={navSchema} />
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          height: isScrolled ? 64 : 80,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0)',
          borderColor: isScrolled ? 'rgba(232, 226, 219, 0.4)' : 'rgba(232, 226, 219, 0)',
          boxShadow: isScrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.01)' : 'none',
          backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="sticky top-0 z-50 w-full border-b"
      >
        <div
          className="mx-auto flex items-center justify-between w-full max-w-[1440px] px-6 lg:px-12 h-full"
          onMouseLeave={() => {
            handleMouseLeave()
            setHoveredLink(null)
          }}
        >
          {/* Brand Logo */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
            <Link href="/" className="flex items-center gap-2 group select-none active:scale-[0.97] transition-transform duration-150">
              <div className="w-6 h-6 relative flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06]">
                <Image src="/images/icons/logo.png" alt="Alpona Logo" fill sizes="24px" priority className="object-contain" />
              </div>
              <span className="font-display text-xl lg:text-2xl font-bold text-primary tracking-[-0.02em] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-ring">
                Alpona
              </span>
            </Link>
          </motion.div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => {
                  if (link.hasDropdown) handleMouseEnter()
                  else setIsMegaMenuOpen(false)
                  setHoveredLink(link.label)
                  setIsAccountMenuOpen(false)
                }}
              >
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  aria-haspopup={link.hasDropdown ? 'true' : undefined}
                  aria-expanded={link.hasDropdown ? isMegaMenuOpen : undefined}
                  className="group relative flex items-center gap-1.5 py-2 text-sm font-medium tracking-[0.01em] text-primary/80 hover:text-ring z-10 select-none active:scale-[0.97]"
                  style={{
                    transitionProperty: 'color, transform',
                    transitionDuration: '200ms',
                    transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  {/* Sleek Animated Underline */}
                  <AnimatePresence>
                    {hoveredLink === link.label && (
                      <motion.div
                        layoutId="navHoverUnderline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#B8763C] to-transparent shadow-[0_0_8px_rgba(184,118,60,0.4)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="link-draw transition-transform duration-200">{link.label}</span>
                  {link.hasDropdown && (
                    <MorphingIcon
                      name={isMegaMenuOpen ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={isMegaMenuOpen ? 'var(--color-ring)' : 'var(--color-muted-foreground)'}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Universal Desktop Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Universal Search"
              className="relative hidden md:flex items-center justify-between bg-[#FAF7F4] border border-[#E8E2DB] hover:border-[#B8763C]/40 hover:bg-white rounded-full px-4 py-1.5 outline-none font-body text-xs text-[#8A8580] transition-all duration-300 w-48 lg:w-64 cursor-pointer shadow-matte-xs group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 truncate">
                <IconSearch className="text-[#8A8580] group-hover:text-ring transition-colors shrink-0" size={14} />
                <span className="truncate group-hover:text-primary transition-colors">Search entire site...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-[#E8E2DB] text-[10px] font-mono text-muted-foreground shadow-matte-xs shrink-0">
                <Command size={10} />K
              </kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Universal Search"
              className="md:hidden group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-ring hover:bg-[#FAF7F4] transition-all duration-300 rounded-full cursor-pointer active:scale-[0.97]"
            >
              <IconSearch className="group-hover:scale-110 transition-transform duration-300" size={18} color="currentColor" />
            </button>
            
            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              aria-label={`Wishlist (${itemIds.length} items)`}
              className="group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-ring hover:bg-[#FAF7F4] transition-all duration-300 rounded-full cursor-pointer active:scale-[0.97] relative"
            >
              <IconHeart className="group-hover:scale-110 transition-transform duration-300" size={18} color="currentColor" />
              {itemIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-ring text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none shadow-sm">
                  {itemIds.length}
                </span>
              )}
            </Link>

            {/* Account Hover Dropdown */}
            <div 
              className="relative hidden lg:flex items-center h-full"
              onMouseEnter={handleAccountEnter}
              onMouseLeave={handleAccountLeave}
            >
              <Link 
                href={user ? '/account' : '/auth/login'} 
                aria-label="Account"
                className="group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-ring hover:bg-[#FAF7F4] transition-all duration-300 rounded-full cursor-pointer active:scale-[0.97]"
              >
                <IconUser className="group-hover:scale-110 transition-transform duration-300" size={18} color="currentColor" />
              </Link>
              
              <AnimatePresence>
                {isAccountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 4 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO as any }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute top-[80%] right-0 mt-4 z-50 min-w-[280px]"
                  >
                    {/* Hover bridge */}
                    <div className="absolute -top-6 left-0 right-0 h-6" />
                    
                    <div className="bg-white/98 backdrop-blur-3xl rounded-2xl p-2 border border-[#E8E2DB] shadow-[0_24px_54px_-12px_rgba(0,0,0,0.18),_0_4px_24px_-8px_rgba(0,0,0,0.12),_0_0_0_1px_rgba(0,0,0,0.04)]">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-[#E8E2DB]/40 mb-2">
                            <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-sm font-semibold text-primary truncate">{user.email}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Link href="/account" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary/80 hover:text-ring hover:bg-secondary/50 transition-all duration-200">
                              <IconSettings size={16} /> My Account
                            </Link>
                            <Link href="/account/orders" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary/80 hover:text-ring hover:bg-secondary/50 transition-all duration-200">
                              <IconTruck size={16} /> My Orders & History
                            </Link>
                            <Link href="/help" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary/80 hover:text-ring hover:bg-secondary/50 transition-all duration-200">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Help Center & Concierge
                            </Link>
                            <div className="h-px bg-[#E8E2DB]/40 my-1 mx-2" />
                            <button
                              onClick={async () => {
                                setIsAccountMenuOpen(false)
                                try {
                                  const supabase = createClient()
                                  await supabase.auth.signOut()
                                } catch {}
                                router.push('/auth/login')
                                router.refresh()
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600/80 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 cursor-pointer"
                            >
                              <IconLogOut size={16} /> Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 text-center">
                          <div className="w-12 h-12 bg-[#FAF7F4] rounded-full flex items-center justify-center mx-auto mb-3 text-[#B8763C]">
                            <IconUser size={20} />
                          </div>
                          <h4 className="text-base font-bold text-primary mb-1">Welcome to Alpona</h4>
                          <p className="text-xs text-muted-foreground mb-4">Sign in to track orders and save your designs.</p>
                          <Link href="/auth/login" onClick={() => setIsAccountMenuOpen(false)} className="w-full h-10 flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-[#B8763C] transition-colors shadow-sm">
                            Sign In
                          </Link>
                          <p className="text-[11px] text-muted-foreground mt-3">
                            New here? <Link href="/auth/register" className="text-[#B8763C] font-semibold hover:underline">Create an account</Link>
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Account Icon */}
            <Link 
              href={user ? '/account' : '/auth/login'} 
              aria-label="Account"
              className="lg:hidden group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-ring hover:bg-[#FAF7F4] transition-all duration-300 rounded-full cursor-pointer active:scale-[0.97]"
            >
              <IconUser className="group-hover:scale-110 transition-transform duration-300" size={18} color="currentColor" />
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              aria-label={`Shopping cart (${itemCount} items)`}
              className="group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-ring hover:bg-[#FAF7F4] transition-all duration-300 rounded-full cursor-pointer active:scale-[0.97] relative"
            >
              <IconCart className="group-hover:scale-110 transition-transform duration-300" size={18} color="currentColor" />
              <AnimatePresence mode="popLayout">
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                    className="absolute top-0 right-0 bg-ring text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none shadow-sm"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile Sheet Trigger */}
            <div className="lg:hidden flex items-center ml-1">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger
                  render={
                    <button 
                      aria-label="Toggle navigation menu"
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary hover:text-ring transition-all duration-200 rounded-full"
                    >
                      <MorphingIcon name={isMobileMenuOpen ? 'cross' : 'menu'} size={18} color="currentColor" />
                    </button>
                  }
                />
                <SheetContent side="right" className="bg-[#FAF7F4] border-l border-[#E8E2DB] w-[88vw] sm:w-[380px] p-6 flex flex-col justify-between overflow-y-auto">
                  <SheetHeader className="pb-4 border-b border-[#E8E2DB]/70 text-left">
                    <SheetTitle className="flex items-center gap-2">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                        <div className="w-6 h-6 relative shrink-0">
                          <Image src="/images/icons/logo.png" alt="Alpona" fill sizes="24px" className="object-contain" />
                        </div>
                        <span className="font-display text-xl font-bold text-primary">Alpona</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 my-4">
                    {/* Quick Access Badges */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/style-match"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-white border border-[#E8E2DB] shadow-matte-xs flex items-center gap-2.5 active:scale-95 transition-transform"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#B8763C]/10 text-[#B8763C] flex items-center justify-center shrink-0">
                          <IconSparkles size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-primary block leading-tight truncate">Style Match</span>
                          <span className="text-[10px] text-muted-foreground font-medium truncate block">AI Recommendations</span>
                        </div>
                      </Link>

                      <Link
                        href="/create"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-white border border-[#E8E2DB] shadow-matte-xs flex items-center gap-2.5 active:scale-95 transition-transform"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                          <IconPencil size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-primary block leading-tight truncate">Studio</span>
                          <span className="text-[10px] text-muted-foreground font-medium truncate block">Custom Design</span>
                        </div>
                      </Link>
                    </div>

                    {/* Main Nav Links */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8580] px-2 mb-2">
                        Catalog & Collections
                      </p>

                      <Link
                        href="/shop"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white text-sm font-bold text-primary transition-colors"
                      >
                        <span>All Products Catalog</span>
                        <IconArrowRight size={14} className="text-[#8A8580]" />
                      </Link>

                      {categoriesList.map((cat, idx) => {
                        const CatIcon = cat.icon
                        const isComingSoon = cat.status === 'coming_soon'
                        return (
                          <Link
                            key={idx}
                            href={isComingSoon ? '#' : cat.href}
                            onClick={(e) => {
                              if (isComingSoon) e.preventDefault()
                              else setIsMobileMenuOpen(false)
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                              isComingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white active:scale-[0.98]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {CatIcon && (
                                <div className="w-7 h-7 rounded-lg bg-[#B8763C]/10 text-[#B8763C] flex items-center justify-center shrink-0">
                                  <CatIcon className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <span className="text-xs font-bold text-primary">{cat.title}</span>
                              {isComingSoon && (
                                <span className="text-[9px] px-2 py-0.5 bg-ring/10 text-ring rounded-full font-bold uppercase tracking-widest font-sans">Soon</span>
                              )}
                            </div>
                            <IconArrowRight size={14} className="text-[#8A8580]" />
                          </Link>
                        )
                      })}
                    </div>

                    {/* Account & Support Section */}
                    <div className="space-y-1 pt-4 border-t border-[#E8E2DB]/70">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8580] px-2 mb-2">
                        Account & Help
                      </p>

                      <Link
                        href="/track"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white text-xs font-bold text-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconTruck size={16} className="text-[#B8763C]" />
                          <span>Track Order</span>
                        </div>
                        <IconArrowRight size={14} className="text-[#8A8580]" />
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white text-xs font-bold text-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconHeart size={16} className="text-rose-500" />
                          <span>Wishlist ({itemIds.length})</span>
                        </div>
                        <IconArrowRight size={14} className="text-[#8A8580]" />
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white text-xs font-bold text-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconUser size={16} className="text-primary" />
                          <span>{user ? (profile?.full_name || user.email || 'My Profile') : 'Sign In / Account'}</span>
                        </div>
                        <IconArrowRight size={14} className="text-[#8A8580]" />
                      </Link>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-4 border-t border-[#E8E2DB]">
                    <Link
                      href="/shop"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B8763C] transition-all shadow-matte-xs active:scale-95"
                    >
                      <span>Explore Full Catalog</span>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ─── Premium Shop Mega Menu ─── */}
          <AnimatePresence>
            {isMegaMenuOpen && (
              <motion.div
                id="shop-mega-menu"
                role="menu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.98, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 8 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                transition={{ duration: 0.25, ease: EASE_OUT_EXPO as any }}
                style={{ transformOrigin: 'top center' }}
                className="absolute top-[80%] left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[640px]"
              >
                <div className="absolute -top-8 left-0 right-0 h-10" />

                <div className="bg-white/98 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-[#E8E2DB] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25),_0_10px_30px_-10px_rgba(0,0,0,0.15),_0_0_0_1px_rgba(0,0,0,0.05)]">
                  <div className="grid grid-cols-[1.2fr_1fr] divide-x divide-[#E8E2DB]">
                    
                    {/* Left — Categories (Typographic & Minimal) */}
                    <div className="p-6 sm:p-7">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8580] select-none">
                          The Catalog
                        </p>
                        <div className="h-px bg-gradient-to-r from-[#E8E2DB] to-transparent flex-1 ml-4" />
                      </div>
                      
                      <motion.div className="flex flex-col gap-1.5" variants={megaMenuContainerVariants} initial="hidden" animate="show">
                        {categoriesList.map((cat, idx) => {
                          const isComingSoon = cat.status === 'coming_soon'
                          const CatIcon = cat.icon
                          return (
                            <motion.div key={idx} variants={megaMenuItemVariants}>
                              <Link
                                href={isComingSoon ? '#' : cat.href}
                                onClick={(e) => {
                                  if (isComingSoon) e.preventDefault()
                                  else setIsMegaMenuOpen(false)
                                }}
                                className={`group relative flex items-start gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 ${
                                  isComingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#FAF7F4] active:scale-[0.98]'
                                }`}
                              >
                                {CatIcon && (
                                  <div className="w-8 h-8 rounded-xl bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] group-hover:bg-[#B8763C] group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0 mt-0.5 shadow-matte-xs">
                                    <CatIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="text-base font-serif font-bold text-primary group-hover:text-ring transition-colors duration-300 flex items-center gap-2">
                                    {cat.title}
                                    {isComingSoon && (
                                      <span className="text-[9px] px-2 py-0.5 bg-ring/10 text-ring rounded-full font-bold uppercase tracking-widest font-sans">Soon</span>
                                    )}
                                    <IconArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ml-auto text-ring" />
                                  </span>
                                  <span className="text-[11px] text-muted-foreground/80 font-medium font-sans block mt-0.5 transition-colors duration-300 group-hover:text-primary/70 truncate">
                                    {cat.description}
                                  </span>
                                </div>
                              </Link>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    </div>

                    {/* Right — Featured / Collections */}
                    <div className="p-6 sm:p-7 bg-[#FAF7F4] relative shadow-[inset_1px_0_0_rgba(255,255,255,0.7)] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8580] select-none">
                            Curated For You
                          </p>
                        </div>
                        
                        <motion.div className="flex flex-col gap-2.5" variants={megaMenuContainerVariants} initial="hidden" animate="show">
                          {collectionsList.map((col, idx) => {
                            const ColIcon = col.icon
                            return (
                              <motion.div key={idx} variants={megaMenuItemVariants}>
                                <Link
                                  href={col.href}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl bg-white border border-[#E8E2DB]/70 shadow-matte-xs hover:shadow-matte-sm hover:border-[#B8763C]/40 active:scale-[0.98] transition-all duration-300"
                                >
                                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 shrink-0 shadow-matte-xs ${col.badgeStyle} ${col.hoverBg}`}>
                                    <ColIcon className="w-4.5 h-4.5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-primary block group-hover:text-[#B8763C] transition-colors truncate">{col.title}</span>
                                    <span className="text-[11px] text-muted-foreground/80 font-medium block mt-0.5 truncate">{col.description}</span>
                                  </div>
                                </Link>
                              </motion.div>
                            )
                          })}
                        </motion.div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#E8E2DB]/60">
                        <Link
                          href="/shop"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="group flex items-center justify-center w-full py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B8763C] transition-all duration-300 shadow-matte-xs active:scale-[0.98]"
                        >
                          <span>Explore Full Catalog</span>
                          <IconArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform text-ring group-hover:text-white" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
