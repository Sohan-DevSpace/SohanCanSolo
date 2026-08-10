'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useReducedMotion, motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatedChevronRight, AnimatedChevronLeft } from '@/components/shared/AnimatedIcons'

gsap.registerPlugin(ScrollTrigger)

const PREMIUM_CATEGORY_IMAGES: Record<string, string[]> = {
  'T-Shirts': [
    '/images/categories/new_cat_tshirts_1_1783448944604.png',
    '/images/categories/new_cat_tshirts_2_1783448957583.png',
    '/images/categories/new_cat_tshirts_3_1783448970109.png'
  ],
  'Bags & Carry': [
    '/images/categories/new_cat_bags_1_1783448981124.png',
    '/images/categories/new_cat_bags_2_1783449007262.png',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80'
  ],
  'Kids Collection': [
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80',
    '/images/categories/cat_kids_2_1783448267551.png',
    'https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=600&q=80'
  ],
  'Hoodies & Sweatshirts': [
    '/images/categories/cat_hoodies_2_1783448293337.png',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
    '/images/categories/cat_hoodies_3_1783448303695.png'
  ]
}

function CategorySlideshow({ images, alt, isHovered }: { images: string[], alt: string, isHovered: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1 || !isHovered) {
      setIndex(0)
      return
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 3000) // Slide faster (3s) when hovered
    return () => clearInterval(timer)
  }, [images.length, isHovered])

  return (
    <AnimatePresence mode="popLayout">
      <motion.img
        key={index}
        src={images[index]}
        alt={alt}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        loading="lazy"
      />
    </AnimatePresence>
  )
}

interface CategoryHubCardsProps {
  categories: any[]
  onCategorySelect: (id: string) => void
}

export function CategoryHubCards({ categories, onCategorySelect }: CategoryHubCardsProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
      const cards = trackRef.current?.querySelectorAll('.cat-card')
      if (cards?.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          scale: 0.95,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <div ref={sectionRef} className="space-y-6 sm:space-y-8 text-left select-none overflow-hidden stagger">
      <div ref={headingRef} className="flex items-end justify-between">
        <div>
          <span className="block text-xs font-bold tracking-[0.3em] uppercase text-ring/80 mb-2">
            Collections
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight leading-tight text-balance">
            Browse by Category
          </h2>
        </div>
      </div>
 
      {/* 4-column Bento Grid on Desktop, 2-column Grid on Mobile */}
      <div
        ref={trackRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
      >
        {categories.slice(0, 4).map((cat: any, idx: number) => {
          const isHovered = hoveredCardId === cat.id
          return (
            <div
              key={cat.id}
              className="cat-card w-full"
              onMouseEnter={() => setHoveredCardId(cat.id)}
              onMouseLeave={() => setHoveredCardId(null)}
            >
              <button
                onClick={() => {
                  if (cat.status !== 'coming_soon') onCategorySelect(cat.id)
                }}
                disabled={cat.status === 'coming_soon'}
                className="group w-full text-left bg-card/60 backdrop-blur-xl border border-border/80 rounded-2xl sm:rounded-[2rem] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-matte-sm hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-matte-sm flex flex-col h-full"
              >
                {/* Image Area */}
                <div className="relative h-40 sm:h-[190px] overflow-hidden bg-secondary">
                  <CategorySlideshow 
                    images={PREMIUM_CATEGORY_IMAGES[cat.name] || [cat.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400']} 
                    alt={cat.name} 
                    isHovered={isHovered}
                  />
                  
                  {/* Premium overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none z-10" />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-ring/40 to-transparent pointer-events-none z-10 mix-blend-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Hover arrow indicator inside image */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-lg z-20">
                    <AnimatedChevronRight size={14} />
                  </div>
                </div>
 
                {/* Content Area */}
                <div className="p-4 sm:p-5 lg:p-6 flex-grow flex flex-col justify-between bg-card/40 backdrop-blur-md">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm sm:text-base font-display font-extrabold text-foreground group-hover:text-ring transition-colors duration-300 leading-snug tracking-wide">
                        {cat.name}
                      </h3>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 text-[9px] font-bold text-[#B8763C] uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mt-1">
                      <span>{cat.name === 'T-Shirts' ? '120+ Products' : cat.name === 'Bags & Carry' ? '35+ Products' : cat.name === 'Kids Collection' ? '40+ Products' : '50+ Products'}</span>
                      <span>•</span>
                      <span className="font-bold text-stone-900">{cat.name === 'T-Shirts' ? 'From ₹699' : cat.name === 'Bags & Carry' ? 'From ₹499' : cat.name === 'Kids Collection' ? 'From ₹599' : 'From ₹1,299'}</span>
                    </div>
                  </div>

                  {cat.status === 'coming_soon' ? (
                    <div className="mt-4 flex items-center justify-between w-full">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-secondary/80 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] shadow-sm opacity-80">
                        <span>Coming Soon</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between w-full">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-background/50 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] transition-all duration-300 group-hover:border-ring group-hover:text-ring group-hover:bg-ring/5 shadow-sm">
                        <span>Shop {cat.name}</span>
                        <motion.span
                          className="flex items-center justify-center"
                          animate={{ x: isHovered ? 4 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </motion.span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

