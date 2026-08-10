'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/types/database'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { useWishlistStore } from '@/store/wishlistStore'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Flame, Layers, Printer, Truck, RotateCcw, HelpCircle, 
  CheckCircle2, ShieldCheck, Share2
} from 'lucide-react'
import { AnimatedHeart, AnimatedStar, AnimatedStarFilled, AnimatedCheck, AnimatedClose, AnimatedCart, AnimatedTshirt } from '@/components/shared/AnimatedIcons'
import { IconTruck, IconRefresh, IconShieldLock, IconUser, IconUpload } from '@/components/shared/PremiumIcons'
import { AISizeRecommender } from '@/components/product/AISizeRecommender'
import { AIReviewSummary } from '@/components/shop/AIReviewSummary'
import { AIRecommendations } from '@/components/shop/AIRecommendations'

type Product = Database['public']['Tables']['products']['Row']
type Variant = Database['public']['Tables']['product_variants']['Row']
type Design = Database['public']['Tables']['designs']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface ProductDetailClientProps {
  product: Product & { categories: Category | null }
  variants: Variant[]
  designs: Design[]
  initialReviews?: any[]
  relatedProducts?: any[]
}

/* ─── Helpers ─── */
const COLOR_NAME_TO_HEX: Record<string, string> = {
  black: '#1A1A1A', white: '#FFFFFF', red: '#C53030', blue: '#2B6CB0', navy: '#1A365D',
  green: '#276749', olive: '#5F6B2F', yellow: '#D69E2E', orange: '#DD6B20', pink: '#D53F8C',
  purple: '#6B46C1', grey: '#718096', gray: '#718096', brown: '#7B341E', beige: '#D2B48C',
  cream: '#FFFDD0', teal: '#2C7A7B', maroon: '#7B2D26', coral: '#F56565', lavender: '#B794F4',
  charcoal: '#2D3748', ivory: '#FFFFF0', khaki: '#BDB76B', mustard: '#D4A017', mint: '#68D391',
  'sky blue': '#63B3ED', 'light blue': '#90CDF4', 'dark green': '#1C4532', 'light grey': '#CBD5E0',
  'dark grey': '#4A5568', 'light gray': '#CBD5E0', 'dark gray': '#4A5568',
  'light pink': '#FED7E2', 'baby pink': '#FED7E2', 'hot pink': '#ED64A6',
  'wine': '#722F37', 'burgundy': '#722F37', 'tan': '#D2B48C', 'peach': '#FFDAB9',
  'rust': '#B7410E', 'sage': '#9CAF88', 'sand': '#C2B280',
}

function deriveHexFromColor(color: string, colorHex: string | null): string {
  if (colorHex && colorHex !== '#fff' && colorHex !== '#ffffff') return colorHex
  const key = color.toLowerCase().trim()
  if (COLOR_NAME_TO_HEX[key]) return COLOR_NAME_TO_HEX[key]
  // Try matching partial names
  for (const [name, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (key.includes(name) || name.includes(key)) return hex
  }
  return '#D4CFC8' // neutral fallback instead of white
}

function getStockLabel(variants: Variant[], size: string, color: string): { text: string; level: 'in' | 'low' | 'out' } {
  const variant = variants.find(v => v.size === size && v.color === color)
  if (!variant) return { text: 'Check availability', level: 'low' }
  const stock = (variant as any).stock_quantity ?? 10
  if (stock === 0) return { text: 'Out of stock', level: 'out' }
  if (stock <= 5) return { text: `Only ${stock} left`, level: 'low' }
  return { text: 'In stock', level: 'in' }
}

const SIZE_GUIDE_ROWS = [
  { size: 'XS', chest: '34-36', length: '26', shoulder: '16' },
  { size: 'S', chest: '36-38', length: '27', shoulder: '17' },
  { size: 'M', chest: '38-40', length: '28', shoulder: '18' },
  { size: 'L', chest: '40-42', length: '29', shoulder: '19' },
  { size: 'XL', chest: '42-44', length: '30', shoulder: '20' },
  { size: 'XXL', chest: '44-46', length: '31', shoulder: '21' },
]

/* ─── Accordion Component (Nano-Banana Premium Polish) ─── */
function Accordion({ 
  title, 
  icon,
  iconBg = "bg-[#FAF7F4] border-[#E8E2DB] text-[#B8763C]",
  badge,
  badgeBg = "bg-[#B8763C]/10 text-[#B8763C] border-[#B8763C]/20",
  children, 
  defaultOpen = false 
}: { 
  title: string
  icon?: React.ReactNode
  iconBg?: string
  badge?: string
  badgeBg?: string
  children: React.ReactNode
  defaultOpen?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-[#E8E2DB] hover:border-neutral-400 rounded-2xl mb-3 overflow-hidden transition-all duration-300 shadow-2xs group/acc">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer outline-none transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && (
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover/acc:scale-110 transition-transform duration-300 ${iconBg}`}>
              {icon}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm text-[#1A1A1A] tracking-tight">{title}</span>
            {badge && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-2xs ${badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center shrink-0 text-[#1A1A1A] group-hover/acc:bg-[#1A1A1A] group-hover/acc:text-white transition-all duration-300">
          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="overflow-hidden border-t border-[#E8E2DB]/60 bg-[#FAF7F4]/50"
          >
            <div className="p-5 text-xs text-neutral-700 font-medium leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FormattedDescription({ text }: { text: string }) {
  if (!text) return null
  if (text.includes('## ')) {
    const parts = text.split(/(?=## )/)
    return (
      <div className="space-y-4 my-2">
        {parts.map((part, idx) => {
          const trimmed = part.trim()
          if (!trimmed) return null
          const match = trimmed.match(/^##\s+([^\n]+)\n?([\s\S]*)$/)
          if (match && match[1] && match[2]) {
            const heading = match[1].trim()
            const body = match[2].trim()
            return (
              <div key={idx} className="space-y-1 pt-2 border-t border-[#E8E2DB]/60 first:border-t-0 first:pt-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C87533]">{heading}</h4>
                <p className="text-xs text-[#57524A] leading-relaxed whitespace-pre-line">{body}</p>
              </div>
            )
          }
          return <p key={idx} className="text-xs text-[#57524A] leading-relaxed whitespace-pre-line">{trimmed}</p>
        })}
      </div>
    )
  }
  return <div className="text-xs text-[#57524A] leading-relaxed whitespace-pre-line">{text}</div>
}

/* ─── Countdown Timer ─── */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const getTimeToMidnight = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(23, 59, 59, 999)
      const diff = midnight.getTime() - now.getTime()
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      }
    }
    setTimeLeft(getTimeToMidnight())
    const interval = setInterval(() => setTimeLeft(getTimeToMidnight()), 1000)
    return () => clearInterval(interval)
  }, [])
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    <span className="font-bold text-ring tabular-nums">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                        */
/* ═══════════════════════════════════════════════════════ */

export function ProductDetailClient({ product, variants, designs, initialReviews = [], relatedProducts = [] }: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem } = useCartStore()

  /* ─── Derived data ─── */
  const uniqueColors = useMemo(() => {
    const m = new Map<string, { color: string; hex: string }>()
    variants.forEach(v => { if (v.color && !m.has(v.color)) m.set(v.color, { color: v.color, hex: deriveHexFromColor(v.color, v.color_hex) }) })
    return Array.from(m.values())
  }, [variants])

  const uniqueSizes = useMemo(() => Array.from(new Set(variants.map(v => v.size).filter(Boolean))), [variants])

  /* ─── State ─── */
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(() => uniqueColors[0]?.color || '')
  const [selectedSize, setSelectedSize] = useState(() => uniqueSizes[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { itemIds, toggleItem } = useWishlistStore()
  const isWishlisted = itemIds.includes(product.id)

  const supabase = createClient()
  const [reviewsList] = useState<any[]>(initialReviews)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewImage, setReviewImage] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showSizeFinder, setShowSizeFinder] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showStickyMobileBar, setShowStickyMobileBar] = useState(false)
  const buySectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (buySectionRef.current) {
        const rect = buySectionRef.current.getBoundingClientRect()
        setShowStickyMobileBar(rect.bottom < 50 || rect.top > window.innerHeight)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const [isMounted, setIsMounted] = useState(false)
  const [showMobileSticky, setShowMobileSticky] = useState(true)
  const [showDesktopFloatingBar, setShowDesktopFloatingBar] = useState(false)

  const reviewsRef = useRef<HTMLDivElement>(null)
  const zoomContainerRef = useRef<HTMLDivElement>(null)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)
  const [isDescExpanded, setIsDescExpanded] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])

  /* ─── Scroll Listener for Floating Header ─── */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 650) {
        setShowDesktopFloatingBar(true)
      } else {
        setShowDesktopFloatingBar(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ─── Effects ─── */
  useEffect(() => {
    setIsMounted(true)
    try {
      const key = 'alpona-recently-viewed'
      const stored = JSON.parse(localStorage.getItem(key) || '[]') as any[]
      const updated = [{ id: product.id, name: product.name, slug: product.slug, image: product.images?.[0], price: product.selling_price }, ...stored.filter((p: any) => p.id !== product.id)].slice(0, 10)
      localStorage.setItem(key, JSON.stringify(updated))
      setRecentlyViewed(updated.filter((p: any) => p.id !== product.id).slice(0, 6))
    } catch {}
  }, [product.id, product.name, product.slug, product.images, product.selling_price])

  useEffect(() => {
    if (!reviewsRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      // Hide sticky bar when we reach or scroll past the reviews section
      if (entry && (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight)) {
        setShowMobileSticky(false)
      } else {
        setShowMobileSticky(true)
      }
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0 })
    
    observer.observe(reviewsRef.current)
    return () => observer.disconnect()
  }, [])

  /* ─── Computed ─── */
  const avgRating = useMemo(() => {
    if (!reviewsList.length) return 0
    return +(reviewsList.reduce((a, r) => a + r.rating, 0) / reviewsList.length).toFixed(1)
  }, [reviewsList])

  const ratingDistribution = useMemo(() => {
    const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewsList.forEach(r => { if (r.rating >= 1 && r.rating <= 5) d[r.rating as keyof typeof d]++ })
    return d
  }, [reviewsList])

  const allImages = useMemo(() => {
    const imgs: string[] = []
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(i => {
        if (i && typeof i === 'string' && i.trim() !== '' && !i.includes('placehold')) {
          imgs.push(i)
        }
      })
    }
    
    variants.forEach(v => {
      const vImg = (v as any).image_url
      if (vImg && typeof vImg === 'string' && vImg.trim() !== '' && !vImg.includes('placehold') && !imgs.includes(vImg)) {
        imgs.push(vImg)
      }
    })
    
    return imgs
  }, [product.images, variants])

  useEffect(() => {
    if (selectedColor) {
      const variantWithColor = variants.find(v => v.color === selectedColor && (v as any).image_url)
      if (variantWithColor && (variantWithColor as any).image_url) {
        const idx = allImages.indexOf((variantWithColor as any).image_url)
        if (idx !== -1) {
          setActiveImageIndex(idx)
        }
      }
    }
  }, [selectedColor, variants, allImages])

  const selectedDesign = designs.find(d => d.id === selectedDesignId)
  const mainImage = selectedDesign?.image_url || allImages[activeImageIndex] || allImages[0] || null
  const stockInfo = getStockLabel(variants, selectedSize, selectedColor)

  const discountPct = useMemo(() => {
    const p = product as any
    if (p.discount_percentage > 0) return p.discount_percentage
    if (p.compare_at_price > product.selling_price) return Math.round(((p.compare_at_price - product.selling_price) / p.compare_at_price) * 100)
    return 0
  }, [product])

  const compareAtPrice = (product as any).compare_at_price || null
  const shortDescription = (product as any).short_description || ''
  const materialInfo = (product as any).material_info || ''
  const productCareInfo = (product as any).product_care_info || ''
  const productHighlights: string[] = (product as any).product_highlights || []
  const isNewArrival = (product as any).is_new_arrival || false
  const isBestseller = (product as any).is_bestseller || false
  const isTrending = (product as any).is_trending || false

  const deliveryStart = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }, [])
  const deliveryEnd = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 8); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }, [])

  /* ─── Handlers ─── */
  const handleWishlistToggle = () => {
    toggleItem(product.id)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
  }

  const handleAddToCart = useCallback((redirect = false) => {
    if (designs.length > 0 && !selectedDesignId) { toast.error('Please select a design'); return }
    if (!selectedSize || !selectedColor) { toast.error('Please select size and color'); return }
    const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor)
    if (!variant) { toast.error('This combination is currently unavailable'); return }

    addItem({
      id: `${product.id}-${variant.id}-${selectedDesignId || 'none'}`,
      productId: product.id, productName: product.name, productImage: product.images?.[0] || '',
      designId: selectedDesignId || undefined, designName: selectedDesign?.name, designImage: selectedDesign?.thumbnail_url || '',
      variantId: variant.id, size: selectedSize, color: selectedColor,
      colorHex: uniqueColors.find(c => c.color === selectedColor)?.hex || '#fff',
      price: product.selling_price, quantity,
    })

    if (redirect) { router.push('/checkout'); return }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    toast.success(`${product.name} added to cart!`)
  }, [addItem, designs.length, product, quantity, router, selectedColor, selectedDesignId, selectedDesign, selectedSize, uniqueColors, variants])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.hasAttribute('contenteditable')
      ) {
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddToCart(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAddToCart])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoomContainerRef.current) return
    const rect = zoomContainerRef.current.getBoundingClientRect()
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  const scrollToReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  /* ─── Lightbox Keyboard Handler (Escape, ArrowLeft, ArrowRight) ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxImage) {
        if (e.key === 'Escape') {
          setActiveLightboxImage(null)
        } else if (e.key === 'ArrowRight') {
          const currentIdx = allImages.indexOf(activeLightboxImage || '')
          if (currentIdx !== -1 && currentIdx < allImages.length - 1) {
            setActiveLightboxImage(allImages[currentIdx + 1] || null)
          }
        } else if (e.key === 'ArrowLeft') {
          const currentIdx = allImages.indexOf(activeLightboxImage || '')
          if (currentIdx > 0) {
            setActiveLightboxImage(allImages[currentIdx - 1] || null)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeLightboxImage, allImages])

  return (
    <>
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-[1440px] pb-[120px] lg:pb-0">

        {/* ═══════════ BREADCRUMB ═══════════ */}
        <nav className="flex items-center gap-2 py-8 overflow-x-auto whitespace-nowrap no-scrollbar">
          {[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            ...(product.categories ? [{ label: product.categories.name, href: `/category/${product.categories.slug}` }] : []),
          ].map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <Link href={crumb.href} className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 font-bold tracking-wider active:scale-[0.97]">
                {crumb.label}
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground/50" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </span>
          ))}
          <span className="text-xs font-bold text-foreground truncate max-w-[240px] tracking-wider">{product.name}</span>
        </nav>

        {/* ═══════════ MAIN GRID (7-5 RESPONSIVE BALANCED SPLIT) ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-[1400px] mx-auto pb-12 lg:pb-16">

          {/* ─────────── LEFT: IMAGE GALLERY (7 COLS) ─────────── */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:gap-5 order-1">

            {/* Vertical Thumbnails (Desktop) */}
            {allImages.length > 1 && (
              <div className="hidden lg:flex flex-col gap-3 w-[72px] shrink-0 sticky top-28 self-start max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar py-1">
                {allImages.map((img, idx) => {
                  const isActive = activeImageIndex === idx && !selectedDesignId
                  return (
                    <div key={idx} className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="activeDesktopThumb"
                          className="absolute inset-[-4px] rounded-xl border-[2px] border-foreground pointer-events-none"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <button
                        onClick={() => { setActiveImageIndex(idx); setSelectedDesignId(null) }}
                        className={`relative w-[72px] h-[90px] rounded-[10px] overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.95] ${
                          isActive
                            ? 'opacity-100 shadow-matte-sm'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                      >
                        <Image src={img} alt={`View ${idx + 1}`} width={72} height={90} className="w-full h-full object-cover" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Main Image */}
            <div className="w-full lg:flex-1 min-w-0 lg:sticky lg:top-28 self-start max-w-[620px] mx-auto lg:mx-0">
              <div
                ref={zoomContainerRef}
                className="relative w-full rounded-2xl overflow-hidden bg-[#ECEAE5] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04),inset_0_0_80px_rgba(0,0,0,0.03)] group aspect-[4/5] md:aspect-[4/5]"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {/* Social proof badge */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {discountPct > 0 && (
                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#C53030] text-white rounded-lg shadow-lg">
                      {discountPct}% Off
                    </span>
                  )}
                  {isBestseller && (
                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] text-white rounded-lg shadow-lg border border-white/20">
                      Bestseller
                    </span>
                  )}
                  {isTrending && (
                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#C87533] text-white rounded-lg shadow-lg">
                      Trending
                    </span>
                  )}
                  {stockInfo.level === 'out' && (
                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-lg shadow-lg">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Wishlist & Share buttons cluster */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
                      } else if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Product link copied to clipboard!')
                      }
                    }}
                    whileTap={{ scale: 0.88 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-md text-[#1A1A1A] hover:bg-white hover:text-[#B8763C] transition-all duration-300 cursor-pointer shadow-md"
                    title="Share Product"
                  >
                    <Share2 size={15} />
                  </motion.button>

                  <motion.button
                    onClick={(e) => { e.stopPropagation(); handleWishlistToggle() }}
                    whileTap={{ scale: 0.8 }}
                    animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md ${
                      isWishlisted ? 'bg-[#C53030] text-white' : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-[#C53030]'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <AnimatedHeart size={16} filled={isWishlisted} />
                  </motion.button>
                </div>

                {/* Main image with crossfade */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainImage || 'placeholder'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {mainImage ? (
                      <Image src={mainImage} alt={product.name} fill className="object-contain p-4 md:p-6" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><AnimatedTshirt size={80} className="text-[#D4CFC8]" /></div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Hover zoom lens */}
                {isZooming && mainImage && (
                  <div
                    className="absolute inset-0 z-10 cursor-zoom-in bg-no-repeat"
                    style={{ backgroundImage: `url(${mainImage})`, backgroundSize: '250%', backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%` }}
                  />
                )}

                {/* Bottom actions row */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setActiveLightboxImage(mainImage) }} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 cursor-pointer active:scale-[0.97]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
                    </button>
                  </div>
                  <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
                    <span className="text-xs font-bold text-primary tabular-nums">{activeImageIndex + 1} / {allImages.length || 1}</span>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex lg:hidden gap-3 overflow-x-auto mt-4 pb-2 px-1 snap-x no-scrollbar">
                  {allImages.map((img, idx) => {
                    const isActive = activeImageIndex === idx && !selectedDesignId
                    return (
                      <div key={idx} className="relative shrink-0 snap-center">
                        {isActive && (
                          <motion.div
                            layoutId="activeMobileThumb"
                            className="absolute inset-[-3px] rounded-xl border-[2px] border-foreground pointer-events-none"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <button onClick={() => { setActiveImageIndex(idx); setSelectedDesignId(null) }}
                          className={`w-[60px] h-[76px] rounded-[10px] overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.95] ${
                            isActive ? 'opacity-100' : 'opacity-50'
                          }`}>
                          <Image src={img} alt="" width={60} height={76} className="w-full h-full object-cover" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Design Thumbnails */}
              {designs.length > 0 && (
                <div className="mt-8 mb-4 px-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Choose a Design</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
                    {designs.map(d => {
                      const isActive = selectedDesignId === d.id
                      return (
                        <div key={d.id} className="relative shrink-0 snap-center">
                          {isActive && (
                            <motion.div
                              layoutId="activeDesignThumb"
                              className="absolute inset-[-4px] rounded-2xl border-[2px] border-ring pointer-events-none"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <button onClick={() => setSelectedDesignId(d.id)}
                            className={`relative w-14 h-14 rounded-xl p-1 bg-white border shadow-sm transition-all duration-300 cursor-pointer active:scale-95 ${
                              isActive ? 'border-transparent shadow-matte-sm scale-105' : 'border-border/60 hover:border-border'
                            }`}>
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image src={d.thumbnail_url || '/placeholder.png'} alt={d.name} fill className="object-contain" sizes="56px" />
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}


            </div>
          </div>

          {/* ─────────── RIGHT: PRODUCT INFO (5 DISTINCT MICRO-CARDS) ─────────── */}
          <div className="lg:col-span-5 order-2 space-y-4 lg:sticky lg:top-28 self-start">
            
            {/* CARD 1: PRODUCT HEADER & DOMINANT PRICE */}
            <div className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.05)] space-y-4">
              
              {/* Category + Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                {product.categories && (
                  <Link href={`/category/${product.categories.slug}`} className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8763C] bg-[#B8763C]/10 border border-[#B8763C]/20 px-3 py-1 rounded-full hover:bg-[#B8763C] hover:text-white transition-all duration-200 shadow-2xs">
                    {product.categories.name}
                  </Link>
                )}
                {isNewArrival && <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-700 rounded-full">New</span>}
                {isBestseller && <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-[#1A1A1A] text-white rounded-full">Bestseller</span>}
                {isTrending && <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-700 rounded-full">Trending</span>}
              </div>

              {/* Title */}
              <div>
                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#B8763C]">Studio Original</span>
                <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-[#1A1A1A] leading-tight tracking-tight mt-0.5 text-balance">
                  {(product as any).display_name && (product as any).display_name.trim() !== '' ? (product as any).display_name : product.name}
                </h1>
              </div>

              {/* High Impact Dominant Price Box */}
              <div className="bg-[#FAF7F4] rounded-[18px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-sans font-black text-[#1A1A1A] tabular-nums tracking-tight leading-none">
                      {CURRENCY_SYMBOL}{product.selling_price.toLocaleString('en-IN')}
                    </span>
                    {compareAtPrice && compareAtPrice > product.selling_price && (
                      <span className="text-base text-neutral-400 line-through font-semibold tabular-nums">
                        {CURRENCY_SYMBOL}{compareAtPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 font-semibold mt-1">Inclusive of all taxes • Free shipping &gt; ₹999</p>
                </div>

                {compareAtPrice && compareAtPrice > product.selling_price && (
                  <div className="flex flex-col items-end gap-1.5 shrink-0 self-start sm:self-center">
                    <span className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      Save {discountPct}% Today
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                      Offer ends in <CountdownTimer />
                    </span>
                  </div>
                )}
              </div>

              {/* Ratings & Social Proof */}
              <div className="flex items-center justify-between pt-1">
                <button onClick={scrollToReviews} className="flex items-center gap-1.5 cursor-pointer group active:scale-[0.97]">
                  {reviewsList.length > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        avgRating >= i + 1
                          ? <AnimatedStarFilled key={i} size={14} className="text-amber-500" />
                          : <AnimatedStar key={i} size={14} className="text-neutral-300" />
                      ))}
                    </div>
                  )}
                  <span className="text-xs font-black text-[#1A1A1A]">{avgRating || '5.0'}</span>
                  <span className="text-xs text-neutral-500 group-hover:text-[#B8763C] transition-colors underline decoration-dotted">
                    ({reviewsList.length} reviews)
                  </span>
                </button>

                <span className="text-xs text-emerald-700 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Popular Item
                </span>
              </div>

              {/* Collapsible Description */}
              {shortDescription && (
                <div className="pt-2 border-t border-[#E8E2DB]/60">
                  <p className={`text-xs text-neutral-600 leading-relaxed font-medium transition-all ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                    {shortDescription}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-[11px] font-black uppercase tracking-wider text-[#B8763C] hover:text-[#1A1A1A] mt-1 cursor-pointer transition-colors"
                  >
                    {isDescExpanded ? 'Show Less' : 'Read Full Specs'}
                  </button>
                </div>
              )}

            </div>

            {/* CARD 2: COLOR & SIZE SELECTION */}
            <div className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.05)] space-y-5">
              
              {/* Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Select Color</span>
                    <span className="text-xs font-bold capitalize text-[#1A1A1A] bg-[#FAF7F4] px-3 py-1 rounded-full border border-[#E8E2DB]">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {uniqueColors.map(({ color, hex }) => {
                      const active = selectedColor === color
                      const isWhite = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fff'
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="relative cursor-pointer group flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] active:scale-95 transition-transform"
                          title={color}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center relative shadow-sm transition-all duration-200 ${
                            active ? 'ring-4 ring-[#B8763C]/30 shadow-md scale-105' : 'hover:scale-105 border border-black/10'
                          }`}
                            style={{ backgroundColor: isWhite ? '#ffffff' : hex }}
                          >
                            {active && (
                              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isWhite ? '#1A1A1A' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></motion.svg>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold capitalize transition-colors ${active ? 'text-[#1A1A1A]' : 'text-neutral-400'}`}>
                            {color}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-3 pt-1 border-t border-[#E8E2DB]/60">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Select Size</span>
                    <div className="flex gap-2 items-center">
                      {/* Prominent AI Size Recommender Trigger */}
                      <button
                        onClick={() => setShowSizeFinder(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-[#B8763C] px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Sparkles size={13} className="text-[#B8763C]" />
                        <span>Find My Perfect Size</span>
                      </button>
                      <button onClick={() => setShowSizeGuide(true)} className="text-[11px] font-bold text-neutral-500 hover:text-[#1A1A1A] underline decoration-dotted cursor-pointer">
                        Guide
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {uniqueSizes.map(size => {
                      const active = selectedSize === size
                      const v = variants.find(v => v.size === size && v.color === selectedColor)
                      const oos = v && (v as any).stock_quantity === 0
                      return (
                        <button
                          key={size}
                          onClick={() => !oos && setSelectedSize(size)}
                          disabled={oos}
                          className={`min-h-[44px] flex items-center justify-center rounded-[14px] text-xs font-black transition-all cursor-pointer relative ${
                            oos 
                              ? 'bg-neutral-100 text-neutral-300 line-through cursor-not-allowed' 
                              : active 
                                ? 'bg-[#1A1A1A] text-white shadow-md scale-[1.03]' 
                                : 'bg-[#FAF7F4] text-[#1A1A1A] hover:bg-white hover:border-neutral-400 border border-[#E8E2DB]'
                          }`}
                        >
                          {size}
                          {!oos && v && (v as any).stock_quantity > 0 && (v as any).stock_quantity <= 5 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shadow-sm" title={`Only ${(v as any).stock_quantity} left`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* CARD 3: COMPACT QUANTITY & PRIMARY CTAS */}
            <div ref={buySectionRef} className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex gap-3">
                {/* Sleek Compact Quantity Stepper */}
                <div className="flex items-center bg-[#FAF7F4] border border-[#E8E2DB] rounded-[16px] shrink-0 h-13 px-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-full flex items-center justify-center text-[#1A1A1A] hover:text-[#B8763C] font-black cursor-pointer">
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-[#1A1A1A]">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-full flex items-center justify-center text-[#1A1A1A] hover:text-[#B8763C] font-black cursor-pointer">
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <motion.button
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  animate={addedToCart ? { scale: [1, 1.08, 1] } : {}}
                  transition={addedToCart ? { duration: 0.4, ease: 'easeOut' } : {}}
                  onClick={() => handleAddToCart(false)}
                  disabled={stockInfo.level === 'out' || (designs.length > 0 && !selectedDesignId)}
                  className={`flex-1 h-13 rounded-[16px] font-black text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    addedToCart 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-[#B8763C] hover:bg-[#a66833] text-white shadow-md shadow-[#B8763C]/30'
                  }`}
                >
                  {addedToCart ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}><AnimatedCheck size={16} /></motion.span> : <AnimatedCart size={16} />}
                  <span>{addedToCart ? 'Added To Cart' : 'Add to Cart'}</span>
                </motion.button>
              </div>

              {/* Buy It Now CTA */}
              <button
                onClick={() => handleAddToCart(true)}
                disabled={stockInfo.level === 'out' || (designs.length > 0 && !selectedDesignId)}
                className="w-full h-12 rounded-[16px] font-black text-xs uppercase tracking-[0.18em] bg-[#1A1A1A] text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Buy It Now
              </button>
            </div>

            {/* CARD 4: SHIPPING & DELIVERY */}
            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-[20px] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold border-b border-[#E8E2DB] pb-3">
                <span className="flex items-center gap-2 text-[#1A1A1A]">
                  <Truck size={16} className="text-[#B8763C]" />
                  <span>Standard Express Delivery</span>
                </span>
                <span className="text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  Free &gt; ₹999
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                Estimated delivery: <span className="font-bold text-[#1A1A1A]">{deliveryStart} – {deliveryEnd}</span> across India.
              </p>
            </div>

            {/* CARD 5: PAYMENT ICONS & SSL SECURITY */}
            <div className="bg-white border border-[#E8E2DB] rounded-[20px] p-4 flex items-center justify-between text-xs font-bold text-neutral-600">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-[11px]">
                <ShieldCheck size={16} />
                <span>256-Bit SSL Encrypted Payment</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider">
                <span>UPI</span> • <span>Cards</span> • <span>NetBanking</span> • <span>COD</span>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════ FULL-WIDTH STUDIO SPECS & CRAFTSMANSHIP ═══════════ */}
        <div className="max-w-[1400px] mx-auto my-8 lg:my-12 bg-white border border-[#E8E2DB] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#E8E2DB] pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Architectural Details</span>
            <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-[#1A1A1A] tracking-tight mt-0.5">
              Product Specifications & Craftsmanship
            </h3>
          </div>

          <div className="space-y-3">
            <Accordion 
              title="Overview & Design Intent" 
              badge="Signature Tailoring"
              icon={<Sparkles size={18} />}
              iconBg="bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold shadow-xs"
              badgeBg="bg-amber-500/10 text-amber-700 border-amber-500/30 font-extrabold"
              defaultOpen
            >
              <FormattedDescription text={product.description || 'An everyday essential, elevated. Cut from our signature heavyweight cotton, this piece offers a structured yet relaxed drape. Designed with meticulous attention to detail, it serves as the perfect foundation for any minimalist wardrobe.'} />
              <ul className="mt-4 space-y-2 list-none text-neutral-700 font-medium">
                {(productHighlights.length > 0 ? productHighlights : ['Signature oversized silhouette', 'Ultra-soft bio-washed finish', 'Ribbed collar for shape retention', 'Seamless double-needle stitching', 'Ethically crafted']).map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs bg-white p-2.5 rounded-xl border border-[#E8E2DB]/80 shadow-2xs">
                    <span className="text-[#B8763C] mt-0.5 text-xs">◆</span> <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Accordion>

            <Accordion 
              title="Fabric & Premium Materials" 
              badge="240 GSM Organic Cotton"
              icon={<Layers size={18} />}
              iconBg="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold shadow-xs"
              badgeBg="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-extrabold"
            >
              {materialInfo || 'Woven from 100% premium long-staple combed cotton. The fabric undergoes a specialized bio-wash treatment to achieve an exceptionally soft hand-feel, while pre-shrinking ensures the garment maintains its precise architectural fit wash after wash.'}
            </Accordion>

            <Accordion 
              title="Printing & DTG Technology" 
              badge="OEKO-TEX® Vegan Inks"
              icon={<Printer size={18} />}
              iconBg="bg-purple-500/10 border-purple-500/30 text-purple-600 font-bold shadow-xs"
              badgeBg="bg-purple-500/10 text-purple-700 border-purple-500/30 font-extrabold"
            >
              Artworks are applied using state-of-the-art Direct-to-Garment (DTG) technology, ensuring gallery-quality resolution and absolute color fidelity. We exclusively utilize OEKO-TEX® certified, water-based vegan inks that are entirely free of harmful chemicals.
            </Accordion>

            <Accordion 
              title="Shipping & Express Delivery" 
              badge="3-5 Days India Express"
              icon={<Truck size={18} />}
              iconBg="bg-sky-500/10 border-sky-500/30 text-sky-600 font-bold shadow-xs"
              badgeBg="bg-sky-500/10 text-sky-700 border-sky-500/30 font-extrabold"
            >
              <div className="space-y-3 text-xs leading-relaxed">
                <p><span className="text-[#1A1A1A] font-bold block mb-0.5">Artisanal Production</span> Each piece is made to order. Please allow 2–3 business days for our studio to craft your garment.</p>
                <p><span className="text-[#1A1A1A] font-bold block mb-0.5">Express Delivery</span> 3–5 business days across India via our premium logistics partners.</p>
                <p><span className="text-[#1A1A1A] font-bold block mb-0.5">Complimentary Shipping</span> Enjoy free expedited shipping on all domestic orders above ₹999.</p>
              </div>
            </Accordion>

            <Accordion 
              title="Returns & Garment Care" 
              badge="7-Day Hassle Free"
              icon={<RotateCcw size={18} />}
              iconBg="bg-rose-500/10 border-rose-500/30 text-rose-600 font-bold shadow-xs"
              badgeBg="bg-rose-500/10 text-rose-700 border-rose-500/30 font-extrabold"
            >
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <p className="text-[#1A1A1A] font-bold mb-1">Returns & Exchanges</p>
                  <p>As each garment is crafted specifically for you upon order, we accept returns exclusively in the rare event of a manufacturing defect or transit damage. Please contact our concierge within 7 days of receipt for an immediate resolution.</p>
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-bold mb-1">Garment Care</p>
                  <p>{productCareInfo ? productCareInfo : 'To preserve the integrity of the fabric and print, machine wash cold inside out on a gentle cycle. Lay flat to dry in the shade. Do not iron directly on the artwork.'}</p>
                </div>
              </div>
            </Accordion>

            <Accordion 
              title="Frequently Asked Questions (FAQ)" 
              badge="Unisex Fit Guide"
              icon={<HelpCircle size={18} />}
              iconBg="bg-[#B8763C]/10 border-[#B8763C]/30 text-[#B8763C] font-bold shadow-xs"
              badgeBg="bg-[#B8763C]/10 text-[#B8763C] border-[#B8763C]/30 font-extrabold"
            >
              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <p className="text-[#1A1A1A] font-bold mb-1">Is the fit unisex?</p>
                  <p>Yes, our garments are engineered with a considered, modern unisex silhouette designed to flatter all body types effortlessly.</p>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        {/* ═══════════ CRAFTSMANSHIP BENTO GRID (LAYOUT DIVERSITY) ═══════════ */}
        <div className="max-w-[1400px] mx-auto my-8 lg:my-12 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Studio Benchmark</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1A1A1A]">
              Why Alpona Apparel Stands Out
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Every garment is engineered with architectural precision, sustainable inks, and heavy GSM weight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Bento 1: 240 GSM Organic Cotton (Spans 2 Cols) */}
            <div className="md:col-span-2 bg-[#1A1A1A] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
              <div className="relative z-10 space-y-2 max-w-sm">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[#B8763C] text-white">
                  Heavyweight Structure
                </span>
                <h4 className="text-xl font-serif font-extrabold text-white">240 GSM Combed Organic Cotton</h4>
                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  Engineered with zero-torque ring-spun yarns to preserve crisp silhouette lines and prevent post-wash distortion.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs font-bold text-[#B8763C] relative z-10">
                <span>100% Bio-Washed</span> • <span>Pre-Shrunk Architecture</span>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#B8763C]/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
            </div>

            {/* Bento 2: OEKO-TEX DTG Inks */}
            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 flex flex-col justify-between group hover:border-purple-300 transition-all shadow-2xs">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
                  <Printer size={20} />
                </div>
                <h5 className="text-base font-extrabold text-[#1A1A1A]">OEKO-TEX® Inks</h5>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                  Water-based vegan DTG prints with zero cracking and ultra-vibrant Pantone accuracy.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 mt-4 block">100% Non-Toxic</span>
            </div>

            {/* Bento 3: 3-5 Days Express India */}
            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 flex flex-col justify-between group hover:border-sky-300 transition-all shadow-2xs">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center font-bold">
                  <Truck size={20} />
                </div>
                <h5 className="text-base font-extrabold text-[#1A1A1A]">3-5 Days Express</h5>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                  Rapid nationwide fulfillment with real-time SMS & WhatsApp tracking updates.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 mt-4 block">Free &gt; ₹999</span>
            </div>

            {/* Bento 4: 7-Day Returns */}
            <div className="md:col-span-3 lg:col-span-4 bg-gradient-to-br from-[#FAF7F4] to-white border border-[#E8E2DB] rounded-3xl p-6 sm:p-8 flex items-center gap-6 group hover:border-rose-300 transition-all shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <RotateCcw size={24} />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h5 className="text-base font-extrabold text-[#1A1A1A]">7-Day Hassle-Free Returns</h5>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                  Not satisfied? Return within 7 days for a full refund on manufacturing defects or transit damage. No questions asked.
                </p>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">Customer-First Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ MOBILE INLINE PURCHASE (APPEARS WHEN STICKY HIDES) ═══════════ */}
        <div className="md:hidden px-4 pb-12">
          <div className="flex flex-col gap-4 max-w-xl mx-auto w-full p-6 bg-white border border-[#E8E2DB] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.12)] rounded-3xl">
            <div className="flex items-center justify-between px-1">
              <span className="text-2xl font-sans font-black text-[#1A1A1A] tabular-nums leading-tight block tracking-tight">{CURRENCY_SYMBOL}{product.selling_price.toLocaleString('en-IN')}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${stockInfo.level === 'in' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : stockInfo.level === 'low' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                {stockInfo.level === 'out' ? 'Sold Out' : stockInfo.text}
              </span>
            </div>
            
            {(designs.length > 0 && !selectedDesignId) ? (
              <div className="w-full text-center font-black text-[10px] uppercase tracking-widest text-[#B8763C] py-4 border-2 border-dashed border-[#B8763C]/30 rounded-2xl bg-[#B8763C]/5">
                Select a Design First
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full mt-2">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAddToCart(false)} disabled={stockInfo.level === 'out'}
                  className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.18em] transition-all active:scale-[0.97] flex items-center justify-center ${
                    addedToCart 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-[#1A1A1A] text-white shadow-[0_8px_25px_-6px_rgba(26,26,26,0.35)] hover:bg-[#B8763C]'
                  } ${stockInfo.level === 'out' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                  {addedToCart ? 'Added to Cart' : 'Add To Cart'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAddToCart(true)} disabled={stockInfo.level === 'out'}
                  className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.18em] bg-gradient-to-r from-[#B8763C] to-[#9E5F2A] text-white shadow-[0_8px_25px_-6px_rgba(184,118,60,0.35)] flex items-center justify-center ${stockInfo.level === 'out' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                  Buy It Now
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ REVIEWS SECTION ═══════════ */}
        <div ref={reviewsRef} className="py-12 lg:py-20 my-12 bg-[#F7F4F0] border border-[#E8E2DB] rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Verified Feedback</span>
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-[#1A1A1A] tracking-tight mt-1 mb-2 text-balance">Client Reviews</h2>
            <p className="text-xs text-neutral-500 font-semibold">Real experiences from our community</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-14 items-start">
            {/* Summary card */}
            <div className="bg-white border border-[#E8E2DB] rounded-3xl p-6 lg:p-8 lg:sticky lg:top-28 shadow-sm">
              <div className="text-center mb-6">
                <p className="text-5xl font-serif font-black text-[#1A1A1A] leading-none">{avgRating || '—'}</p>
                <div className="flex justify-center gap-1 my-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    avgRating >= i + 1 ? <AnimatedStarFilled key={i} size={18} className="text-amber-500" /> : <AnimatedStar key={i} size={18} className="text-neutral-300" />
                  ))}
                </div>
                <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">{reviewsList.length} Reviews</p>
              </div>
              <div className="space-y-2 mb-6">
                {[5,4,3,2,1].map(s => {
                  const c = ratingDistribution[s as keyof typeof ratingDistribution] || 0
                  const pct = reviewsList.length > 0 ? (c / reviewsList.length) * 100 : 0
                  return (
                    <div key={s} className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-neutral-600 w-4 text-right tabular-nums">{s}</span>
                      <AnimatedStarFilled size={11} className="text-amber-500" />
                      <div className="flex-1 h-2 bg-[#FAF7F4] rounded-full overflow-hidden border border-[#E8E2DB]/60">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full bg-[#1A1A1A] rounded-full" />
                      </div>
                      <span className="text-xs text-neutral-500 w-6 text-right tabular-nums font-semibold">{c}</span>
                    </div>
                  )
                })}
              </div>
              <motion.button
                whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.15em] bg-[#1A1A1A] text-white hover:bg-[#B8763C] transition-all duration-300 cursor-pointer shadow-md"
              >
                Write a Review
              </motion.button>

              <AnimatePresence>
                {showReviewForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-6 pt-6 border-t border-[#E8E2DB] space-y-4">
                      <div>
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider block mb-2">Rating</label>
                        <div className="flex gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button key={i} onClick={() => setRating(i + 1)} className="cursor-pointer hover:scale-110 transition-all duration-200 active:scale-[0.97]">
                              <AnimatedStarFilled size={24} className={i < rating ? 'text-amber-500' : 'text-neutral-300'} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider block mb-2">Your Review</label>
                        <textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="What did you love?"
                          className="w-full bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all resize-none font-medium" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider block mb-2">Photo URL</label>
                        <input type="url" value={reviewImage} onChange={e => setReviewImage(e.target.value)} placeholder="https://..."
                          className="w-full bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all font-medium" />
                      </div>
                      <Button onClick={async () => {
                        if (!reviewComment.trim()) { toast.error('Please enter review text'); return }
                        setSubmittingReview(true)
                        try {
                          const { data: { user } } = await supabase.auth.getUser()
                          if (!user) { toast.error('Please log in'); return }
                          const { error } = await supabase.from('reviews').insert({ user_id: user.id, product_id: product.id, rating, comment: reviewComment, images: reviewImage ? [reviewImage] : [], status: 'pending' })
                          if (error) throw error
                          toast.success('Review submitted!'); setReviewComment(''); setReviewImage(''); setRating(5); setShowReviewForm(false)
                        } catch (e: any) { toast.error(e.message || 'Failed') } finally { setSubmittingReview(false) }
                      }} disabled={submittingReview} className="w-full h-12 bg-gradient-to-r from-[#B8763C] to-[#9E5F2A] hover:from-[#9E5F2A] hover:to-[#1A1A1A] text-white font-black text-xs uppercase tracking-[0.15em] rounded-2xl cursor-pointer active:scale-[0.97] shadow-md">
                        {submittingReview ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Review'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Review Summary Header */}
            <div className="mb-6">
              <AIReviewSummary productName={product.name} reviews={reviewsList} />
            </div>

            {/* Review cards */}
            <div className="space-y-4">
              {reviewsList.length === 0 ? (
                <div className="bg-white border border-[#E8E2DB] p-12 sm:p-16 rounded-3xl text-center shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mx-auto mb-4"><IconUser className="w-6 h-6 text-[#B8763C]" /></div>
                  <h3 className="text-xl font-serif font-black text-[#1A1A1A] mb-2 text-balance">No Reviews Yet</h3>
                  <p className="text-xs text-neutral-500 font-semibold">Be the first to share your experience with this item.</p>
                </div>
              ) : reviewsList.map((r, reviewIndex) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: reviewIndex * 0.08 }} className="bg-white border border-[#E8E2DB] p-6 rounded-3xl shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <AnimatedStarFilled key={i} size={14} className={i < r.rating ? 'text-amber-500' : 'text-neutral-300'} />)}</div>
                    <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-4 font-medium">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mb-4">{r.images.map((img: string, j: number) => (
                      <button key={j} onClick={() => setActiveLightboxImage(img)} className="w-14 h-14 rounded-xl overflow-hidden border border-[#E8E2DB] hover:border-[#1A1A1A] transition-all duration-200 cursor-zoom-in relative">
                        <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                      </button>
                    ))}</div>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#E8E2DB]">
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-black uppercase overflow-hidden shadow-xs">
                      {r.profiles?.avatar_url ? <Image src={r.profiles.avatar_url} alt="" width={32} height={32} className="object-cover" /> : r.profiles?.full_name?.charAt(0) || 'V'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1A1A1A]">{r.profiles?.full_name || 'Verified Buyer'}</p>
                      <p className="text-[10px] text-emerald-700 font-black uppercase tracking-wider flex items-center gap-0.5"><AnimatedCheck size={10} />Verified Purchase</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ COMPLETE THE LOOK ═══════════ */}
        {relatedProducts.length > 0 && (
          <div className="py-12 lg:py-20 my-12 bg-white border border-[#E8E2DB] rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-xs">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Curated Selection</span>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#1A1A1A] tracking-tight mt-0.5 text-balance">Complete The Look</h2>
              </div>
              <Link href="/shop" className="text-xs font-black text-[#1A1A1A] hover:text-[#B8763C] uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all duration-200 border-b-2 border-[#1A1A1A] hover:border-[#B8763C] pb-0.5">
                View All <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp: any) => (
                <Link key={rp.id} href={`/shop/${rp.slug}`} className="group active:scale-[0.98]">
                  <div className="aspect-[3/4] relative overflow-hidden bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl mb-3 shadow-2xs group-hover:shadow-md transition-all flex items-center justify-center">
                    {rp.images?.[0] && !rp.images[0].includes('placehold') ? (
                      <Image src={rp.images[0]} alt={rp.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <AnimatedTshirt size={40} className="text-neutral-300" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#B8763C] font-black uppercase tracking-[0.18em] mb-0.5 truncate">{rp.category?.name || 'Apparel'}</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] truncate group-hover:text-[#B8763C] transition-all duration-200">{rp.display_name || rp.name}</p>
                  <p className="text-xs sm:text-sm font-sans font-black text-[#1A1A1A] mt-0.5 tabular-nums">{CURRENCY_SYMBOL}{rp.selling_price?.toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ RECENTLY VIEWED ═══════════ */}
        {isMounted && recentlyViewed.length > 0 && (
          <div className="py-12 lg:py-16 my-12 bg-[#FAF7F4] border border-[#E8E2DB] rounded-[2.5rem] p-6 sm:p-8 shadow-2xs">
            <div className="text-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Your Browsing History</span>
              <h2 className="text-2xl font-serif font-extrabold text-[#1A1A1A] tracking-tight mt-0.5 text-balance">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentlyViewed.map((rp: any) => (
                <Link key={rp.id} href={`/shop/${rp.slug}`} className="group active:scale-[0.98]">
                  <div className="aspect-[3/4] relative overflow-hidden bg-white border border-[#E8E2DB] rounded-2xl mb-2.5 shadow-2xs group-hover:shadow-md transition-all flex items-center justify-center">
                    {rp.image && !rp.image.includes('placehold') ? (
                      <Image src={rp.image} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 16vw" />
                    ) : (
                      <AnimatedTshirt size={32} className="text-neutral-300" />
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-[#1A1A1A] truncate group-hover:text-[#B8763C] transition-all duration-200">{rp.name}</p>
                  <p className="text-xs font-sans font-black text-neutral-600 tabular-nums">{CURRENCY_SYMBOL}{rp.price?.toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ AI SMART RECOMMENDATIONS ═══════════ */}
        <AIRecommendations productId={product.id} categoryId={product.category_id || undefined} title="AI Smart Pairings" />

        {/* ═══════════ NEWSLETTER / PRE-FOOTER ═══════════ */}
        <div className="py-12 lg:py-16 my-12 bg-[#1A1A1A] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-white/10 relative overflow-hidden">
          {/* Glassmorphic glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B8763C]/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-16 w-64 h-64 bg-[#B8763C]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-xl mx-auto text-center relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Stay Connected</span>
            <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-white tracking-tight mt-1 mb-2 text-balance">Join the Alpona Club</h2>
            <p className="text-xs text-neutral-300 mb-6 font-medium">Get early access to exclusive drops, private offers, and style releases.</p>
            
            {/* Decorative line */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#B8763C] to-transparent mx-auto mb-6" />
            
            <div className="flex gap-2 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 h-12 bg-white/10 border border-white/20 rounded-2xl px-4 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#B8763C] focus:ring-1 focus:ring-[#B8763C] transition-all font-medium backdrop-blur-sm" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                className="h-12 px-6 bg-gradient-to-r from-[#B8763C] to-[#9E5F2A] text-white font-black text-xs uppercase tracking-[0.15em] rounded-2xl hover:brightness-110 transition-all duration-200 cursor-pointer shadow-lg shadow-[#B8763C]/25">
                Subscribe
              </motion.button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-3 font-medium">Join 10,000+ members. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      {/* ═══════════ SIZE GUIDE MODAL ═══════════ */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSizeGuide(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#E8E2DB] cursor-default">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-black text-[#1A1A1A] text-balance">Size Guide</h3>
                <button onClick={() => setShowSizeGuide(false)} className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all duration-200 cursor-pointer active:scale-[0.97] text-[#1A1A1A]"><AnimatedClose size={16} /></button>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-[#E8E2DB]">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#FAF7F4] border-b border-[#E8E2DB]">
                    {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'].map(h => <th key={h} className="text-left py-3.5 px-5 font-black text-[#1A1A1A] uppercase tracking-[0.1em] text-xs">{h}</th>)}
                  </tr></thead>
                  <tbody>{SIZE_GUIDE_ROWS.map(r => (
                    <tr key={r.size} className={`border-b border-[#E8E2DB] last:border-b-0 ${selectedSize === r.size ? 'bg-[#FAF7F4]' : 'hover:bg-[#FAF7F4]/50'} transition-all duration-200`}>
                      <td className="py-3.5 px-5 font-black text-[#1A1A1A]">{r.size}{selectedSize === r.size && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#B8763C] inline-block" />}</td>
                      <td className="py-3.5 px-5 text-neutral-600 tabular-nums font-semibold">{r.chest}</td>
                      <td className="py-3.5 px-5 text-neutral-600 tabular-nums font-semibold">{r.length}</td>
                      <td className="py-3.5 px-5 text-neutral-600 tabular-nums font-semibold">{r.shoulder}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="text-xs text-neutral-400 mt-4">Lay a similar garment flat to measure. Chest: armpit to armpit. Length: shoulder to hem.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ SIZE FINDER MODAL ═══════════ */}
      <AnimatePresence>
        {showSizeFinder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSizeFinder(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8E2DB] cursor-default">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Fit Calculator</span>
                  <h3 className="text-xl font-serif font-black text-[#1A1A1A] mt-0.5">Find My Size</h3>
                </div>
                <button onClick={() => setShowSizeFinder(false)} className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all duration-200 cursor-pointer active:scale-[0.97] text-[#1A1A1A]"><AnimatedClose size={16} /></button>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 font-medium">Select your preferred fit style for {product.name}:</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Snug Fit', rec: 'S' },
                    { label: 'Regular', rec: 'M' },
                    { label: 'Oversized', rec: 'L' },
                  ].map((fit, idx) => (
                    <button key={idx} onClick={() => { setSelectedSize(fit.rec); setShowSizeFinder(false); toast.success(`Selected size ${fit.rec} for ${fit.label}`) }}
                      className="p-4 rounded-2xl border border-[#E8E2DB] bg-[#FAF7F4] hover:border-[#1A1A1A] hover:bg-white text-center transition-all duration-200 cursor-pointer group active:scale-95">
                      <span className="block text-xs font-black text-[#1A1A1A] group-hover:text-[#B8763C]">{fit.label}</span>
                      <span className="block text-lg font-serif font-black text-[#B8763C] mt-1">{fit.rec}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ DESKTOP FLOATING BAR (SCROLL REVEAL) ═══════════ */}
      <AnimatePresence>
        {showDesktopFloatingBar && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-6 px-6 py-3 bg-[#1A1A1A]/95 text-white backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center gap-3">
              {allImages[0] && (
                <div className="w-9 h-11 rounded-lg overflow-hidden relative shrink-0 border border-white/20">
                  <Image src={allImages[0]} alt="" fill sizes="36px" className="object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs font-serif font-bold text-white truncate max-w-[200px]">{product.name}</p>
                <p className="text-xs font-sans font-black text-[#B8763C] tabular-nums">{CURRENCY_SYMBOL}{product.selling_price.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="h-6 w-px bg-white/15" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300">Size: {selectedSize}</span>
              <span className="text-[10px] text-neutral-500">•</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300">Color: {selectedColor}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddToCart(false)}
              disabled={stockInfo.level === 'out'}
              className="h-10 px-5 rounded-full font-black text-xs uppercase tracking-wider bg-[#B8763C] hover:bg-[#a66833] text-white transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              {addedToCart ? <AnimatedCheck size={14} /> : <AnimatedCart size={14} />}
              <span>{addedToCart ? 'Added' : 'Add to Cart'}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ LIGHTBOX MODAL ═══════════ */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLightboxImage(null)} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 cursor-zoom-out">
            {/* Close button */}
            <button onClick={() => setActiveLightboxImage(null)} className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 cursor-pointer active:scale-95">
              <AnimatedClose size={20} />
            </button>

            {/* Previous arrow */}
            {allImages.indexOf(activeLightboxImage || '') > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); const idx = allImages.indexOf(activeLightboxImage || ''); if (idx > 0) setActiveLightboxImage(allImages[idx - 1] || null) }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 backdrop-blur-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}

            {/* Next arrow */}
            {allImages.indexOf(activeLightboxImage || '') < allImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); const idx = allImages.indexOf(activeLightboxImage || ''); if (idx < allImages.length - 1) setActiveLightboxImage(allImages[idx + 1] || null) }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 backdrop-blur-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            )}

            {/* Image counter */}
            <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/15">
              <span className="text-xs font-bold text-white tabular-nums">{allImages.indexOf(activeLightboxImage) + 1} / {allImages.length}</span>
            </div>

            <div className="relative w-[90vw] h-[70vh] max-w-5xl">
              <Image src={activeLightboxImage} alt="Enlarged view" fill className="object-contain" sizes="100vw" quality={100} priority />
            </div>
            {/* Interactive Thumbnail Carousel in Lightbox */}
            {allImages.length > 1 && (
              <div onClick={e => e.stopPropagation()} className="flex gap-2.5 mt-4 max-w-lg overflow-x-auto no-scrollbar py-2 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLightboxImage(img)}
                    className={`w-12 h-14 rounded-xl overflow-hidden relative border-2 transition-all cursor-pointer ${
                      activeLightboxImage === img ? 'border-[#B8763C] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ MOBILE STICKY LUXURY BAR ═══════════ */}
      <AnimatePresence>
        {showMobileSticky && (
          <motion.div 
            initial={{ y: 120, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 120, opacity: 0 }} 
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-[82px] left-3 right-3 z-30 bg-[#1A1A1A]/95 text-white backdrop-blur-2xl border border-white/15 rounded-3xl lg:hidden shadow-[0_-12px_40px_rgba(0,0,0,0.35)] overflow-hidden"
          >
            {/* Top highlight line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8763C] to-transparent opacity-80" />
            
            <div className="flex items-center gap-3.5 px-5 py-3.5">
              <div className="shrink-0">
                <span className="text-lg font-sans font-black text-white tabular-nums leading-tight block tracking-tight">
                  {CURRENCY_SYMBOL}{product.selling_price.toLocaleString('en-IN')}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${stockInfo.level === 'in' ? 'text-emerald-400' : stockInfo.level === 'low' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {stockInfo.level === 'out' ? 'Sold Out' : stockInfo.text}
                </span>
              </div>
              
              {(designs.length > 0 && !selectedDesignId) ? (
                <div className="flex-1 text-center font-black text-[10px] uppercase tracking-widest text-[#B8763C] py-2.5 bg-[#B8763C]/10 rounded-2xl border border-[#B8763C]/20">
                  Select Design First
                </div>
              ) : (
                <div className="flex-1 flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(false)} disabled={stockInfo.level === 'out'}
                    className={`flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-md flex items-center justify-center ${
                      addedToCart 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#C87533] text-white hover:bg-[#A65E28]'
                    } ${stockInfo.level === 'out' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {addedToCart ? 'Added' : 'Add'}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(true)} disabled={stockInfo.level === 'out'}
                    className={`flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 border-2 border-white text-white hover:bg-white hover:text-black ${
                      stockInfo.level === 'out' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}>
                    Buy Now
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
