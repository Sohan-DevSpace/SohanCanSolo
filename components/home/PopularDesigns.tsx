'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, ChevronLeft, ChevronRight, Star, X } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { IconArrowRight, IconSparkles, IconHeart } from '@/components/shared/PremiumIcons'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

interface Product {
  id: string
  title: string
  main_image_url: string
  hover_image_url: string
  price?: number
  type?: string
  slug?: string
}

interface PopularDesignsProps {
  products: Product[]
}

// Custom data extensions to match the exact badges, ratings, and colors from the design reference image
const PRODUCT_EXTENSIONS: Record<string, { rating: number; reviews: number; badge?: string; discount?: number; colors: string[] }> = {
  'Escape & Explore Tee': { rating: 4.6, reviews: 239, badge: 'Bestseller', discount: 25, colors: ['#1A1A1A', '#A0A5A9', '#1D4ED8'] },
  'Waves Oversized Tee': { rating: 4.7, reviews: 164, badge: 'New', discount: 25, colors: ['#FAF7F4', '#93C5FD'] },
  'Make Today Great Tee': { rating: 4.9, reviews: 212, badge: 'Enquire', discount: 25, colors: ['#FAF7F4', '#D6CFC7', '#93C5FD'] },
  'Alive Hoodie': { rating: 4.9, reviews: 271, badge: 'Bestseller', discount: 25, colors: ['#1A1A1A', '#8A8580', '#FAF7F4'] },
  'Minimal Flower Tee': { rating: 4.5, reviews: 109, badge: 'New', discount: 25, colors: ['#1A1A1A', '#4A4A4A', '#FAF7F4'] },
}

const COLOR_NAMES: Record<string, string> = {
  '#1A1A1A': 'Charcoal',
  '#A0A5A9': 'Heather Grey',
  '#1D4ED8': 'Royal Blue',
  '#FAF7F4': 'Off-White',
  '#93C5FD': 'Light Blue',
  '#D6CFC7': 'Sand',
  '#8A8580': 'Taupe',
  '#4A4A4A': 'Dark Grey',
}

const swatchColors = ['#1A1A1A', '#FAF7F4', '#B8763C', '#2E3F41']

export function PopularDesigns({ products }: PopularDesignsProps) {
  const sectionRef = useReveal()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  
  // Track selected colors for swatches on each card
  const [selectedProductColors, setSelectedProductColors] = useState<Record<string, string>>({})

  // Quick Preview Variant States
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('#1A1A1A')

  // Cart & Wishlist hooks
  const { addItem } = useCartStore()
  const { itemIds, toggleItem } = useWishlistStore()

  // Track scroll position to update pagination dots
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const index = Math.round(scrollLeft / clientWidth)
    setActiveSlide(index)
  }

  // Scroll to specific page
  const scrollToPage = (pageIndex: number) => {
    if (!scrollRef.current) return
    const { clientWidth } = scrollRef.current
    scrollRef.current.scrollTo({
      left: pageIndex * clientWidth,
      behavior: 'smooth',
    })
    setActiveSlide(pageIndex)
  }

  // Scroll left/right with arrows
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const offset = direction === 'left' ? -clientWidth * 0.5 : clientWidth * 0.5
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const handleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const isWishlisted = itemIds.includes(productId)
    toggleItem(productId)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      style: { background: '#111', color: '#fff', borderRadius: '12px', fontSize: '12px' },
      iconTheme: { primary: '#B8763C', secondary: '#fff' },
    })
  }

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const sellingPrice = product.price || 599
    
    addItem({
      id: `${product.id}-M-charcoal`,
      productId: product.id,
      productName: product.title,
      productImage: product.main_image_url,
      variantId: 'default',
      size: 'M',
      color: 'Charcoal',
      colorHex: '#1A1A1A',
      price: sellingPrice,
      quantity: 1,
    })

    toast.success('Added to cart!', {
      style: { background: '#111', color: '#fff', borderRadius: '12px', fontSize: '12px' },
      iconTheme: { primary: '#B8763C', secondary: '#fff' },
    })
  }

  const openPreview = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewProduct(product)
    setSelectedSize('M')
    setSelectedColor('#1A1A1A')
  }

  const handlePreviewAdd = () => {
    if (!previewProduct) return
    const sellingPrice = previewProduct.price || 599
    const colorLabel = selectedColor === '#1A1A1A' ? 'Charcoal' : selectedColor === '#FAF7F4' ? 'Alabaster' : 'Bronze'

    addItem({
      id: `${previewProduct.id}-${selectedSize}-${colorLabel}`,
      productId: previewProduct.id,
      productName: previewProduct.title,
      productImage: previewProduct.main_image_url,
      variantId: 'default',
      size: selectedSize,
      color: colorLabel,
      colorHex: selectedColor,
      price: sellingPrice,
      quantity: 1,
    })

    toast.success('Added to cart!', {
      style: { background: '#111', color: '#fff', borderRadius: '12px', fontSize: '12px' },
      iconTheme: { primary: '#B8763C', secondary: '#fff' },
    })
    setPreviewProduct(null)
  }

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-8 lg:py-12 bg-[#FAF7F4] overflow-hidden select-none relative"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/40 blur-[120px] pointer-events-none mix-blend-overlay" />
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        
        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 lg:mb-8 text-left gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary tracking-tight leading-[1.1] flex items-center gap-2 text-balance">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#B8763C] shrink-0" />
              Trending Now
            </h2>
            <p className="font-body text-sm text-[#8A8580] mt-3 uppercase tracking-widest font-semibold">
              Designs everyone loves
            </p>
          </div>
          <Link
            href="/shop"
            className="font-body text-sm font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-6 py-3 rounded-full hover:bg-[#B8763C] flex items-center gap-2 transition-all duration-300 active:scale-95 group shadow-sm"
          >
            Shop All Trends <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          
          {/* Left Arrow Navigation */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white border border-[#E8E2DB] shadow-md flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 active:scale-95 cursor-pointer text-[#8A8580] hover:text-primary hover:bg-[#FAF7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Navigation */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white border border-[#E8E2DB] shadow-md flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 active:scale-95 cursor-pointer text-[#8A8580] hover:text-primary hover:bg-[#FAF7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-6 stagger snap-x snap-mandatory"
          >
            {products.map((product) => {
              const ext = PRODUCT_EXTENSIONS[product.title] || { rating: 4.8, reviews: 120, colors: ['#FAF7F4'] }
              const originalPrice = Math.round((product.price || 599) * (ext.discount ? 1.33 : 1))
              const isWishlisted = itemIds.includes(product.id)

              // Badge styling dynamically matched
              let badgeStyle = "bg-[#FAF7F4] text-[#8A8580] border-[#E8E2DB]"
              if (ext.badge === 'Bestseller') {
                badgeStyle = "bg-[#F59E0B]/10 text-[#D97706] border-[#F59E0B]/20"
              } else if (ext.badge === 'New') {
                badgeStyle = "bg-[#3B82F6]/10 text-[#2563EB] border-[#3B82F6]/20"
              } else if (ext.badge === 'Enquire') {
                badgeStyle = "bg-[#B8763C]/10 text-[#B8763C] border-[#B8763C]/20"
              }

              return (
                <div
                  key={product.id}
                  className="group/card flex-shrink-0 w-[240px] sm:w-[280px] snap-center flex flex-col h-full gap-3 relative"
                >
                  {/* Image wrapper */}
                  <Link
                    href={product.slug ? `/shop/${product.slug}` : `/shop?search=${encodeURIComponent(product.title)}`}
                    className="block relative overflow-hidden rounded-[2rem] aspect-[3/4] bg-[#F5F1EC] border border-white/40 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 group/image"
                  >
                    {/* Main Image */}
                    <Image
                      src={product.main_image_url}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 240px, 280px"
                      className="object-cover object-center transition-opacity duration-500 ease-in-out group-hover/card:opacity-0"
                    />

                    {/* Hover Image */}
                    <Image
                      src={product.hover_image_url}
                      alt={`${product.title} Alternate`}
                      fill
                      sizes="(max-width: 768px) 240px, 280px"
                      className="object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover/card:opacity-100"
                    />

                    {/* Tag Badge */}
                    {ext.badge && (
                      <span className={`absolute top-4 left-4 z-10 font-body text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${badgeStyle}`}>
                        {ext.badge}
                      </span>
                    )}

                    {/* Quick actions overlay - Slide from bottom */}
                    <div className="absolute inset-x-4 bottom-4 flex gap-2 z-20 translate-y-[150%] opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex-1 bg-white/90 backdrop-blur-xl hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] py-3 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] active:scale-95 border border-white/50 hover:border-transparent"
                      >
                        Quick Add
                      </button>
                      <button
                        onClick={(e) => openPreview(e, product)}
                        className="w-12 h-12 bg-white/90 backdrop-blur-xl hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 active:scale-95 border border-white/50 hover:border-transparent"
                        aria-label="Quick preview"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
                  </Link>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => handleWishlist(e, product.id)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
                    aria-label="Add to wishlist"
                  >
                    <IconHeart
                      size={12}
                      className={isWishlisted ? 'text-[#C53030]' : 'text-[#8A8580] hover:text-primary'}
                      filled={isWishlisted}
                    />
                  </button>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1 px-1 text-left">
                    
                    {/* Color Swatch Dots */}
                    {ext.colors && (
                      <div className="flex gap-1.5 mb-2.5">
                        {ext.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedProductColors(prev => ({ ...prev, [product.id]: color }))}
                            style={{ backgroundColor: color }}
                            aria-label={`Select ${COLOR_NAMES[color] || 'variant'} color`}
                            className={`w-3.5 h-3.5 rounded-full border border-black/10 transition-transform duration-200 hover:scale-110 active:scale-[0.97] cursor-pointer relative before:absolute before:-inset-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C] focus-visible:ring-offset-1 ${
                              selectedProductColors[product.id] === color ? 'ring-1 ring-[#B8763C] scale-110' : ''
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <h3 className="font-display text-sm font-bold text-primary truncate leading-tight text-balance">
                      {product.title}
                    </h3>
                    
                    {/* Rating stars & review counts */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-[#6B6560]">
                      <span className="text-[#B8763C] flex items-center gap-0.5"><Star className="w-3 h-3 fill-current" aria-hidden="true" /> {ext.rating}</span>
                      <span className="opacity-40">•</span>
                      <span>({ext.reviews})</span>
                    </div>

                    <div className="flex items-baseline gap-2.5 mt-auto pt-2">
                      <span className="font-body text-sm font-semibold text-primary tabular-nums">
                        ₹{product.price || 599}
                      </span>
                      {ext.discount && (
                        <span className="font-body text-xs text-[#6B6560] line-through tabular-nums">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(products.length / 2) }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-[0.97] ${
                  activeSlide === i ? 'w-6 bg-[#B8763C]' : 'bg-[#E8E2DB]'
                }`}
                aria-label={`Go to slide page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── QUICK PREVIEW MODAL DRAWER ── */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[480px] bg-white rounded-[28px] overflow-hidden shadow-matte-lg border border-[#E8E2DB]/50 z-10 p-6 flex flex-col gap-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F4] hover:bg-[#E8E2DB]/40 text-primary flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-[0.97]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5F1EC] border border-[#E8E2DB]/40">
                  <Image
                    src={previewProduct.main_image_url}
                    alt={previewProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details Column */}
                <div className="flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary leading-tight pr-4 text-balance">
                      {previewProduct.title}
                    </h3>
                    <p className="font-body text-xs text-[#8A8580] uppercase tracking-wider mt-1 mb-3">
                      {previewProduct.type || 'Product'}
                    </p>

                    <div className="text-base font-semibold text-primary mb-5">
                      ₹{previewProduct.price || 599}
                    </div>

                    {/* Sizes Selection */}
                    <div className="mb-4">
                      <span className="block font-body text-[10px] uppercase tracking-wider font-semibold text-[#8A8580] mb-2">
                        Size: {selectedSize}
                      </span>
                      <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`w-8 h-8 rounded-lg border text-xs font-bold flex items-center justify-center transition-all active:scale-[0.97] ${
                              selectedSize === s
                                ? 'border-[#B8763C] bg-[#FAF7F4] text-[#B8763C]'
                                : 'border-[#E8E2DB] hover:border-primary text-[#8A8580]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors Selection */}
                    <div>
                      <span className="block font-body text-[10px] uppercase tracking-wider font-semibold text-[#8A8580] mb-2">
                        Color
                      </span>
                      <div className="flex gap-2">
                        {swatchColors.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-6 h-6 rounded-full border transition-all active:scale-[0.97] ${
                              selectedColor === c
                                ? 'ring-2 ring-offset-2 ring-[#B8763C]'
                                : 'border-black/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePreviewAdd}
                    className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] mt-6 shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}


