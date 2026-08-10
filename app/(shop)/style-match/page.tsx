import type { Metadata } from 'next'
import Link from 'next/link'
import { PersonalizedDNAFeed } from '@/components/shop/PersonalizedDNAFeed'
import { SITE_NAME, SITE_URL } from '@/constants/config'
import { ArrowLeft, Sparkles, SlidersHorizontal, ChevronRight, Zap } from 'lucide-react'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Personalized Style Match AI Finder | ${SITE_NAME}`,
  description: 'Experience Alpona\'s AI-powered Style Match finder. Custom apparel recommendations curated live from your category choices, color moods, and aesthetic preferences.',
  alternates: {
    canonical: `${SITE_URL}/style-match`,
  },
}

export default function StyleMatchPage() {
  return (
    <main className="min-h-screen bg-background text-primary pt-6 pb-20 font-sans select-none relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 text-ring group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop Catalog</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-primary font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-ring" /> Style Match AI
            </span>
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-primary via-primary to-ring/90 text-white p-8 sm:p-12 relative overflow-hidden shadow-matte-lg border border-ring/30">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-ring/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-ring backdrop-blur-md text-[10px] font-extrabold uppercase tracking-[0.22em] shadow-matte-xs">
              <Sparkles className="w-3.5 h-3.5 text-ring animate-pulse" />
              Atelier AI Style Finder
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Personalized Style Match
            </h1>

            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              Find clothes crafted for your exact taste. Toggle your favorite apparel categories and color palettes below to get instant AI-curated recommendations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Instant Style Recalculation
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <SlidersHorizontal className="w-3.5 h-3.5 text-ring" /> Multi-Category & Color Filtering
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Render Style Match Feed */}
      <PersonalizedDNAFeed />
    </main>
  )
}
