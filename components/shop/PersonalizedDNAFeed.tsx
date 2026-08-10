'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ShoppingBag, RefreshCw, Zap, Flame, Check, Layers, Palette, RotateCcw, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  image: string
  category: string
  highlights?: string[]
}

const CATEGORY_OPTIONS = [
  { id: 'T-Shirts', label: '👕 T-Shirts' },
  { id: 'Hoodies', label: '🧥 Hoodies & Sweatshirts' },
  { id: 'Bags', label: '🎒 Tote Bags' },
  { id: 'Bengali Typography', label: '🎨 Bangla Typography' },
  { id: 'Minimalist', label: '⚡ Minimalist' },
  { id: 'Dark Aesthetic', label: '🖤 Dark Aesthetics' },
  { id: 'Anime', label: '🐉 Anime & Pop' },
  { id: 'Floral', label: '🌸 Floral Art' },
]

const COLOR_OPTIONS = [
  { id: 'Black', label: 'Obsidian Black', color: 'bg-black' },
  { id: 'White', label: 'Vintage Off-White', color: 'bg-amber-50 border border-border' },
  { id: 'Gold', label: 'Atelier Gold', color: 'bg-amber-600' },
  { id: 'Navy', label: 'Midnight Navy', color: 'bg-slate-900' },
  { id: 'Emerald', label: 'Sage Emerald', color: 'bg-emerald-700' },
  { id: 'Crimson', label: 'Royal Crimson', color: 'bg-rose-800' },
]

export function PersonalizedDNAFeed() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [explanation, setExplanation] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['T-Shirts', 'Hoodies', 'Bengali Typography'])
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'Gold'])

  const { itemIds, toggleItem } = useWishlistStore()

  const fetchDNA = async (categories = selectedCategories, colors = selectedColors) => {
    try {
      setIsRefreshing(true)
      const viewedSlugs = JSON.parse(localStorage.getItem('alpona_recent_views') || '[]')
      const searchTerms = JSON.parse(localStorage.getItem('alpona_recent_searches') || '[]')

      const res = await fetch('/api/ai/design-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewedSlugs,
          searchTerms,
          likedCategories: categories,
          preferredColors: colors
        })
      })

      const json = await res.json()
      if (json.success && json.recommendedProducts?.length > 0) {
        setProducts(json.recommendedProducts)
        setExplanation(json.explanation)
      }
    } catch (e) {
      console.error('Failed to load Style Match feed:', e)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    try {
      const savedCats = localStorage.getItem('alpona_user_categories')
      const savedCols = localStorage.getItem('alpona_user_colors')
      if (savedCats) setSelectedCategories(JSON.parse(savedCats))
      if (savedCols) setSelectedColors(JSON.parse(savedCols))
      fetchDNA(savedCats ? JSON.parse(savedCats) : selectedCategories, savedCols ? JSON.parse(savedCols) : selectedColors)
    } catch {
      fetchDNA()
    }
  }, [])

  const toggleCategory = (catId: string) => {
    const updated = selectedCategories.includes(catId)
      ? selectedCategories.filter(c => c !== catId)
      : [...selectedCategories, catId]
    
    setSelectedCategories(updated)
    try { localStorage.setItem('alpona_user_categories', JSON.stringify(updated)) } catch {}
    fetchDNA(updated, selectedColors)
  }

  const toggleColor = (colorId: string) => {
    const updated = selectedColors.includes(colorId)
      ? selectedColors.filter(c => c !== colorId)
      : [...selectedColors, colorId]

    setSelectedColors(updated)
    try { localStorage.setItem('alpona_user_colors', JSON.stringify(updated)) } catch {}
    fetchDNA(selectedCategories, updated)
  }

  const handleResetFilters = () => {
    const defaultCats = ['T-Shirts', 'Hoodies', 'Bengali Typography']
    const defaultCols = ['Black', 'Gold']
    setSelectedCategories(defaultCats)
    setSelectedColors(defaultCols)
    try {
      localStorage.removeItem('alpona_user_categories')
      localStorage.removeItem('alpona_user_colors')
    } catch {}
    fetchDNA(defaultCats, defaultCols)
  }

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const isWishlisted = itemIds.includes(productId)
    toggleItem(productId)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to your wishlist!', {
      style: { background: '#1A1A1A', color: '#FFF', borderRadius: '12px', fontSize: '12px' },
      iconTheme: { primary: '#B8763C', secondary: '#FFF' },
    })
  }

  return (
    <section className="py-14 sm:py-16 bg-gradient-to-b from-primary/5 via-secondary/30 to-background border-y border-border/80 font-sans select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-ring/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[350px] h-[250px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ring/10 border border-ring/20 text-ring text-[10px] font-extrabold uppercase tracking-[0.22em] shadow-matte-xs">
                <Sparkles className="w-3.5 h-3.5 text-ring animate-pulse" />
                Style Match AI
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                • Real-time Aesthetic Curator
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary">
              Your Personalized Style Match
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl">
              Select your favorite categories and color moods below to get instant AI-matched apparel recommendations.
            </p>
          </div>

          {/* Action & Refresher */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              onClick={() => fetchDNA(selectedCategories, selectedColors)}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-white border border-border/80 hover:bg-secondary hover:border-ring/40 text-xs font-bold text-primary flex items-center gap-2 transition-all cursor-pointer shadow-matte-xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ring ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Recalculating...' : 'Recalculate Matches'}</span>
            </button>

            <Link href="/shop">
              <span className="px-4 py-2.5 rounded-xl bg-primary hover:bg-ring text-white text-xs font-bold transition-all shadow-matte-sm flex items-center gap-1.5 cursor-pointer active:scale-95">
                Browse Full Catalog <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* FEATURE 1: Interactive Category Preference Selector */}
        <div className="bg-white border border-border/80 rounded-2xl p-5 shadow-matte-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-ring" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                What styles & categories do you love?
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground font-mono">
                {selectedCategories.length} Selected
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-ring hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Defaults
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(cat => {
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-white border border-primary shadow-matte-xs'
                      : 'bg-secondary/70 border border-border/70 text-muted-foreground hover:text-primary hover:bg-secondary'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* FEATURE 2: Color Mood Selector & AI Insight Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Color Swatch Picker */}
          <div className="lg:col-span-6 bg-white border border-border/80 rounded-2xl p-4 shadow-matte-xs space-y-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-ring" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Color Palette Preference
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {COLOR_OPTIONS.map(c => {
                const isSelected = selectedColors.includes(c.id)
                return (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleColor(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-ring/10 border-ring text-primary shadow-matte-xs'
                        : 'bg-white border-border/70 text-muted-foreground hover:bg-secondary/40'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.color} shrink-0`} />
                    <span className="text-[11px]">{c.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-ring" />}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* AI Curator Explanation Banner */}
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-matte-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ring/10 border border-ring/20 flex items-center justify-center text-ring shrink-0 shadow-matte-xs">
              <Sparkles className="w-5 h-5 text-ring" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-ring block">
                AI Curator Insight
              </span>
              <p className="text-xs font-bold text-primary leading-snug">
                {explanation || 'Matches generated based on your selected categories and color palette.'}
              </p>
            </div>
          </div>

        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white border border-border/80 rounded-3xl p-4 space-y-4 animate-pulse shadow-matte-xs">
                <div className="aspect-square bg-secondary rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-3 bg-secondary rounded-md w-1/3" />
                  <div className="h-4 bg-secondary rounded-md w-3/4" />
                  <div className="h-4 bg-secondary rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Product Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {products.map((p, idx) => {
                const matchScore = 98 - idx * 2
                const isWishlisted = itemIds.includes(p.id)
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                  >
                    <Link
                      href={`/shop/${p.slug}`}
                      className="group bg-white border border-border/80 hover:border-ring/60 rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-matte-lg relative overflow-hidden block h-full active:scale-[0.99]"
                    >
                      {/* Top Accent Line on Hover */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ring/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div>
                        {/* Image Container */}
                        <div className="aspect-square rounded-2xl bg-secondary/60 border border-border/40 overflow-hidden mb-3.5 relative flex items-center justify-center group-hover:border-border transition-colors">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                          )}

                          {/* Style Match Score Badge */}
                          <div className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-matte-xs flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="font-mono">{matchScore}% Style Match</span>
                          </div>

                          {/* Wishlist Heart Button */}
                          <button
                            onClick={(e) => handleWishlistToggle(e, p.id)}
                            aria-label="Save to Wishlist"
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-primary hover:text-rose-500 backdrop-blur-md border border-border/60 shadow-matte-xs transition-transform active:scale-90"
                          >
                            <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
                          </button>

                          {/* Quick Badge */}
                          <div className="absolute bottom-3 right-3 bg-white/90 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md border border-border/60 shadow-matte-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Flame className="w-3 h-3 text-ring" />
                            <span>AI Choice</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-ring uppercase tracking-wider block">
                            {p.category}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-primary truncate group-hover:text-ring transition-colors">
                            {p.name}
                          </h3>
                        </div>
                      </div>

                      {/* Pricing & Footer */}
                      <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-mono font-bold text-primary tabular-nums">
                            {CURRENCY_SYMBOL}{p.price}
                          </span>
                          {p.compare_at_price && p.compare_at_price > p.price && (
                            <span className="text-xs font-mono text-muted-foreground line-through tabular-nums">
                              {CURRENCY_SYMBOL}{p.compare_at_price}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-ring flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  )
}
