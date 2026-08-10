'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowRight, Tag } from 'lucide-react'

interface RecommendationItem {
  id: string
  name: string
  slug: string
  price: number
  image_url?: string
  reason: string
}

interface AIRecommendationsProps {
  productId?: string
  categoryId?: string
  title?: string
}

export function AIRecommendations({ productId, categoryId, title = "AI Smart Recommendations" }: AIRecommendationsProps) {
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchRecs = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/ai-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'product_recommendations',
            productId,
            categoryId
          })
        })

        const data = await res.json()
        if (isMounted && data.success && Array.isArray(data.items)) {
          setItems(data.items)
        }
      } catch (err) {
        console.warn('[AI RECOMMENDATIONS]: Fallback active due to fetch error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRecs()
    return () => { isMounted = false }
  }, [productId, categoryId])

  if (!loading && items.length === 0) return null

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 border-b border-[#E8E2DB] dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#B8763C] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            Personalized Curation
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs font-semibold text-[#B8763C] hover:text-[#a66833] flex items-center gap-1 transition-colors group"
        >
          Explore Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid skeleton vs content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/shop/${item.slug}`}
              className="group bg-white dark:bg-[#121214] border border-[#E8E2DB] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B8763C]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-semibold">
                      Alpona Apparel
                    </div>
                  )}

                  {/* AI Reason Badge */}
                  <div className="absolute top-3 left-3 right-3">
                    <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-amber-500/30 truncate shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{item.reason}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#B8763C] transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-0">
                <span className="text-xs font-semibold text-[#B8763C] group-hover:text-[#a66833] flex items-center gap-1">
                  View Product <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
