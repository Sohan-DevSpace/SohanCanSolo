'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Database } from '@/lib/types/database'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { IconHeart, IconTshirt, IconSparkles } from '@/components/shared/PremiumIcons'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

export type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories: { name: string } | null
}

interface ProductCardProps {
  product: ProductWithCategory
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const primaryImage = product.images?.[0] || null
  const { itemIds, toggleItem } = useWishlistStore()
  const isWishlisted = itemIds.includes(product.id)
  const hasDiscount = product.base_price > product.selling_price
  const discountPct = hasDiscount
    ? Math.round(((product.base_price - product.selling_price) / product.base_price) * 100)
    : 0

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product.id)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      style: { background: '#1A1A1A', color: '#fff', borderRadius: '12px', fontSize: '13px' },
      iconTheme: { primary: '#B8763C', secondary: '#fff' },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop/${product.slug}`} className="group block h-full">
        <div className="bg-white border border-[#E8E2DB]/60 rounded-2xl overflow-hidden h-full flex flex-col relative transition-all duration-300 hover:border-[#D4CFC8] hover:shadow-matte-md shadow-matte-xs cursor-pointer">
          {/* ── Image ── */}
          <div className="relative aspect-[4/5] bg-[#F5F1EC] overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 opacity-25">
                  <IconTshirt size={64} color="#8A8580" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8580]">Custom Print</span>
                </div>
              </div>
            )}

            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Discount badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-matte-xs">
                  {discountPct}% OFF
                </span>
              </div>
            )}

            {/* Category badge */}
            {product.categories?.name && (
              <div className={`absolute z-10 ${hasDiscount ? 'top-10 left-3 mt-1' : 'top-3 left-3'}`}>
                <span className="bg-white/90 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#E8E2DB] text-[#4A4A4A]">
                  {product.categories.name}
                </span>
              </div>
            )}

            {/* Wishlist button */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.85 }}
              animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center shadow-matte-sm hover:scale-110 active:scale-95 cursor-pointer transition-transform duration-200"
            >
              <IconHeart size={14} color={isWishlisted ? '#F43F5E' : '#B0AAA4'} filled={isWishlisted} />
            </motion.button>

            {/* CTA overlay on hover */}
            <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <div className="bg-[#1A1A1A]/90 text-white text-[11px] font-bold text-center py-2.5 rounded-xl tracking-wide">
                View Designs →
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="p-4 flex flex-col flex-1 gap-3 relative z-10">
            <div>
              <h3 className="text-[13px] font-semibold text-[#1A1A1A] leading-snug line-clamp-2 group-hover:text-[#B8763C] transition-colors duration-200">
                {product.name}
              </h3>
            </div>

            <div className="mt-auto flex items-end justify-between">
              <div>
                {hasDiscount && (
                  <span className="text-[10px] text-[#B0AAA4] line-through block">
                    {CURRENCY_SYMBOL}{product.base_price.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-lg font-sans font-extrabold text-[#1A1A1A] tabular-nums tracking-tight">
                  {CURRENCY_SYMBOL}{product.selling_price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#B8763C]">
                <IconSparkles size={12} color="#B8763C" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Custom</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
