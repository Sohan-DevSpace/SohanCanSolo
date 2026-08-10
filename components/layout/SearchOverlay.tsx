'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, X, ShoppingBag, Sparkles, Palette, PackageCheck, 
  Heart, Info, MessageSquare, HelpCircle, Shirt, Layers, 
  Star, Zap, ArrowRight, CornerDownLeft, Clock, Trash2, Command
} from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants/config'

interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  description?: string
  href: string
  type: 'product' | 'page' | 'category' | 'action'
  iconName?: string
  icon?: string
  imageUrl?: string
  image?: string
  category?: string
  price?: number
  badge?: string
}

interface UniversalSearchResults {
  products: SearchResultItem[]
  pages: SearchResultItem[]
  categories: SearchResultItem[]
  actions: SearchResultItem[]
  totalMatches: number
}

const ICON_MAP: Record<string, any> = {
  ShoppingBag,
  Sparkles,
  Palette,
  PackageCheck,
  Heart,
  Info,
  MessageSquare,
  HelpCircle,
  Shirt,
  Layers,
  Star,
  Zap
}

const POPULAR_SUGGESTIONS = [
  { label: 'Oversized T-Shirts', href: '/shop?category=t-shirts' },
  { label: 'Heavyweight Hoodies', href: '/shop?category=hoodies-sweatshirts' },
  { label: 'Style Match AI', href: '/style-match' },
  { label: 'Custom Design Studio', href: '/create' },
  { label: 'Track My Order', href: '/track' },
  { label: 'Bangla Typography Tees', href: '/shop?search=Bangla' },
]

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'categories' | 'pages' | 'actions'>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<UniversalSearchResults>({
    products: [],
    pages: [],
    categories: [],
    actions: [],
    totalMatches: 0
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('alpona_recent_universal_searches')
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch {}
  }, [])

  // Listen for ESC & focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Debounced API search fetcher
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], pages: [], categories: [], actions: [], totalMatches: 0 })
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const json = await res.json()
        if (json.success) {
          setResults({
            products: json.products || [],
            pages: json.pages || [],
            categories: json.categories || [],
            actions: json.actions || [],
            totalMatches: json.totalMatches || 0
          })
        }
      } catch (err) {
        console.error('Failed to fetch universal search results:', err)
      } finally {
        setLoading(false)
        setSelectedIndex(0)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6)
    setRecentSearches(updated)
    try { localStorage.setItem('alpona_recent_universal_searches', JSON.stringify(updated)) } catch {}
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try { localStorage.removeItem('alpona_recent_universal_searches') } catch {}
  }

  const handleNavigate = (href: string, term?: string) => {
    if (term) saveRecentSearch(term)
    router.push(href)
    onClose()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveRecentSearch(query.trim())
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  // Flattened visible items list for keyboard navigation
  const visibleItems = useCallback(() => {
    const items: SearchResultItem[] = []
    if (activeTab === 'all' || activeTab === 'products') items.push(...results.products)
    if (activeTab === 'all' || activeTab === 'categories') items.push(...results.categories)
    if (activeTab === 'all' || activeTab === 'pages') items.push(...results.pages)
    if (activeTab === 'all' || activeTab === 'actions') items.push(...results.actions)
    return items
  }, [results, activeTab])()

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    const items = visibleItems
    if (items.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      if (items[selectedIndex]) {
        e.preventDefault()
        handleNavigate(items[selectedIndex].href, query)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex flex-col justify-start items-center p-3 sm:p-6 md:p-12 overflow-hidden font-sans select-none"
        >
          {/* Main Search Modal Card */}
          <motion.div
            initial={{ scale: 0.96, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl bg-white border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] relative z-10"
          >
            {/* Top Search Input Bar */}
            <div className="p-4 sm:p-6 border-b border-border/60 bg-white relative flex items-center gap-3">
              <Search className="w-6 h-6 text-ring shrink-0" />
              
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownList}
                  placeholder="Search products, pages, categories, or order status..."
                  className="w-full bg-transparent border-none text-base sm:text-xl lg:text-2xl text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 font-medium tracking-tight"
                />
              </form>

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 text-xs font-bold text-muted-foreground hover:text-primary transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>ESC</span>
              </button>
            </div>

            {/* Filter Tabs Bar (Shown when search query is active) */}
            {query.trim() && (
              <div className="px-4 sm:px-6 py-2.5 bg-secondary/40 border-b border-border/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All (${results.totalMatches})` },
                  { id: 'products', label: `Products (${results.products.length})` },
                  { id: 'categories', label: `Categories (${results.categories.length})` },
                  { id: 'pages', label: `Pages (${results.pages.length})` },
                  { id: 'actions', label: `Actions (${results.actions.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-matte-xs'
                        : 'bg-white/80 border border-border/60 text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Results & Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* State A: Loading Indicator */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-ring border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-muted-foreground">Searching Alpona Studio...</span>
                </div>
              )}

              {/* State B: Empty Query — Popular Suggestions & Recent Searches */}
              {!query.trim() && !loading && (
                <div className="space-y-6 py-2">
                  
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-ring" /> Recent Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[10px] font-bold text-muted-foreground hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setQuery(term)
                              handleNavigate(`/shop?search=${encodeURIComponent(term)}`, term)
                            }}
                            className="px-3 py-1.5 rounded-xl bg-secondary/70 hover:bg-secondary border border-border/60 text-xs font-bold text-primary flex items-center gap-1.5 transition-all cursor-pointer hover:border-ring/40"
                          >
                            <span>{term}</span>
                            <ArrowRight className="w-3 h-3 text-ring" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Quick Suggestions */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-ring" /> Universal Quick Links
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {POPULAR_SUGGESTIONS.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleNavigate(item.href, item.label)}
                          className="p-3 rounded-2xl bg-white border border-border/70 hover:border-ring/50 shadow-matte-xs hover:shadow-matte-sm text-left transition-all duration-300 group flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-xs font-bold text-primary group-hover:text-ring transition-colors">
                            {item.label}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-ring group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* State C: Active Search Results */}
              {query.trim() && !loading && results.totalMatches === 0 && (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm font-bold text-primary">No exact matches found for "{query}"</p>
                  <p className="text-xs text-muted-foreground">Try checking for typos or searching general terms like "T-shirt", "Hoodie", "Track", or "Style Match".</p>
                  
                  <button
                    onClick={handleSearchSubmit}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-matte-xs hover:bg-ring transition-colors cursor-pointer"
                  >
                    Search Full Catalog for "{query}" <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Products Section */}
              {query.trim() && !loading && (activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-ring flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-ring" /> Matching Products ({results.products.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.products.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleNavigate(p.href, query)}
                        className="p-3 rounded-2xl bg-white border border-border/70 hover:border-ring/60 shadow-matte-xs hover:shadow-matte-sm flex items-center gap-3 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-secondary/80 overflow-hidden relative shrink-0 border border-border/40">
                          {p.image ? (
                            <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 m-auto text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-extrabold text-ring uppercase tracking-wider block">
                            {p.category}
                          </span>
                          <h4 className="text-xs font-bold text-primary truncate group-hover:text-ring transition-colors">
                            {p.title}
                          </h4>
                          <span className="text-xs font-mono font-bold text-primary block mt-0.5">
                            {CURRENCY_SYMBOL}{p.price}
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-ring group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories & Collections Section */}
              {query.trim() && !loading && (activeTab === 'all' || activeTab === 'categories') && results.categories.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Categories & Collections ({results.categories.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.categories.map(c => {
                      const IconComp = ICON_MAP[c.icon || 'Sparkles'] || Sparkles
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleNavigate(c.href, query)}
                          className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 shadow-matte-xs flex items-center gap-3 cursor-pointer transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-primary truncate group-hover:text-amber-600 transition-colors">
                              {c.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {c.description}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Site Pages & Sections */}
              {query.trim() && !loading && (activeTab === 'all' || activeTab === 'pages') && results.pages.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600" /> Website Pages & Sections ({results.pages.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.pages.map(pg => {
                      const IconComp = ICON_MAP[pg.icon || 'Info'] || Info
                      return (
                        <div
                          key={pg.id}
                          onClick={() => handleNavigate(pg.href, query)}
                          className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 shadow-matte-xs flex items-center gap-3 cursor-pointer transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-primary truncate group-hover:text-emerald-600 transition-colors">
                              {pg.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {pg.description}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {query.trim() && !loading && (activeTab === 'all' || activeTab === 'actions') && results.actions.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-600" /> Quick Actions ({results.actions.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.actions.map(act => {
                      const IconComp = ICON_MAP[act.icon || 'Zap'] || Zap
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleNavigate(act.href, query)}
                          className="p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/20 hover:border-sky-500/40 shadow-matte-xs flex items-center gap-3 cursor-pointer transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-primary truncate group-hover:text-sky-600 transition-colors">
                              {act.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {act.description}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Keyboard Navigation Footer Bar */}
            <div className="px-4 sm:px-6 py-3 bg-secondary/50 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-border/80 rounded font-mono shadow-matte-xs text-[10px]">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-border/80 rounded font-mono shadow-matte-xs text-[10px]">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-border/80 rounded font-mono shadow-matte-xs text-[10px]">ESC</kbd> Close
                </span>
              </div>

              {query.trim() && (
                <button
                  onClick={handleSearchSubmit}
                  className="text-ring hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>Search Catalog for "{query}"</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
