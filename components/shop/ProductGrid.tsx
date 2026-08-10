'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { AnimatedTshirt } from '@/components/shared/AnimatedIcons'
import { ProductCard, type DisplayProduct } from './ProductCard'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

interface ProductGridProps {
  products: DisplayProduct[]
  isLoading: boolean
  itemIds: string[]
  onWishlistToggle: (id: string) => void
  onQuickAdd: (product: DisplayProduct) => void
  onResetFilters: () => void
  viewMode?: 'grid' | 'list'
}

const shimmerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.025 },
  },
}

const shimmerCard = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
}

export function ProductGrid({
  products,
  isLoading,
  itemIds,
  onWishlistToggle,
  onQuickAdd,
  onResetFilters,
  viewMode = 'grid',
}: ProductGridProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="bg-white dark:bg-[#121214] border border-[#E8E2DB] dark:border-white/[0.08] rounded-[1.75rem] p-3 sm:p-4 space-y-3 shadow-xs">
            <div className="relative aspect-[3/4] sm:aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F1EC] dark:bg-white/[0.04]">
              <div className="absolute inset-0 shimmer-wave opacity-75" />
              <div className="absolute top-3 left-3 w-14 h-4 rounded-full bg-white/70 backdrop-blur-md" />
            </div>
            <div className="space-y-2 pt-1 px-1">
              <div className="h-3.5 bg-[#E8E2DB]/70 dark:bg-white/10 rounded-md w-3/4 shimmer-wave" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 bg-[#E8E2DB]/70 dark:bg-white/10 rounded-md w-1/3 shimmer-wave" />
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8E2DB]/70 dark:bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8E2DB]/70 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-16 sm:py-24 text-center select-none"
      >
        {/* Empty state graphic */}
        <div className="relative mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary border border-border flex items-center justify-center">
            <AnimatedTshirt size={32} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-ring/10 border border-ring/20 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ring">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-2">
          No products found
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs">
          Try adjusting your filters or search, or browse our full collection.
        </p>

        {/* Lined decoration */}
        <div className="flex items-center gap-3 my-8 w-32">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <span className="text-xs text-ring font-bold tracking-[0.15em] uppercase">or</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>

        <button
          onClick={onResetFilters}
          className="px-6 py-3 bg-primary hover:bg-ring text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-all duration-300 shadow-matte-sm hover:shadow-matte-md active:scale-[0.97] cursor-pointer"
        >
          Reset Filters
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={products.map(p => p.id).join(',')}
      variants={prefersReducedMotion ? undefined : shimmerContainer}
      initial="hidden"
      animate="show"
      className={viewMode === 'list'
        ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
      }
    >
      {products.map((product, idx) => (
        <motion.div 
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 20 } }
          }}
        >
          <ErrorBoundary sectionName={`Product ${product.name}`}>
            <ProductCard
              product={product}
              isWishlisted={(itemIds as string[]).includes(product.id)}
              onWishlistToggle={onWishlistToggle}
              onQuickAdd={onQuickAdd}
              priority={idx < 4}
              index={idx}
            />
          </ErrorBoundary>
        </motion.div>
      ))}
    </motion.div>
  )
}
