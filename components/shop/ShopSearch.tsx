'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedSearch } from '@/components/shared/AnimatedIcons'
import { useFilterParams } from '@/hooks/useFilterParams'
import { Camera, Sparkles, X, RefreshCw, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CURRENCY_SYMBOL } from '@/constants/config'

interface MatchedProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

export function ShopSearch() {
  const { filters, updateURL } = useFilterParams()
  const [query, setQuery] = useState(filters.search || '')
  const [isFocused, setIsFocused] = useState(false)
  const [isVisualSearching, setIsVisualSearching] = useState(false)
  const [visualResults, setVisualResults] = useState<MatchedProduct[] | null>(null)
  const [detectedAttributes, setDetectedAttributes] = useState<any>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const popularSearches = ['Oversized T-Shirts', 'Summer Collection', 'Vintage Wash', 'Graphic Tees']

  useEffect(() => {
    setQuery(filters.search || '')
  }, [filters.search])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateURL({ search: value, page: 1 })
    }, 350)
  }, [updateURL])

  const handleQuickSearch = useCallback((term: string) => {
    setQuery(term)
    updateURL({ search: term, page: 1 })
    setIsFocused(false)
    inputRef.current?.blur()
  }, [updateURL])

  const handleClear = useCallback(() => {
    setQuery('')
    setVisualResults(null)
    setDetectedAttributes(null)
    updateURL({ search: '', page: 1 })
    inputRef.current?.focus()
  }, [updateURL])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsVisualSearching(true)
    setVisualResults(null)

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch('/api/ai/visual-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        })
        const json = await res.json()
        setIsVisualSearching(false)

        if (json.success && json.matchingProducts) {
          setVisualResults(json.matchingProducts)
          setDetectedAttributes(json.detectedAttributes)
        }
      } catch (err) {
        setIsVisualSearching(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="group relative w-full mb-4 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <AnimatedSearch size={16} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 250)}
          placeholder="Search products, categories, or upload a photo..."
          className="w-full pl-11 pr-24 py-3.5 bg-white border border-[#E8E2DB] rounded-2xl text-sm font-semibold text-[#1A1A1A] placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#B8763C] focus:ring-2 focus:ring-[#B8763C]/15 transition-all duration-300 shadow-sm"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {query.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full bg-[#E8E2DB]/60 hover:bg-[#E8E2DB] text-[#8C857C] hover:text-[#1A1A1A] transition-all cursor-pointer"
            >
              <X size={13} />
            </button>
          )}

          {/* AI Visual Photo Search Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Search by Photo (AI Visual Search)"
            className="flex items-center gap-1 bg-[#1A1A1A] hover:bg-[#B8763C] text-white px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            {isVisualSearching ? (
              <RefreshCw size={12} className="animate-spin text-amber-400" />
            ) : (
              <Camera size={12} className="group-hover:rotate-12 transition-transform text-amber-400" />
            )}
            <span className="hidden sm:inline">AI Photo Search</span>
          </button>
        </div>
      </div>

      {/* Visual Search Modal Results */}
      {visualResults && (
        <div className="mt-3 bg-white border border-[#E8E2DB] rounded-3xl p-4 shadow-xl space-y-3 z-30 relative">
          <div className="flex items-center justify-between border-b border-[#E8E2DB] pb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#B8763C] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                AI Visual Match Results
              </span>
              {detectedAttributes?.category && (
                <span className="text-[10px] font-bold bg-[#B8763C]/10 text-[#B8763C] px-2 py-0.5 rounded-full border border-[#B8763C]/20">
                  Detected: {detectedAttributes.category} ({detectedAttributes.primaryColor})
                </span>
              )}
            </div>
            <button onClick={() => setVisualResults(null)} className="text-neutral-400 hover:text-neutral-700">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {visualResults.map(p => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                onClick={() => setVisualResults(null)}
                className="bg-[#FAF7F4] border border-[#E8E2DB] hover:border-[#B8763C] rounded-2xl p-2 flex flex-col justify-between transition-all hover:shadow-md group"
              >
                <div className="aspect-square rounded-xl bg-white overflow-hidden mb-1.5 relative flex items-center justify-center">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill sizes="120px" className="object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <ShoppingBag size={18} className="text-neutral-400" />
                  )}
                </div>
                <h4 className="text-[11px] font-bold text-[#1A1A1A] truncate group-hover:text-[#B8763C] transition-colors">{p.name}</h4>
                <span className="text-xs font-black text-[#1A1A1A] mt-0.5">{CURRENCY_SYMBOL}{p.price}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown Panel */}
      <AnimatePresence>
        {isFocused && !visualResults && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-[#E8E2DB] rounded-2xl shadow-xl z-20"
          >
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5AFA8] mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onMouseDown={() => handleQuickSearch(term)}
                      className="px-3 py-1.5 text-xs font-bold text-[#57524A] hover:text-[#1A1A1A] bg-[#FAF7F4] hover:bg-[#E8E2DB]/60 rounded-xl transition-all cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
