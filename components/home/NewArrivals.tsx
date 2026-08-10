'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '@/hooks/useReveal'
import { IconHeart } from '@/components/shared/PremiumIcons'
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

interface NewArrivalsProps {
  products: Product[]
}

const swatchColors = ['#1A1A1A', '#FAF7F4', '#B8763C', '#2E3F41']

export function NewArrivals({ products }: NewArrivalsProps) {
  const sectionRef = useReveal()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  
  const [selectedProductColors, setSelectedProductColors] = useState<Record<string, string>>({})

  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('#1A1A1A')

  const { addItem } = useCartStore()
  const { itemIds, toggleItem } = useWishlistStore()

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const index = Math.round(scrollLeft / clientWidth)
    setActiveSlide(index)
  }

  const scrollToPage = (pageIndex: number) => {
    if (!scrollRef.current) return
    const { clientWidth } = scrollRef.current
    scrollRef.current.scrollTo({
      left: pageIndex * clientWidth,
      behavior: 'smooth',
    })
    setActiveSlide(pageIndex)
  }

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
      className="reveal py-12 lg:py-16 bg-[#FAF7F4] overflow-hidden select-none relative"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/40 blur-[120px] pointer-events-none mix-blend-overlay" />
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        
        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 lg:mb-14 text-left gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary tracking-tight leading-[1.1] flex items-center gap-3 text-balance">
              <span>✨</span> New Arrivals
            </h2>
            <p className="font-body text-sm text-[#8A8580] mt-3 uppercase tracking-widest font-semibold">
              Fresh Drops This Week
            </p>
          </div>
          <Link
            href="/shop?sortBy=newest"
            className="font-body text-sm font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-6 py-3 rounded-full hover:bg-[#B8763C] flex items-center gap-2 transition-all duration-300 active:scale-95 group shadow-sm"
          >
            Shop All New <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white border border-[#E8E2DB] shadow-lg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 active:scale-95 cursor-pointer text-[#8A8580] hover:text-primary hover:bg-[#FAF7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white border border-[#E8E2DB] shadow-lg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 active:scale-95 cursor-pointer text-[#8A8580] hover:text-primary hover:bg-[#FAF7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]"
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-8 stagger snap-x snap-mandatory"
          >
            {products.map((product) => {
              const isWishlisted = itemIds.includes(product.id)

              return (
                <div
                  key={product.id}
                  className="group/card flex-shrink-0 w-[260px] sm:w-[300px] snap-center flex flex-col h-full gap-4 relative"
                >
                  {/* Image wrapper */}
                  <Link
                    href={product.slug ? `/shop/${product.slug}` : `/shop?search=${encodeURIComponent(product.title)}`}
                    className="block relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#F5F1EC] border border-[#E8E2DB]/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ease-out group/image"
                  >
                    <Image
                      src={product.main_image_url}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 260px, 300px"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover/image:scale-105"
                    />
                    <Image
                      src={product.hover_image_url}
                      alt={`${product.title} Alternate`}
                      fill
                      sizes="(max-width: 768px) 260px, 300px"
                      className="object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover/image:opacity-100 group-hover/image:scale-105"
                    />
                    
                    <span className="absolute top-4 left-4 z-10 font-body text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm bg-[#3B82F6]/10 text-[#2563EB] border-[#3B82F6]/20 backdrop-blur-md">
                      Just In
                    </span>

                    <div className="absolute inset-x-4 bottom-4 flex gap-2 z-20 translate-y-[150%] opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-500 ease-out">
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex-1 bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] py-3.5 rounded-[14px] text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-lg active:scale-95"
                      >
                        Quick Add
                      </button>
                      <button
                        onClick={(e) => openPreview(e, product)}
                        className="w-[46px] h-[46px] bg-white hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] rounded-[14px] flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => handleWishlist(e, product.id)}
                    className="absolute top-4 right-4 w-9 h-9 z-20 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                  >
                    <IconHeart size={14} className={isWishlisted ? 'text-red-500' : 'text-[#1A1A1A]'} filled={isWishlisted} />
                  </button>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1 px-1">
                    <h3 className="font-display text-base font-bold text-primary truncate leading-tight text-balance mb-1">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-baseline gap-2.5 mt-auto">
                      <span className="font-body text-base font-bold text-primary tabular-nums">
                        ₹{product.price || 599}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(products.length / 2) }).map((_, i) => (
               <button
                 key={i}
                 onClick={() => scrollToPage(i)}
                 className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer active:scale-95 ${
                   activeSlide === i ? 'w-8 bg-[#1A1A1A]' : 'bg-[#E8E2DB] hover:bg-[#1A1A1A]/50'
                 }`}
                 aria-label={`Go to slide page ${i + 1}`}
               />
             ))}
          </div>
        </div>
      </div>

      {/* QUICK PREVIEW MODAL */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[480px] bg-white rounded-[24px] overflow-hidden shadow-2xl border border-[#E8E2DB]/50 z-10 p-6 flex flex-col gap-6"
            >
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FAF7F4] hover:bg-[#E8E2DB] text-primary flex items-center justify-center transition-all duration-200 active:scale-95 z-20"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F5F1EC]">
                  <Image src={previewProduct.main_image_url} alt={previewProduct.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="font-display text-xl font-bold text-primary leading-tight pr-6 mb-2">
                    {previewProduct.title}
                  </h3>
                  <div className="text-lg font-bold text-primary mb-6">₹{previewProduct.price || 599}</div>
                  
                  <div className="mb-4">
                    <span className="block font-body text-xs uppercase tracking-wider font-bold text-[#1A1A1A] mb-3">Size: {selectedSize}</span>
                    <div className="flex gap-2">
                      {['S', 'M', 'L', 'XL'].map((s) => (
                        <button key={s} onClick={() => setSelectedSize(s)} className={`flex-1 h-10 rounded-xl border text-sm font-bold flex items-center justify-center transition-all active:scale-95 ${selectedSize === s ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E8E2DB] hover:border-[#1A1A1A] text-[#1A1A1A]'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-auto">
                    <span className="block font-body text-xs uppercase tracking-wider font-bold text-[#1A1A1A] mb-3">Color</span>
                    <div className="flex gap-3">
                      {swatchColors.map((c) => (
                        <button key={c} onClick={() => setSelectedColor(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full border shadow-sm transition-all active:scale-95 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-[#1A1A1A]' : 'border-black/10'}`} />
                      ))}
                    </div>
                  </div>

                  <button onClick={handlePreviewAdd} className="w-full bg-[#1A1A1A] hover:bg-black text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200 active:scale-[0.97] mt-8 shadow-xl">
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
