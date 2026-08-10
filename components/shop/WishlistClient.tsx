'use client'

import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ProductCard, ProductWithCategory } from '@/components/ui/ProductCard'
import { AnimatedHeart, AnimatedArrowRight } from '@/components/shared/AnimatedIcons'
import { Search, ShoppingBag, Trash2, Share2, Sparkles, X, ArrowRight } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'

interface WishlistClientProps {
  products: ProductWithCategory[]
}

export function WishlistClient({ products }: WishlistClientProps) {
  const { itemIds, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  const wishlistedProducts = useMemo(() => {
    return products.filter((p) => itemIds.includes(p.id))
  }, [products, itemIds])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return wishlistedProducts
    const q = searchQuery.toLowerCase().trim()
    return wishlistedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categories?.name?.toLowerCase().includes(q)
    )
  }, [wishlistedProducts, searchQuery])

  const handleMoveAllToCart = () => {
    if (wishlistedProducts.length === 0) return
    let addedCount = 0
    wishlistedProducts.forEach((p) => {
      addItem({
        id: `${p.id}-M-Black`,
        productId: p.id,
        productName: p.name,
        productImage: p.images?.[0] || '',
        variantId: 'default',
        size: 'M',
        color: 'Black',
        colorHex: '#1A1A1A',
        price: p.selling_price,
        quantity: 1
      })
      addedCount++
    })
    toast.success(`✨ Moved ${addedCount} saved item(s) to your shopping cart!`)
  }

  const handleShareWishlist = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      toast.success('📋 Wishlist link copied to clipboard!')
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all saved items from your wishlist?')) {
      clearWishlist()
      toast('Wishlist cleared.')
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 animate-pulse mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white border border-[#E8E2DB] rounded-[2rem] shadow-sm" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      {wishlistedProducts.length > 0 ? (
        <div className="space-y-8">
          {/* Header Toolbar & Actions Bar */}
          <div className="bg-white border border-[#E8E2DB] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Left: Saved Items Count & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF7F4] border border-[#E8E2DB]">
                <AnimatedHeart size={16} className="text-[#C53030]" filled />
                <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">
                  {wishlistedProducts.length} Saved {wishlistedProducts.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter saved items..."
                  className="w-full pl-10 pr-8 py-2 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl text-xs font-semibold text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Quick CTAs */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleMoveAllToCart}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#B8763C] hover:bg-[#9E5F2A] text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>Move All to Cart</span>
              </button>

              <button
                onClick={handleShareWishlist}
                title="Share Wishlist"
                className="p-2.5 rounded-2xl bg-[#FAF7F4] hover:bg-[#E8E2DB]/60 border border-[#E8E2DB] text-[#1A1A1A] transition-all cursor-pointer active:scale-95"
              >
                <Share2 size={15} />
              </button>

              <button
                onClick={handleClearAll}
                title="Clear All Saved"
                className="p-2.5 rounded-2xl bg-[#FAF7F4] hover:bg-rose-50 border border-[#E8E2DB] hover:border-rose-200 text-neutral-500 hover:text-rose-600 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
              >
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      delay: prefersReducedMotion ? 0 : idx * 0.04
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-white border border-[#E8E2DB] rounded-3xl p-12 text-center space-y-3">
                <p className="text-sm font-bold text-neutral-600">No saved items match "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} className="text-xs font-black uppercase text-[#B8763C] underline">
                  Clear Search Filter
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty Wishlist Premium Card */
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="text-center py-20 sm:py-28 border border-[#E8E2DB] rounded-[2.5rem] bg-white shadow-sm flex flex-col items-center max-w-3xl mx-auto relative overflow-hidden px-6"
        >
          {/* Subtle background gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#B8763C]/5 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="relative w-24 h-24 bg-[#FAF7F4] border border-[#E8E2DB] shadow-sm rounded-3xl flex items-center justify-center mb-6 z-10"
          >
            <AnimatedHeart size={38} className="text-[#C53030]" filled />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute inset-0 border-2 border-[#C53030]/20 rounded-3xl scale-110 pointer-events-none"
            />
          </motion.div>
          
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C] mb-1 z-10">Your Studio Favorites</span>
          <h2 className="text-3xl font-serif font-extrabold text-[#1A1A1A] text-balance tracking-tight mb-3 z-10">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm mb-8 font-medium leading-relaxed z-10">
            Discover our luxury streetwear collections and save your favorite garments to assemble your dream wardrobe.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 z-10">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 bg-[#1A1A1A] hover:bg-[#B8763C] text-white px-7 py-3.5 rounded-2xl font-black tracking-wider uppercase text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Explore Store</span>
              <AnimatedArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

