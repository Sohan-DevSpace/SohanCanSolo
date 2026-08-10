'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedCheck } from '@/components/shared/AnimatedIcons'
import { Slider } from '@/components/ui/slider'
import { useFilterParams } from '@/hooks/useFilterParams'

const SWATCH_COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Grey', hex: '#7A7A7A' },
  { name: 'Blue', hex: '#1B2A4A' },
  { name: 'Green', hex: '#1D3A20' },
  { name: 'Red', hex: '#8B1E1E' },
  { name: 'Beige', hex: '#DCD1C4' },
  { name: 'Lavender', hex: '#D4B2D8' },
]

interface FilterSidebarProps {
  categories: any[]
  subcategories: any[]
  productTypes: any[]
}

/* ─── Minimal Collapsible Section ─── */
function Section({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="py-4 first:pt-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between cursor-pointer group outline-none select-none"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3D3A36] group-hover:text-[#B8763C] transition-colors">
          {title}
          {count !== undefined && count > 0 && (
            <span className="ml-2 text-[9px] font-black bg-[#B8763C] text-white w-4 h-4 rounded-full inline-flex items-center justify-center align-middle -mt-px">
              {count}
            </span>
          )}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className="text-[#B5AFA8] group-hover:text-[#B8763C] transition-colors"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Sidebar ─── */
export function FilterSidebar({ categories, subcategories, productTypes }: FilterSidebarProps) {
  const {
    filters,
    setCategory,
    setSubcategory,
    setProductType,
    setGenders,
    setSizes,
    setColors,
    setPriceRange,
    setMinRating,
    setMinDiscount,
    resetFilters,
    activeFilterCount,
  } = useFilterParams()

  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCatExpand = (id: string) =>
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  return (
    <div className="space-y-0 divide-y divide-[#E8E2DB]/80">

      {/* ═══ Header ═══ */}
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
          </div>
          <span className="text-xs font-black tracking-[0.2em] uppercase text-[#1A1A1A]">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[9px] font-black bg-[#B8763C] text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[10px] font-bold uppercase tracking-wider text-[#B8763C] hover:text-[#9E5F2A] transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ═══ 1. Categories ═══ */}
      <Section title="Category" count={filters.category !== 'all' ? 1 : 0} defaultOpen>
        <div className="space-y-1">
          <button
            onClick={() => setCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filters.category === 'all'
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#57524A] hover:bg-[#F5F1EC]'
            }`}
          >
            All Products
          </button>

          {categories.map((cat: any) => {
            const catSubs = subcategories.filter((s: any) => s.category_id === cat.id)
            const isSelected = filters.category === cat.id
            const isExpanded = expandedCategories.includes(cat.id)

            return (
              <div key={cat.id}>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setCategory(cat.id)
                      if (!isExpanded && catSubs.length > 0) toggleCatExpand(cat.id)
                    }}
                    className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#B8763C] text-white'
                        : 'text-[#57524A] hover:bg-[#F5F1EC]'
                    }`}
                  >
                    {cat.name}
                  </button>
                  {catSubs.length > 0 && (
                    <button
                      onClick={() => toggleCatExpand(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-[#F5F1EC] text-[#B5AFA8] hover:text-[#57524A] transition-colors cursor-pointer"
                    >
                      <motion.svg
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      >
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && catSubs.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 mt-1 pl-3 border-l-2 border-[#E8E2DB] space-y-0.5">
                        {catSubs.map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() => setSubcategory(sub.id)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              filters.subcategory === sub.id
                                ? 'text-[#B8763C] font-bold bg-[#B8763C]/8'
                                : 'text-[#8C857C] hover:text-[#57524A] hover:bg-[#F5F1EC]'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ═══ 2. Gender ═══ */}
      <Section title="Gender" count={filters.genders.length} defaultOpen>
        <div className="flex gap-2">
          {['Men', 'Women', 'Unisex'].map(gen => {
            const active = filters.genders.includes(gen)
            return (
              <button
                key={gen}
                onClick={() => {
                  const updated = active
                    ? filters.genders.filter(g => g !== gen)
                    : [...filters.genders, gen]
                  setGenders(updated)
                }}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  active
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#57524A] border-[#E8E2DB] hover:border-[#B8763C]/50'
                }`}
              >
                {gen}
              </button>
            )
          })}
        </div>
      </Section>

      {/* ═══ 3. Sizes ═══ */}
      <Section title="Size" count={filters.sizes.length} defaultOpen>
        <div className="grid grid-cols-3 gap-1.5">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
            const active = filters.sizes.includes(sz)
            return (
              <button
                key={sz}
                onClick={() => {
                  const updated = active
                    ? filters.sizes.filter(s => s !== sz)
                    : [...filters.sizes, sz]
                  setSizes(updated)
                }}
                className={`py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#57524A] border-[#E8E2DB] hover:border-[#B8763C]/50'
                }`}
              >
                {sz}
                {active && <AnimatedCheck size={10} />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* ═══ 4. Color ═══ */}
      <Section title="Color" count={filters.colors.length} defaultOpen>
        <div className="flex flex-wrap gap-2.5">
          {SWATCH_COLORS.map(c => {
            const active = filters.colors.includes(c.hex)
            return (
              <button
                key={c.name}
                onClick={() => {
                  const updated = active
                    ? filters.colors.filter(col => col !== c.hex)
                    : [...filters.colors, c.hex]
                  setColors(updated)
                }}
                title={c.name}
                className="group flex flex-col items-center gap-1 cursor-pointer outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    active ? 'border-[#B8763C] scale-110' : 'border-transparent hover:scale-110'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.hex === '#DCD1C4' || c.hex === '#D4B2D8' ? '#1A1A1A' : '#FFFFFF'} strokeWidth="3.5" className="m-auto mt-[5px]">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-semibold transition-colors ${active ? 'text-[#B8763C]' : 'text-[#B5AFA8] group-hover:text-[#57524A]'}`}>
                  {c.name}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* ═══ 5. Price Range ═══ */}
      <Section title="Price" count={(filters.minPrice > 0 || filters.maxPrice < 5000) ? 1 : 0} defaultOpen>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#B5AFA8] font-bold">₹</span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setPriceRange(Number(e.target.value), filters.maxPrice)}
                className="w-full bg-white border border-[#E8E2DB] rounded-xl pl-6 pr-2 py-2 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] transition-colors"
                placeholder="Min"
              />
            </div>
            <span className="text-[#E8E2DB] text-xs font-bold">—</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#B5AFA8] font-bold">₹</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setPriceRange(filters.minPrice, Number(e.target.value))}
                className="w-full bg-white border border-[#E8E2DB] rounded-xl pl-6 pr-2 py-2 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] transition-colors"
                placeholder="Max"
              />
            </div>
          </div>

          <Slider
            min={0}
            max={5000}
            step={50}
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={(val: any) => setPriceRange(val[0], val[1])}
            className="text-[#B8763C]"
          />

          {/* Quick price buttons */}
          <div className="flex gap-1.5">
            {[
              { label: '< ₹999', min: 0, max: 999 },
              { label: '₹1K–2K', min: 1000, max: 2000 },
              { label: '₹2K+', min: 2000, max: 5000 },
            ].map(p => {
              const active = filters.minPrice === p.min && filters.maxPrice === p.max
              return (
                <button
                  key={p.label}
                  onClick={() => setPriceRange(active ? 0 : p.min, active ? 5000 : p.max)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#B8763C] text-white border-[#B8763C]'
                      : 'bg-white text-[#8C857C] border-[#E8E2DB] hover:border-[#B8763C]/50'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ═══ 6. Discount ═══ */}
      <Section title="Discount" count={filters.minDiscount > 0 ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {[10, 20, 30, 40, 50].map(d => {
            const active = filters.minDiscount === d
            return (
              <button
                key={d}
                onClick={() => setMinDiscount(active ? 0 : d)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#57524A] border-[#E8E2DB] hover:border-[#B8763C]/50'
                }`}
              >
                {d}%+ off
              </button>
            )
          })}
        </div>
      </Section>

      {/* ═══ 7. Rating ═══ */}
      <Section title="Rating" count={filters.minRating > 0 ? 1 : 0}>
        <div className="space-y-1">
          {[4, 3, 2].map(star => {
            const active = filters.minRating === star
            return (
              <button
                key={star}
                onClick={() => setMinRating(active ? 0 : star)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#57524A] hover:bg-[#F5F1EC]'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-3 h-3 ${i < star ? 'text-[#F59E0B]' : (active ? 'text-white/30' : 'text-[#E8E2DB]')}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-[11px]">{star}+ stars</span>
              </button>
            )
          })}
        </div>
      </Section>

    </div>
  )
}
