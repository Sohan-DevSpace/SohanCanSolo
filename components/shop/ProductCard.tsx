'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { AnimatedHeart, AnimatedCheck } from '@/components/shared/AnimatedIcons'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_URL } from '@/constants/config'
import { IconClose, IconSparkles, IconCart } from '@/components/shared/PremiumIcons'

export interface ProductColorway {
  color: string
  colorHex: string
  imageUrl: string
}

export interface DisplayProduct {
  id: string
  name: string
  slug: string
  category: string
  parentCategory: string
  subcategory?: string
  productType?: string
  categorySlug?: string
  sellingPrice: number
  basePrice: number
  discountPct: number
  badge?: string
  image: string
  colors: string[]
  gender: string[]
  sizes: string[]
  isMock: boolean
  colorways?: ProductColorway[]
  description?: string
  shortDescription?: string
  materialInfo?: string
  estimatedDelivery?: string
  isNewArrival?: boolean
  isBestseller?: boolean
  createdAt?: string
}

interface ProductCardProps {
  product: DisplayProduct
  isWishlisted: boolean
  onWishlistToggle: (id: string) => void
  onQuickAdd: (product: DisplayProduct) => void
  priority?: boolean
  index?: number
}

const SWATCH_COLORS: { name: string; hex: string }[] = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Grey', hex: '#7A7A7A' },
  { name: 'Blue', hex: '#1B2A4A' },
  { name: 'Green', hex: '#1D3A20' },
  { name: 'Red', hex: '#8B1E1E' },
  { name: 'Beige', hex: '#DCD1C4' },
  { name: 'Lavender', hex: '#D4B2D8' },
]

const badgeConfig: Record<string, string> = {
  'Best Seller': 'bg-[#1A1A1A] border-white/20',
  'New': 'bg-[#C87533] border-white/20',
  'Trending': 'bg-[#C87533] border-white/20',
}

export function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
  onQuickAdd,
  priority = false,
  index = 0,
}: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [added, setAdded] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [hoveredColorHex, setHoveredColorHex] = useState<string | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const discountPct = product.discountPct
  const activeColorway = product.colorways?.find(cw => cw.colorHex === hoveredColorHex)
  const displayImage = activeColorway?.imageUrl || product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80'

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: displayImage,
    description: product.description || product.shortDescription || `${product.name} by Alpona`,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${product.slug}`,
      priceCurrency: 'INR',
      price: product.sellingPrice,
      availability: 'https://schema.org/InStock',
    },
  }

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 })
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 })
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(200,117,51,0.12), transparent 65%)`

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    x.set(px)
    y.set(py)
  }, [x, y, isTouchDevice])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }, [product, onQuickAdd])

  const badgeClass = product.badge ? (badgeConfig[product.badge] || badgeConfig['Best Seller']) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.3),
      }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full flex flex-col"
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="relative h-full flex flex-col [transform:translateZ(0)]"
        >
          {/* Glare overlay */}
          <motion.div
            className="absolute inset-0 rounded-[1.75rem] pointer-events-none z-30 opacity-0 group-hover:opacity-60 transition-opacity duration-700 mix-blend-overlay"
            style={{ background: glareBg }}
          />

          {/* Double-Bezel Card Container */}
          <div className="h-full rounded-[1.75rem] p-1.5 bg-gradient-to-b from-white via-[#FAF7F4] to-[#E8E2DB]/50 border border-[#E8E2DB] shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(200,117,51,0.2)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col group-hover:-translate-y-1 relative">
            <div className="h-full bg-white rounded-[calc(1.75rem-0.375rem)] p-2.5 flex flex-col justify-between relative overflow-hidden">
              
              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20 pointer-events-none">
                {badgeClass && (
                  <span className={`text-white text-[10px] font-extrabold uppercase tracking-[0.15em] px-3 py-1 rounded-full border shadow-sm backdrop-blur-md ${badgeClass}`}>
                    {product.badge}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="text-rose-700 bg-white/95 backdrop-blur-md text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm border border-rose-200 tracking-[0.1em]">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist & Quick View Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setIsQuickViewOpen(true)
                  }}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/90 backdrop-blur-md hover:bg-white border border-[#E8E2DB] rounded-full text-[#8C857C] hover:text-[#C87533] transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.95]"
                  aria-label="Quick View product"
                  title="Quick View"
                >
                  <IconSparkles size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onWishlistToggle(product.id)
                  }}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/90 backdrop-blur-md hover:bg-white border border-[#E8E2DB] rounded-full text-[#8C857C] hover:text-rose-500 transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.95] ${isWishlisted ? 'text-rose-500' : ''}`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <AnimatedHeart size={16} filled={isWishlisted} className={isWishlisted ? 'scale-110' : ''} />
                </button>
              </div>

              {/* Image Area */}
              <Link href={`/shop/${product.slug}`} className="block aspect-[4/5] relative rounded-2xl overflow-hidden bg-[#FAF7F4]">
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-[#F5F1EC]">
                    <div className="absolute inset-0 shimmer-wave" />
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={priority}
                      onLoad={() => setImgLoaded(true)}
                      className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.10]"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  </motion.div>
                </AnimatePresence>
              </Link>

              {/* Content Area */}
              <div className="px-1 pt-3.5 pb-1 flex flex-col flex-grow text-left select-none relative z-20 bg-white">
                <span className="text-[10px] text-[#8C857C] font-extrabold uppercase tracking-[0.18em] mb-1">
                  {typeof product.category === 'object' ? (product.category as any)?.name : product.category}
                </span>
                
                <Link href={`/shop/${product.slug}`} className="block">
                  <h3 className="text-sm font-display font-bold text-[#1A1A1A] hover:text-[#C87533] transition-colors duration-200 line-clamp-2 leading-snug h-[38px] tracking-tight">
                    {product.name}
                  </h3>
                </Link>
                
                {/* Rating & Stock Scarcity Row */}
                <div className="flex items-center justify-between gap-1 mt-1.5 mb-2">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-stone-700">4.9</span>
                    <span className="text-[10px] text-stone-400 font-mono">(234)</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded">
                    Only 12 Left
                  </span>
                </div>

                {/* Price & Swatches Row */}
                <div className="flex items-end justify-between mt-auto pt-2.5 border-t border-[#E8E2DB]">
                  <div className="flex flex-col">
                    {discountPct > 0 && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs line-through text-[#8C857C] tabular-nums font-semibold font-sans">
                          ₹{Number(product?.basePrice ?? product?.sellingPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">
                          Save {discountPct}%
                        </span>
                      </div>
                    )}
                    <span className="text-lg font-sans font-extrabold text-[#1A1A1A] tabular-nums tracking-tight">
                      ₹{Number(product?.sellingPrice ?? product?.basePrice ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        {product.colors.slice(0, 4).map((hex, i) => (
                          <button
                            key={i}
                            onMouseEnter={() => setHoveredColorHex(hex)}
                            onMouseLeave={() => setHoveredColorHex(null)}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHoveredColorHex(hex); }}
                            aria-label={`Select color ${SWATCH_COLORS.find(sc => sc.hex === hex)?.name || ''}`}
                            className={`w-3.5 h-3.5 rounded-full border shadow-inner transition-transform duration-200 hover:scale-125 cursor-pointer outline-none relative ${
                              hoveredColorHex === hex ? 'border-transparent scale-125' : 'border-black/15'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={SWATCH_COLORS.find(sc => sc.hex === hex)?.name || ''}
                          >
                            {hoveredColorHex === hex && (
                              <motion.div layoutId={`ring-${product.id}`} className="absolute -inset-[3px] rounded-full border border-[#C87533] pointer-events-none" />
                            )}
                          </button>
                        ))}
                      </div>
                      {product.colors.length > 4 && (
                        <span className="text-[9px] font-bold text-[#8C857C] uppercase tracking-widest">+{product.colors.length - 4} Colors</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Add Button */}
                <div className="mt-3 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={handleAdd}
                    aria-label={`Quick add ${product.name} to cart`}
                    className="w-full py-2.5 min-h-[40px] bg-[#C87533] hover:bg-[#A65E28] text-white text-[11px] font-extrabold uppercase tracking-[0.15em] rounded-xl transition-all duration-300 shadow-[0_4px_14px_-2px_rgba(200,117,51,0.3)] hover:shadow-[0_8px_20px_-2px_rgba(200,117,51,0.4)] cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C87533]"
                  >
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-1.5 font-bold text-emerald-100">
                          <AnimatedCheck size={13} /> Added to Cart
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                          Quick Add
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product JSON-LD Schema */}
      <JsonLd data={productSchema} />

      {/* Quick View Modal */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 relative overflow-hidden shadow-2xl border border-[#E8E2DB]"
            >
              <button
                onClick={() => setIsQuickViewOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#8C857C] hover:text-[#1A1A1A] rounded-full hover:bg-black/5 transition-colors"
              >
                <IconClose size={20} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF7F4]">
                  <Image src={displayImage} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C87533] block mb-1">
                    {typeof product.category === 'object' ? (product.category as any)?.name : product.category}
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#1A1A1A] mb-2">{product.name}</h3>
                  <div className="text-2xl font-extrabold text-[#1A1A1A] mb-4">
                    ₹{Number(product.sellingPrice).toLocaleString('en-IN')}
                    {discountPct > 0 && (
                      <span className="text-xs text-[#8C857C] line-through ml-2 font-normal">
                        ₹{Number(product.basePrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8C857C] leading-relaxed mb-6">
                    {product.description || product.shortDescription || 'Thoughtfully crafted premium apparel by Alpona. Designed for supreme comfort and effortless style.'}
                  </p>

                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={handleAdd}
                      className="flex-1 py-3 bg-[#C87533] hover:bg-[#A65E28] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <IconCart size={16} /> Quick Add
                    </button>
                    <Link
                      href={`/shop/${product.slug}`}
                      className="px-4 py-3 bg-[#FAF7F4] hover:bg-[#E8E2DB]/50 text-[#1A1A1A] text-xs font-bold tracking-wider uppercase rounded-xl transition-all border border-[#E8E2DB]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
