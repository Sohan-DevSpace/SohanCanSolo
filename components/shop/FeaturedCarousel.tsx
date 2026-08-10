'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { IconArrowRight } from '@/components/shared/PremiumIcons'
import type { DisplayProduct } from './ProductCard'

interface FeaturedCarouselProps {
  products: DisplayProduct[]
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth)
    }
  }, [products])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  if (products.length === 0) return null

  // Pick bestsellers or first 8 to show scrolling capabilities
  const displayProducts = products
    .filter(p => p.badge === 'Best Seller' || p.badge === 'New')
    .slice(0, 8)
  
  if (displayProducts.length < 4) {
    displayProducts.push(...products.filter(p => !displayProducts.find(dp => dp.id === p.id)).slice(0, 8 - displayProducts.length))
  }

  return (
    <section ref={containerRef} className="py-24 md:py-32 select-none overflow-hidden relative">
      <motion.div 
        style={{ y: prefersReducedMotion ? 0 : y, opacity }}
        className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="space-y-4">
            <span className="block text-xs font-bold tracking-[0.3em] uppercase text-ring/80">
              Curated Selection
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground tracking-tight leading-none text-balance">
              Featured Picks
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground hover:text-ring transition-colors duration-300 bg-secondary/50 backdrop-blur-md px-6 py-3 rounded-full border border-border/50 self-start md:self-auto hover:bg-secondary active:scale-95"
          >
            Explore All
            <IconArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />
          </Link>
        </div>

        <motion.div ref={carouselRef} className="cursor-grab active:cursor-grabbing overflow-hidden -mx-6 px-6 lg:-mx-12 lg:px-12 pb-12">
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            dragElastic={0.15}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            className="flex gap-6 sm:gap-8 w-max"
          >
            {displayProducts.map((product, i) => (
              <motion.div 
                key={product.id} 
                className="w-[280px] sm:w-[320px] lg:w-[380px] shrink-0 group relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -10 }}
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className="block bg-card/40 backdrop-blur-sm border border-border/80 rounded-[2rem] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-matte-sm hover:shadow-2xl hover:border-ring/30"
                >
                  {/* Image Area */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-secondary/50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    />
                    
                    {/* Glass Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Badge */}
                    {product.badge && (
                      <span className={`absolute top-4 left-4 text-white text-[10px] font-extrabold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full shadow-matte-sm select-none backdrop-blur-md border border-white/10 ${
                        product.badge === 'Best Seller' ? 'bg-foreground/80' : 'bg-ring/80'
                      }`}>
                        {product.badge}
                      </span>
                    )}

                    {/* Hover CTA */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <div className="flex items-center justify-center py-3 bg-background/80 backdrop-blur-xl text-foreground text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-xl shadow-lg border border-border/50">
                        Quick View
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 lg:p-6 bg-card/60 backdrop-blur-md">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2">
                      {product.category}
                    </div>
                    <h3 className="text-base font-display font-bold text-foreground group-hover:text-ring transition-colors duration-300 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-lg font-bold text-foreground tabular-nums">₹{product.sellingPrice}</span>
                      {product.discountPct > 0 && (
                        <>
                          <span className="text-xs line-through text-muted-foreground/60 tabular-nums">₹{product.basePrice}</span>
                          <span className="text-[10px] font-extrabold text-ring ml-auto px-2 py-1 bg-ring/10 rounded-full tracking-wider">{product.discountPct}% OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
