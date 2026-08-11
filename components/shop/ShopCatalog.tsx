'use client'

import { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedFilter, AnimatedSearch } from '@/components/shared/AnimatedIcons'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { useFilterParams } from '@/hooks/useFilterParams'
import { FilterSidebar } from './FilterSidebar'
import { FilterChips } from './FilterChips'
import { ProductGrid } from './ProductGrid'
import { CategoryHubCards } from './CategoryHubCards'
import { Pagination } from './Pagination'
import { MobileFilterSheet } from './MobileFilterSheet'
import { ProductCard, type DisplayProduct } from './ProductCard'
import { RecentlyViewed } from './RecentlyViewed'
import { ShopSearch } from './ShopSearch'
import toast from 'react-hot-toast'

const sortOptions = [
  { label: 'Featured', value: 'best-selling' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Alphabetical', value: 'name-asc' },
  { label: 'Top Rated', value: 'rating' },
]

interface ShopCatalogProps {
  categories: any[]
  subcategories: any[]
  productTypes: any[]
  products: any[]
}

export function ShopCatalog({ categories, subcategories, productTypes, products }: ShopCatalogProps) {
  const searchParams = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Close sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleEvents = (e: Event) => {
      if (e instanceof MouseEvent) {
        if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
          setIsSortOpen(false)
        }
      } else if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') {
          setIsSortOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleEvents)
    document.addEventListener('keydown', handleEvents)
    return () => {
      document.removeEventListener('mousedown', handleEvents)
      document.removeEventListener('keydown', handleEvents)
    }
  }, [])
  const {
    filters,
    activeFilterCount,
    setCategory,
    setSubcategory,
    setProductType,
    setGenders,
    setSizes,
    setColors,
    setPriceRange,
    setMinRating,
    setMinDiscount,
    setSort,
    setPage,
    resetFilters,
    updateURL,
  } = useFilterParams()

  const { itemIds, toggleItem } = useWishlistStore()
  const { addItem } = useCartStore()

  const hasActiveFilters =
    filters.subcategory !== '' ||
    filters.productType !== '' ||
    filters.genders.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000 ||
    filters.minRating > 0 ||
    filters.minDiscount > 0 ||
    filters.search !== ''

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])



  // ─── Normalize Products ───
  const normalizedProducts = useMemo(() => {
    const list: DisplayProduct[] = []
    products.forEach((p: any) => {
      const comparePrice = Number(p.base_price || p.compare_at_price || p.selling_price || 0)
      const sellPrice = Number(p.selling_price || comparePrice || 0)
      const hasDiscount = comparePrice > sellPrice
      const discountPct = (hasDiscount && comparePrice > 0) ? Math.round(((comparePrice - sellPrice) / comparePrice) * 100) : 0

      // Extract unique colorways
      const colorwaysMap = new Map<string, { color: string; colorHex: string; imageUrl: string }>()
      if (p.product_variants && p.product_variants.length > 0) {
        p.product_variants.forEach((v: any) => {
          if (v.color && v.color_hex && !colorwaysMap.has(v.color_hex)) {
            colorwaysMap.set(v.color_hex, {
              color: v.color,
              colorHex: v.color_hex,
              imageUrl: v.image_url || p.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'
            })
          }
        })
      }
      const colorways = Array.from(colorwaysMap.values())
      const uniqueColors = colorways.map(cw => cw.colorHex)

        const combinedText = [
          p.name, p.display_name, p.category?.name, p.description, p.short_description,
          ...(Array.isArray(p.product_highlights) ? p.product_highlights : [])
        ].filter(Boolean).join(' ').toLowerCase()

        const hasMen = combinedText.includes('men') || combinedText.includes('male') || combinedText.includes('unisex')
        const hasWomen = combinedText.includes('women') || combinedText.includes('female') || combinedText.includes('lady') || combinedText.includes('unisex')
        
        const inferredGenders: string[] = []
        if (hasMen) inferredGenders.push('Men')
        if (hasWomen) inferredGenders.push('Women')
        if (inferredGenders.length === 0 || combinedText.includes('unisex') || (hasMen && hasWomen)) {
          if (!inferredGenders.includes('Men')) inferredGenders.push('Men')
          if (!inferredGenders.includes('Women')) inferredGenders.push('Women')
          if (!inferredGenders.includes('Unisex')) inferredGenders.push('Unisex')
        }

        list.push({
          id: p.id.toString(),
          name: p.display_name || p.name,
          slug: p.slug,
          category: p.category?.name || 'Custom POD',
          parentCategory: p.category_id || '',
          subcategory: p.subcategory_id || '',
          productType: p.product_type_id || '',
          categorySlug: p.category?.slug || '',
          sellingPrice: p.selling_price,
          basePrice: p.base_price,
          discountPct,
          badge: p.is_bestseller 
            ? 'Best Seller' 
            : (p.is_new_arrival || (p.created_at && (new Date().getTime() - new Date(p.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000)) 
              ? 'New' 
              : p.is_trending 
                ? 'Trending' 
                : undefined,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
          colors: uniqueColors.length > 0 ? uniqueColors : ['#FFFFFF', '#1A1A1A'],
          gender: inferredGenders,
        sizes: p.product_variants && p.product_variants.length > 0
          ? Array.from(new Set(p.product_variants.map((v: any) => v.size)))
          : ['S', 'M', 'L', 'XL'],
        isMock: false,
        colorways,
        description: p.description,
        shortDescription: p.short_description || p.description,
        materialInfo: p.material_info,
        estimatedDelivery: p.estimated_delivery,
        isNewArrival: Boolean(p.is_new_arrival),
        isBestseller: Boolean(p.is_bestseller),
        createdAt: p.created_at || '',
      })
    })
    return list
  }, [products])

  // ─── Filter & Sort ───
  const filteredProducts = useMemo(() => {
    let list = normalizedProducts

    const searchQ = searchParams.get('search') || ''
    if (searchQ) {
      const q = searchQ.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
    }

    if (filters.category !== 'all') {
      const targetCategory = categories.find((c: any) =>
        String(c.id) === String(filters.category) ||
        String(c.slug) === String(filters.category) ||
        c.name.toLowerCase() === String(filters.category).toLowerCase()
      )
      const targetId = targetCategory ? String(targetCategory.id) : String(filters.category)
      const targetSlug = targetCategory ? String(targetCategory.slug) : String(filters.category)

      list = list.filter(p =>
        String(p.parentCategory) === targetId ||
        String(p.categorySlug) === targetSlug ||
        p.category.toLowerCase().includes(String(filters.category).toLowerCase())
      )

      if (filters.subcategory) {
        list = list.filter(p => String(p.subcategory) === String(filters.subcategory))
        if (filters.productType) {
          list = list.filter(p => String(p.productType) === String(filters.productType))
        }
      }
    }

    if (filters.genders.length > 0) {
      list = list.filter(p => p.gender.some(g => filters.genders.includes(g)))
    }

    if (filters.sizes.length > 0) {
      list = list.filter(p => p.sizes.some(s => filters.sizes.includes(s)))
    }

    if (filters.colors.length > 0) {
      list = list.filter(p => p.colors.some(c => filters.colors.includes(c)))
    }

    list = list.filter(p => p.sellingPrice >= filters.minPrice && p.sellingPrice <= filters.maxPrice)

    if (filters.minDiscount > 0) {
      list = list.filter(p => p.discountPct >= filters.minDiscount)
    }

    const sorted = [...list]
    switch (filters.sort) {
      case 'newest':
        sorted.sort((a, b) => {
          if (a.isNewArrival !== b.isNewArrival) return b.isNewArrival ? 1 : -1
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })
        break
      case 'best-selling':
      case 'bestsellers':
      case 'bestseller':
        sorted.sort((a, b) => {
          if (a.isBestseller !== b.isBestseller) return b.isBestseller ? 1 : -1
          return b.sellingPrice - a.sellingPrice
        })
        break
      case 'price-asc':
        sorted.sort((a, b) => a.sellingPrice - b.sellingPrice)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.sellingPrice - a.sellingPrice)
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return sorted
  }, [normalizedProducts, filters, searchParams, categories])

  // ─── Pagination ───
  const ITEMS_PER_PAGE = 12
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((filters.page - 1) * ITEMS_PER_PAGE, filters.page * ITEMS_PER_PAGE)
  }, [filteredProducts, filters.page])

  const totalResults = filteredProducts.length
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1

  // ─── Handlers ───
  const handleWishlistToggle = useCallback((id: string) => {
    const isWishlisted = itemIds.includes(id)
    toggleItem(id)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      style: { background: '#111', color: '#fff', borderRadius: '12px', fontSize: '12px' },
      iconTheme: { primary: '#B8763C', secondary: '#fff' },
    })
  }, [itemIds, toggleItem])

  const handleQuickAdd = useCallback((product: DisplayProduct) => {
    addItem({
      id: `${product.id}-quick`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      variantId: 'default',
      size: product.sizes[0] || 'M',
      color: product.colors[0] || '#1A1A1A',
      colorHex: product.colors[0] || '#1A1A1A',
      price: product.sellingPrice,
      quantity: 1,
    })
    toast.success('Added to cart!', {
      style: { background: '#111', color: '#fff', borderRadius: '12px', fontSize: '12px' },
      iconTheme: { primary: '#B8763C', secondary: '#fff' },
    })
  }, [addItem])

  const handlePageChange = useCallback((page: number) => {
    setPage(page)
    scrollToTop()
  }, [setPage, scrollToTop])

  // ─── Subcategory tabs & product type chips ───
  const currentSubcategories = useMemo(() => {
    return subcategories.filter((s: any) => s.category_id === filters.category)
  }, [subcategories, filters.category])

  const currentProductTypes = useMemo(() => {
    if (!filters.subcategory) return []
    return productTypes.filter((t: any) => t.subcategory_id === filters.subcategory)
  }, [productTypes, filters.subcategory])

  return (
    <div className="w-full bg-background font-sans min-h-[calc(100vh-140px)]">
      <div ref={mainContentRef} className="container mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8 pt-4 pb-24 flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-[248px] shrink-0 sticky top-28 self-start h-[calc(100vh-160px)] overflow-y-auto pr-3 select-none no-scrollbar">
          <FilterSidebar
            categories={categories}
            subcategories={subcategories}
            productTypes={productTypes}
          />
        </aside>

        {/* RIGHT PANEL */}
        <div ref={scrollContainerRef} className="flex-1 min-w-0 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground/60 select-none mb-1">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            {filters.category !== 'all' && (
              <>
                <span>/</span>
                <span className="text-primary font-bold">{categories.find((c: any) => c.id === filters.category)?.name}</span>
              </>
            )}
          </div>

          {/* Elegant Page Header */}
          <div className="select-none mb-2">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary tracking-tight text-balance">
              Shop Products
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Explore our curation of high-end custom streetwear garments.
            </p>
          </div>

          {/* Mobile Header (Sticky & Glassmorphic) */}
          <motion.div 
            layout
            className="lg:hidden sticky top-20 z-40 flex items-center justify-between px-4 py-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl shadow-matte-sm select-none mb-4"
          >
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/80 text-foreground text-xs font-bold uppercase tracking-wider outline-none cursor-pointer active:scale-95 transition-all duration-150 hover:bg-secondary min-h-[40px]"
            >
              <AnimatedFilter size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-ring text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="text-xs text-muted-foreground font-semibold tabular-nums flex items-center gap-1.5">
              <motion.span key={totalResults} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-foreground">
                {totalResults}
              </motion.span>
              <span>items</span>
            </div>
          </motion.div>

          {/* Mobile Filter Sheet */}
          <MobileFilterSheet
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            activeFilterCount={activeFilterCount}
            categories={categories}
        subcategories={subcategories}
            productTypes={productTypes}
            onResetFilters={resetFilters}
          />

          {/* Search, Filter Chips, and Active State */}
          <div className="relative mb-6 z-40">
            <ShopSearch />

            <FilterChips
              filters={filters}
              onRemoveCategory={() => updateURL({ category: 'all', subcategory: '', productType: '' })}
              onRemoveSubcategory={() => updateURL({ subcategory: '', productType: '' })}
              onRemoveProductType={() => updateURL({ productType: '' })}
              onRemoveGender={(g) => setGenders(filters.genders.filter(x => x !== g))}
              onRemoveSize={(s) => setSizes(filters.sizes.filter(x => x !== s))}
              onRemoveColor={(c) => setColors(filters.colors.filter(x => x !== c))}
              onRemovePrice={() => setPriceRange(0, 5000)}
              onRemoveRating={() => setMinRating(0)}
              onRemoveDiscount={() => setMinDiscount(0)}
              onRemoveSearch={() => updateURL({ search: '' })}
              onResetAll={resetFilters}
              categories={categories}
              subcategories={subcategories}
              productTypes={productTypes}
            />
          </div>

          {/* Category Hub — only when no filters active and on "all" */}
          {!hasActiveFilters && filters.category === 'all' && (
            <div className="space-y-12">
              <CategoryHubCards
                categories={categories}
                onCategorySelect={(id) => setCategory(id)}
              />
              
              {/* Elegant Promotional Banner */}
              <Link href="/shop" className="group block relative w-full h-[140px] sm:h-[180px] rounded-[2rem] overflow-hidden shadow-matte-md border border-border cursor-pointer">
                <Image src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80" alt="Summer Collection" fill sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/70 mb-2 drop-shadow-sm">Limited Edition</span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-4 drop-shadow-md">Summer Collection</h3>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#C89B65] group-hover:text-white transition-colors duration-300">
                    <span>Explore</span>
                    <motion.svg animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></motion.svg>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Category-specific navigation tabs */}
          {filters.category !== 'all' && (
            <div className="space-y-5 text-left">
              {/* Subcategory Tabs */}
              {currentSubcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4 select-none">
                  <button
                    onClick={() => { setSubcategory('') }}
                    className={`relative px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-[0.97] z-10 min-h-[38px] ${
                      !filters.subcategory
                        ? 'text-white'
                        : 'bg-white border border-border text-neutral-600 hover:bg-secondary hover:text-primary'
                    }`}
                  >
                    {!filters.subcategory && (
                      <motion.div
                        layoutId="activeSubcategoryPill"
                        className="absolute inset-0 bg-primary rounded-full -z-10 shadow-matte-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span>All</span>
                  </button>
                  {currentSubcategories.map((sub: any) => {
                    const isActive = filters.subcategory === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { setSubcategory(sub.id) }}
                        className={`relative px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-[0.97] z-10 min-h-[38px] ${
                          isActive
                            ? 'text-white'
                            : 'bg-white border border-border text-neutral-600 hover:bg-secondary hover:text-primary'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeSubcategoryPill"
                            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-matte-sm"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span>{sub.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Product Type Chips */}
              {currentProductTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center bg-secondary/50 border border-border/30 p-3 rounded-2xl select-none">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mr-1">Cuts</span>
                  <button
                    onClick={() => setProductType('')}
                    className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer active:scale-[0.97] z-10 min-h-[36px] ${
                      !filters.productType
                        ? 'text-ring font-bold'
                        : 'bg-white border border-border/40 text-neutral-600 hover:bg-secondary'
                    }`}
                  >
                    {!filters.productType && (
                      <motion.div
                        layoutId="activeProductTypeChip"
                        className="absolute inset-0 bg-ring/10 border border-ring/30 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span>All</span>
                  </button>
                  {currentProductTypes.map((type: any) => {
                    const isActive = filters.productType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => setProductType(type.id)}
                        className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer active:scale-[0.97] z-10 min-h-[36px] ${
                          isActive
                            ? 'text-ring font-bold'
                            : 'bg-white border border-border/40 text-neutral-600 hover:bg-secondary'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeProductTypeChip"
                            className="absolute inset-0 bg-ring/10 border border-ring/30 rounded-lg -z-10"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span>{type.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sort & Count Bar (Sticky & Glassmorphic on Desktop) */}
          <motion.div
            layout
            className="hidden sm:flex sticky top-20 z-40 items-center justify-between gap-3 pt-3 pb-3 px-4 -mx-4 bg-background/80 backdrop-blur-2xl border-b border-border/40 mb-6 rounded-b-3xl"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                Showing{' '}
                <span className="font-bold text-foreground tabular-nums">{paginatedProducts.length}</span>{' '}
                of <span className="font-bold text-foreground tabular-nums">{totalResults}</span> Products
              </span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto z-20">
              {/* Grid vs List View Toggle */}
              <div className="hidden md:flex items-center bg-white border border-border rounded-xl p-1 shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                    viewMode === 'grid' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                    viewMode === 'list' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="relative w-full sm:w-auto" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  className={`flex items-center justify-between w-full sm:w-52 bg-white border rounded-xl text-xs font-semibold pl-4 pr-3 py-2.5 transition-all duration-200 cursor-pointer active:scale-[0.97] text-neutral-700 tracking-wide min-h-[44px] outline-none ${
                    isSortOpen ? 'border-primary shadow-matte-xs' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
                      <path d="M3 6h18M6 12h12M9 18h6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{sortOptions.find(o => o.value === filters.sort)?.label || 'Sort By'}</span>
                  </div>
                  <motion.svg
                    animate={{ rotate: isSortOpen ? 180 : 0 }}
                    className="w-3.5 h-3.5 text-neutral-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>
 
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full mt-2 w-full left-0 bg-white border border-border rounded-xl shadow-xl overflow-hidden py-1.5 z-30"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSort(option.value)
                            setIsSortOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                            filters.sort === option.value 
                              ? 'bg-background text-primary font-bold' 
                              : 'text-neutral-500 hover:bg-secondary hover:text-primary'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <div className="hidden sm:flex items-center justify-between px-5 py-3 bg-white/60 backdrop-blur-sm border border-[#E8E2DB]/80 rounded-2xl mb-6 select-none">
            {[
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: 'Free Shipping' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label: 'Premium Cotton' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>, label: '7-Day Returns' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Secure Payment' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label: 'Made in India' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-4 bg-[#E8E2DB] mr-2" />}
                <span className="text-[#B8763C]">{badge.icon}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#57524A]">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={paginatedProducts}
            isLoading={false}
            itemIds={itemIds}
            onWishlistToggle={handleWishlistToggle}
            onQuickAdd={handleQuickAdd}
            onResetFilters={resetFilters}
            viewMode={viewMode}
          />

          {/* Pagination */}
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          <RecentlyViewed
            products={products}
            itemIds={itemIds}
            onWishlistToggle={handleWishlistToggle}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      </div>
    </div>
  )
}
