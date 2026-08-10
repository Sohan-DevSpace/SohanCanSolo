'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useCountUp } from '@/hooks/useCountUp'

const ShopHero3D = dynamic(
  () => import('./ShopHero3D').then((m) => m.ShopHero3D),
  { ssr: false }
)

interface ShopHeroEditorialProps {
  title: string
  tagline: string
  description: string
  breadcrumbs: string[]
  totalResults: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
}

export function ShopHeroEditorial({
  title,
  tagline,
  description,
  breadcrumbs,
  totalResults,
}: ShopHeroEditorialProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { ref: countRef, displayValue } = useCountUp(totalResults, { duration: 1400, decimals: 0 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  
  const titleWords = title.split(' ')

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden min-h-[500px] lg:min-h-[70vh] flex items-center"
    >
      {/* Background Parallax Layer */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-[1]" 
        style={{ y: prefersReducedMotion ? 0 : y1 }}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        {/* Ambient glows */}
        <div className="absolute top-[-15%] right-[-10%] w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-ring/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] lg:w-[600px] h-[350px] lg:h-[600px] bg-primary/[0.04] rounded-full blur-[100px]" />
        
        {/* Decorative Glassmorphic Grid */}
        <div className="absolute inset-0 opacity-10 hidden lg:block">
          <div className="absolute left-[25%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="absolute left-[75%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ opacity, scale }}
        className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-24 items-center">
          {/* Editorial Content */}
          <div className="space-y-6 lg:space-y-8">
            <motion.nav variants={itemVariants} className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
              {breadcrumbs.map((bc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-muted-foreground/50">/</span>}
                  <span className={`transition-colors duration-300 ${idx === breadcrumbs.length - 1 ? 'text-ring' : 'text-muted-foreground'}`}>
                    {bc}
                  </span>
                </div>
              ))}
            </motion.nav>

            <motion.div variants={itemVariants} className="space-y-4">
              <span className="block font-sans text-xs font-bold tracking-[0.3em] uppercase text-ring/80">
                {tagline}
              </span>
              
              <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-extrabold text-foreground leading-[1.05] tracking-tight text-balance">
                {titleWords.map((word, i) => (
                  <span key={i} className="inline-block mr-[0.25em] bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/70">
                    {word}
                  </span>
                ))}
              </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="h-px w-16 bg-gradient-to-r from-border to-transparent" />

            <motion.p variants={itemVariants} className="font-sans text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty font-medium">
              {description}
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 backdrop-blur-md rounded-full border border-border/50">
                <div className="w-1.5 h-1.5 rounded-full bg-ring animate-pulse" />
                <span ref={countRef as any} className="font-sans text-xs font-bold tracking-widest uppercase">
                  <span className="text-foreground tabular-nums">{displayValue}</span>
                  <span className="text-muted-foreground ml-1.5">Curated Styles</span>
                </span>
              </div>
            </motion.div>
          </div>

          {/* 3D Canvas / Graphic */}
          <motion.div 
            variants={itemVariants}
            className="hidden lg:flex items-center justify-center relative aspect-square"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ring/[0.08] via-transparent to-transparent rounded-full scale-150 pointer-events-none" />
            <div className="w-full h-full relative z-10">
              <ShopHero3D />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade for smooth transition to grid */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
    </section>
  )
}
