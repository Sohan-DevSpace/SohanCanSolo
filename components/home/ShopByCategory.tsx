'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useReveal } from '@/hooks/useReveal'
import { motion } from 'framer-motion'

interface ShopByCategoryProps {
  categories: any[]
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  't-shirts': 'Oversized & Boxy',
  'bags': 'Canvas Totes',
  'hoodies-sweatshirts': 'Heavyweight Fleece',
  'kids': 'Comfort Fleece',
  'accessories': 'Everyday Carry',
}

const SUBCATEGORY_IMAGES: Record<string, string> = {
  't-shirts': '/images/category_tshirts_v2.png',
  'bags': '/images/category_bags_v2.png',
  'hoodies-sweatshirts': '/images/category_hoodies_v2.png',
  'kids': '/images/category_kids_v2.png',
  'accessories': '/images/category_bags_v2.png',
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  const sectionRef = useReveal()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-12 lg:py-16 bg-[#FAF7F4] overflow-hidden select-none relative"
    >
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        
        {/* Section heading */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 lg:mb-14 text-left gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary tracking-tight leading-[1.1] text-balance">
              Shop by Category
            </h2>
            <p className="font-body text-sm text-[#8A8580] mt-3 uppercase tracking-widest font-semibold">
              Find exactly what you need
            </p>
          </div>
          <Link
            href="/shop"
            className="font-body text-sm font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-6 py-3 rounded-full hover:bg-[#B8763C] flex items-center gap-2 transition-all duration-300 active:scale-95 group shadow-sm"
          >
            View All Categories <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Scrollable card row */}
        <motion.div
          ref={scrollRef}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.05,
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory"
        >
          {categories.map((cat, i) => {
            const finalImage = SUBCATEGORY_IMAGES[cat.slug] || cat.image_url || '/images/category_all_v2.png'
            const hasImage = !!finalImage
            return (
              <motion.div
                key={cat.id || i}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20 } }
                }}
                className="group flex-shrink-0 flex flex-col h-full gap-4 w-[200px] sm:w-[220px] snap-center"
              >
                {/* Large Rounded Card Wrapper */}
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="block relative w-full h-[280px] sm:h-[340px] rounded-[2rem] overflow-hidden bg-white/40 border border-white/60 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  {hasImage ? (
                     <Image 
                      src={finalImage} 
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 200px, 220px"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#FAF7F4] flex items-center justify-center text-primary font-display text-sm font-semibold">
                      {cat.name}
                    </div>
                  )}
                </Link>

                {/* Info Text below image */}
                <div className="px-1 text-left">
                  <span className="font-body text-xs text-[#6B6560] uppercase tracking-wider font-semibold">
                    {SUBCATEGORY_LABELS[cat.slug] || 'Apparel'}
                  </span>
                  <h3 className="font-display text-base font-bold text-primary mt-0.5 leading-tight text-balance">
                    {cat.name}
                  </h3>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="inline-flex items-center gap-1 font-body text-xs font-bold text-[#1A1A1A] hover:text-[#B8763C] mt-2 transition-all duration-200 active:scale-[0.97]"
                  >
                    Explore <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </motion.div>
            )
          })}
          
          {/* Default "All Products" card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20 } }
            }}
            className="group flex-shrink-0 flex flex-col h-full gap-4 w-[200px] sm:w-[220px] snap-center"
          >
            <Link
              href="/shop"
              className="block relative w-full h-[280px] sm:h-[340px] rounded-[2rem] overflow-hidden bg-white/40 border border-white/60 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <Image 
                src="/images/category_all_v2.png" 
                alt="All Products"
                fill
                sizes="(max-width: 768px) 200px, 220px"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            <div className="px-1 text-left">
              <span className="font-body text-xs uppercase tracking-wider font-semibold text-[#6B6560]">
                Full Collection
              </span>
              <h3 className="font-display text-base font-bold text-primary mt-0.5 leading-tight text-balance">
                All Products
              </h3>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 font-body text-xs font-bold text-[#1A1A1A] hover:text-[#B8763C] mt-2 transition-all duration-200 active:scale-[0.97]"
              >
                Explore <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
