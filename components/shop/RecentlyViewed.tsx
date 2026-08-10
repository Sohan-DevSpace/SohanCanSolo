'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProductCard, type DisplayProduct } from './ProductCard'

interface RecentlyViewedProps {
  products: DisplayProduct[]
  itemIds: string[]
  onWishlistToggle: (id: string) => void
  onQuickAdd: (product: DisplayProduct) => void
}

export function RecentlyViewed({ products, itemIds, onWishlistToggle, onQuickAdd }: RecentlyViewedProps) {
  const [activeTab, setActiveTab] = useState('Recently Viewed')
  const tabs = ['Recently Viewed', 'Recommended', 'Popular Today']

  return (
    <div className="mt-24 pt-16 border-t border-border/60">
      <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto no-scrollbar pb-1" role="tablist">
        {tabs.map((tab, i) => (
          <button 
            key={tab} 
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm sm:text-base font-display font-bold pb-3 border-b-2 whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 rounded-sm ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="tabpanel">
        {products.slice(0, 4).map((product, i) => (
          <motion.div key={`recent-${product.id}`} whileTap={{ scale: 0.98 }}>
            <ProductCard
              product={product}
              isWishlisted={(itemIds as string[]).includes(product.id)}
              onWishlistToggle={onWishlistToggle}
              onQuickAdd={onQuickAdd}
              priority={false}
              index={i}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
