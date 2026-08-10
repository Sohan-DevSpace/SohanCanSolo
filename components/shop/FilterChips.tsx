'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { AnimatedFilter, AnimatedClose } from '@/components/shared/AnimatedIcons'

interface FilterState {
  category: string
  subcategory: string
  productType: string
  genders: string[]
  sizes: string[]
  colors: string[]
  minPrice: number
  maxPrice: number
  minRating: number
  minDiscount: number
  search: string
}

interface FilterChipsProps {
  filters: FilterState
  onRemoveCategory: () => void
  onRemoveSubcategory: () => void
  onRemoveProductType: () => void
  onRemoveGender: (gender: string) => void
  onRemoveSize: (size: string) => void
  onRemoveColor: (color: string) => void
  onRemovePrice: () => void
  onRemoveRating: () => void
  onRemoveDiscount: () => void
  onRemoveSearch: () => void
  onResetAll: () => void
  categories: any[]
  subcategories: any[]
  productTypes: any[]
}

export function FilterChips({
  filters,
  onRemoveCategory,
  onRemoveSubcategory,
  onRemoveProductType,
  onRemoveGender,
  onRemoveSize,
  onRemoveColor,
  onRemovePrice,
  onRemoveRating,
  onRemoveDiscount,
  onRemoveSearch,
  onResetAll,
  categories,
  subcategories,
  productTypes,
}: FilterChipsProps) {
  const prefersReducedMotion = useReducedMotion()

  const chips: { label: string; onRemove: () => void; colorHex?: string }[] = []

  if (filters.search) {
    chips.push({ label: `Search: "${filters.search}"`, onRemove: onRemoveSearch })
  }

  if (filters.category !== 'all') {
    const cat = categories.find((c: any) => c.id === filters.category)
    chips.push({ label: cat?.name || filters.category, onRemove: onRemoveCategory })
  }

  if (filters.subcategory) {
    const sub = subcategories.find((s: any) => s.id === filters.subcategory)
    chips.push({ label: sub?.name || filters.subcategory, onRemove: onRemoveSubcategory })
  }

  if (filters.productType) {
    const pt = productTypes.find((p: any) => p.id === filters.productType)
    chips.push({ label: pt?.name || filters.productType, onRemove: onRemoveProductType })
  }

  filters.genders.forEach((g) => {
    chips.push({ label: g, onRemove: () => onRemoveGender(g) })
  })

  filters.sizes.forEach((s) => {
    chips.push({ label: `Size: ${s}`, onRemove: () => onRemoveSize(s) })
  })

  filters.colors.forEach((c) => {
    const SWATCH_MAP: Record<string, string> = {
      '#1A1A1A': 'Black', '#7A7A7A': 'Grey', '#1B2A4A': 'Blue',
      '#1D3A20': 'Green', '#8B1E1E': 'Red', '#DCD1C4': 'Beige', '#D4B2D8': 'Lavender',
    }
    chips.push({ label: SWATCH_MAP[c] || c, onRemove: () => onRemoveColor(c), colorHex: c })
  })

  if (filters.minPrice > 0 || filters.maxPrice < 5000) {
    chips.push({ label: `₹${filters.minPrice} - ₹${filters.maxPrice}`, onRemove: onRemovePrice })
  }

  if (filters.minRating > 0) {
    chips.push({ label: `${filters.minRating}★ & up`, onRemove: onRemoveRating })
  }

  if (filters.minDiscount > 0) {
    chips.push({ label: `${filters.minDiscount}% off`, onRemove: onRemoveDiscount })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 select-none py-1">
      <div className="flex items-center gap-1.5 text-[#B8763C] text-[11px] font-extrabold uppercase tracking-widest mr-1">
        <AnimatedFilter size={15} className="shrink-0 text-[#B8763C]" />
        <span>Active:</span>
      </div>

      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.button
            key={chip.label}
            layout
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.15 } }}
            onClick={chip.onRemove}
            aria-label={`Remove filter ${chip.label}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.12em]
              bg-[#1A1A1A] text-white border border-[#B8763C]/30 shadow-xs cursor-pointer
              hover:bg-[#B8763C] hover:border-[#B8763C] transition-all duration-300 active:scale-95 group"
          >
            {chip.colorHex && (
              <span className="w-3 h-3 rounded-full border border-white/30 shrink-0 shadow-inner" style={{ backgroundColor: chip.colorHex }} />
            )}
            <span className="truncate max-w-[140px]">{chip.label}</span>
            <span className="opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              <AnimatedClose size={12} />
            </span>
          </motion.button>
        ))}

        {chips.length > 1 && (
          <motion.button
            layout
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.15 } }}
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.12em]
              bg-[#B8763C]/10 text-[#B8763C] border border-[#B8763C]/30 cursor-pointer
              hover:bg-[#B8763C] hover:text-white transition-all duration-300 active:scale-95 shadow-xs"
          >
            Clear All
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
