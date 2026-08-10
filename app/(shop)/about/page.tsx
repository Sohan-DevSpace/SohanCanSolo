'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Sparkles, Leaf, ShieldCheck, CheckCircle2, Paintbrush, Truck, 
  ArrowRight, Feather, RefreshCw, Eye, Heart, Layers, Compass
} from 'lucide-react'

// Premium Spring & Ease Presets
const EASE_CINEMATIC: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Stagger Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_CINEMATIC }
  }
}

// Interactive 3D Tilt Card Helper Component with Specular Light Reflection & a11y
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [lightPos, setLightPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    setRotateX(-((y - centerY) / rect.height) * 10)
    setRotateY(((x - centerX) / rect.width) * 10)
    setLightPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.02 : 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={`relative rounded-[2.5rem] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C] ${className}`}
      tabIndex={0}
      role="article"
    >
      {/* Specular Light Reflection Overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,255,255,0.35), transparent 75%)`
          }}
        />
      )}
      {children}
    </motion.div>
  )
}

// Helper component for individual spotlight words (complying with React Hook rules)
function SpotlightWord({ 
  word, 
  progress, 
  range 
}: { 
  word: string
  progress: any
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  const color = useTransform(progress, range, ["#A09485", "#1A1A1A"])

  return (
    <motion.span style={{ opacity, color }} className="inline-block transition-colors font-serif select-none">
      {word}
    </motion.span>
  )
}

// Scroll Spotlight Word Highlighter Component
function SpotlightParagraph({ text }: { text: string }) {
  const container = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.85", "end 0.35"]
  })

  const words = text.split(" ")

  return (
    <p 
      ref={container} 
      className="flex flex-wrap gap-x-2.5 gap-y-1.5 text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-light leading-[1.3] text-[#1A1A1A]"
      aria-label={text}
    >
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return (
          <SpotlightWord 
            key={i} 
            word={word} 
            progress={scrollYProgress} 
            range={[start, end]} 
          />
        )
      })}
    </p>
  )
}

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  // Scroll Progress calculations for Hero and Parallax
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Hero transforms
  const heroY = useTransform(smoothProgress, [0, 0.25], [0, 160])
  const heroOpacity = useTransform(smoothProgress, [0, 0.18], [1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.25], [1, 1.08])
  const parallaxBgY = useTransform(smoothProgress, [0, 1], [0, -300])

  const stepsData = [
    {
      num: "01",
      title: "Digital Artistry",
      desc: "Select a curated creator drop or upload your custom design into our high-precision online studio.",
      image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop",
      phaseTitle: "Precision Mockup Engine & Design Studio"
    },
    {
      num: "02",
      title: "Smart Order Sync",
      desc: "Your order specification, vector dimensions, and color profiles are instantly routed to automated print hubs.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop",
      phaseTitle: "Instant Multi-Hub API Order Dispatch"
    },
    {
      num: "03",
      title: "High-Density DTG Infusion",
      desc: "Using water-based pigment inks, your artwork is embedded deep into organic combed cotton fibers.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop",
      phaseTitle: "Wash-Resistant Eco-pigment DTG Printing"
    },
    {
      num: "04",
      title: "Quality Pass & Dispatch",
      desc: "Hand-checked by quality artisans, folded in eco-packaging, and shipped straight to your door with tracking.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop",
      phaseTitle: "Artisan Inspection & Express Shipping"
    }
  ]

  const handleStepKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveStep(index)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveStep((index + 1) % stepsData.length)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveStep((index - 1 + stepsData.length) % stepsData.length)
    }
  }

  return (
    <div ref={pageRef} className="bg-[#FAF7F4] text-[#1A1A1A] font-sans selection:bg-[#B8763C] selection:text-white overflow-hidden">
      
      {/* ── AMBIENT CINEMATIC LIGHTING ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <motion.div 
          style={{ y: parallaxBgY }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-radial from-[#B8763C]/12 via-[#E8C9A0]/8 to-transparent blur-[160px]" 
        />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#B8763C]/8 blur-[140px]" />
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1. CINEMATIC HERO SECTION                                           */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 md:pt-44 pb-24 md:pb-36 px-5 lg:px-16 xl:px-24 border-b border-[#E8E2DB]/70" aria-label="Hero">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="max-w-6xl mx-auto text-center space-y-8 relative z-10"
        >
          {/* Micro Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
            className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-[#E8E2DB] rounded-full px-5 py-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#B8763C] animate-pulse" />
            <span className="text-[#B8763C] text-[11px] font-extrabold uppercase tracking-[0.3em]">
              The Alpona Story
            </span>
          </motion.div>

          {/* Staggered Heading */}
          <motion.h1 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-balance text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-light font-serif tracking-tight leading-[1.02] text-[#1A1A1A]"
          >
            <motion.span variants={fadeInUp} className="block">
              Where Imagination Meets
            </motion.span>
            <motion.span variants={fadeInUp} className="italic text-[#B8763C] font-semibold block mt-1">
              Wearable Masterpieces
            </motion.span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE_CINEMATIC }}
            className="text-[#666666] text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-light"
          >
            We are redefining apparel through sustainable on-demand creation, turning digital artistry into high-density, luxury tactile garments.
          </motion.p>

          {/* Quick Action Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
          >
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-[#E8E2DB] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>0% Deadstock Waste</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-[#E8E2DB] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B8763C]" />
              <span>High-Density DTG Tech</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-[#E8E2DB] shadow-2xs">
              <Feather className="w-3.5 h-3.5 text-[#B8763C]" />
              <span>100% Organic Heavy Cotton</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Hero Parallax Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 80, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.3, ease: EASE_CINEMATIC, delay: 0.5 }}
          className="relative max-w-6xl mx-auto mt-16 md:mt-24 aspect-[21/9] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.18)] group border border-[#E8E2DB]"
        >
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&auto=format&fit=crop"
            alt="Alpona Creative Studio Workspace"
            fill
            className="object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
            sizes="(max-width: 1440px) 100vw, 1440px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Floating Live Badge */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 md:p-6 text-white max-w-sm">
            <p className="text-xs uppercase tracking-widest font-extrabold text-[#E8C9A0] mb-1">Crafted On Demand</p>
            <p className="text-sm md:text-base font-medium leading-snug">Every piece is printed freshly upon order to preserve resources and maximize longevity.</p>
          </div>
        </motion.div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2. SCROLL SPOTLIGHT MANIFESTO                                       */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 px-5 lg:px-16 xl:px-24 max-w-[1280px] mx-auto" aria-label="Brand Philosophy">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-[2px] bg-[#B8763C]" />
          <span className="text-[#B8763C] text-xs font-extrabold uppercase tracking-[0.25em]">Our Philosophy</span>
        </div>

        <SpotlightParagraph 
          text="Fast fashion generates over 92 million tons of textile waste every year. At Alpona, we decided to craft a radically conscious model. We do not mass produce. We do not store deadstock in dusty warehouses. Instead, we empower digital artists and creators by printing exclusively what you love, on-demand, with artisan precision."
        />
      </section>


      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 3. PILLARS OF EXCELLENCE (3D INTERACTIVE TILT CARDS)                 */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36 px-5 lg:px-16 xl:px-24 max-w-[1440px] mx-auto border-t border-[#E8E2DB]/70" aria-label="Pillars of Excellence">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[#B8763C] text-xs font-extrabold uppercase tracking-[0.3em] block mb-3">Uncompromising Standard</span>
          <h2 className="text-balance text-4xl md:text-5xl lg:text-6xl font-light font-serif tracking-tight text-[#1A1A1A]">
            Built Upon Four Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Leaf,
              title: "Zero Deadstock",
              badge: "Eco-Driven",
              desc: "On-demand execution ensures zero leftover garments. We produce only when you order.",
              gradient: "from-[#B8763C]/10 to-transparent"
            },
            {
              icon: Sparkles,
              title: "HD DTG Printing",
              badge: "Ultra Precision",
              desc: "Advanced 1200 DPI Direct-to-Garment pigment infusion for wash-resistant vibrant art.",
              gradient: "from-[#E8C9A0]/20 to-transparent"
            },
            {
              icon: Feather,
              title: "Heavyweight Cotton",
              badge: "Luxury Handfeel",
              desc: "240+ GSM combed ring-spun organic cotton tailored for structured, relaxed drape.",
              gradient: "from-[#B8763C]/10 to-transparent"
            },
            {
              icon: ShieldCheck,
              title: "Artisan Quality Control",
              badge: "Strict Inspection",
              desc: "Every single stitch, color print, and seam is hand-checked before eco-friendly dispatch.",
              gradient: "from-[#E8C9A0]/20 to-transparent"
            }
          ].map((pillar, i) => (
            <TiltCard key={i} className="h-full">
              <div className="h-full bg-white/70 backdrop-blur-xl border border-[#E8E2DB] rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xs hover:shadow-2xl transition-shadow duration-500 group overflow-hidden">
                {/* Accent Backdrop Glow */}
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${pillar.gradient} blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E8E2DB] text-[#B8763C] flex items-center justify-center group-hover:bg-[#B8763C] group-hover:text-white transition-colors duration-500 shadow-inner">
                      <pillar.icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 bg-[#FAF7F4] border border-[#E8E2DB] rounded-full text-[#B8763C]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-3 group-hover:text-[#B8763C] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-[#666666] text-sm leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-8 flex items-center gap-2 text-xs font-bold text-[#B8763C] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn Technique</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 4. CINEMATIC OBSIDIAN PROCESS SHOWCASE                               */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 md:py-44 bg-[#0E0E0E] text-white relative overflow-hidden" aria-label="Creation Process">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B8763C]/10 blur-[180px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[1440px] relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 md:mb-28">
            <span className="text-[#B8763C] text-xs font-extrabold uppercase tracking-[0.3em] block mb-4">
              Creation Journey
            </span>
            <h2 className="text-balance text-4xl md:text-6xl font-light font-serif tracking-tight text-white">
              From Screen to Reality
            </h2>
          </div>

          {/* Interactive Steps with a11y tablist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Steps Nav */}
            <div className="lg:col-span-5 space-y-4" role="tablist" aria-label="Creation steps">
              {stepsData.map((step, idx) => (
                <motion.div
                  key={idx}
                  role="tab"
                  aria-selected={activeStep === idx}
                  aria-controls={`step-panel-${idx}`}
                  tabIndex={0}
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => handleStepKeyDown(e, idx)}
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C] ${
                    activeStep === idx 
                      ? 'bg-white/10 border-[#B8763C] shadow-[0_10px_30px_rgba(184,118,60,0.15)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-extrabold tracking-widest ${activeStep === idx ? 'text-[#B8763C]' : 'text-white/40'}`}>
                      STEP {step.num}
                    </span>
                    {activeStep === idx && <Sparkles className="w-4 h-4 text-[#B8763C] animate-pulse" />}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Interactive Showcase Screen */}
            <div className="lg:col-span-7 relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/15 shadow-2xl bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  id={`step-panel-${activeStep}`}
                  role="tabpanel"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={stepsData[activeStep]?.image || ''}
                    alt={stepsData[activeStep]?.phaseTitle || 'Phase'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-xs uppercase tracking-widest text-[#B8763C] font-bold mb-1">Live Craft Phase</p>
                    <p className="text-lg md:text-xl font-serif font-bold">
                      {stepsData[activeStep]?.phaseTitle}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 5. IMPACT & METRICS SECTION                                          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 px-5 lg:px-16 xl:px-24 max-w-[1440px] mx-auto" aria-label="Key Impact Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { num: "0%", label: "Deadstock Textile Waste", detail: "Every item is printed on demand" },
            { num: "100%", label: "Organic Combed Cotton", detail: "Heavyweight 240+ GSM fabric" },
            { num: "48h", label: "Average Production Sync", detail: "Fast print & dispatch timeline" },
            { num: "50K+", label: "Happy Wearers Nationwide", detail: "Delivered across India" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur-xl border border-[#E8E2DB] rounded-[2.5rem] p-8 text-center shadow-2xs hover:shadow-xl transition-all duration-300 group cursor-pointer"
              tabIndex={0}
            >
              <h3 className="text-5xl lg:text-6xl font-serif font-light text-[#B8763C] mb-2 group-hover:scale-105 transition-transform duration-300">
                {stat.num}
              </h3>
              <p className="font-bold text-[#1A1A1A] text-base mb-1">{stat.label}</p>
              <p className="text-xs text-[#666666] font-light">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 6. CINEMATIC CALL TO ACTION                                          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <section className="pb-32 px-5 lg:px-16 xl:px-24 max-w-[1440px] mx-auto" aria-label="Call to Action">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE_CINEMATIC }}
          className="relative rounded-[3rem] bg-[#1A1A1A] text-white p-12 md:p-20 overflow-hidden text-center border border-white/10 shadow-2xl"
        >
          {/* Ambient Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B8763C]/20 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <span className="text-[#B8763C] text-xs font-extrabold uppercase tracking-[0.3em] inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              Start Your Journey
            </span>
            <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl font-light font-serif tracking-tight leading-tight">
              Ready to Wear Your <span className="italic text-[#B8763C] font-semibold">Imagination</span>?
            </h2>
            <p className="text-white/70 text-base md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Explore our curated drops or launch the Design Studio to create your custom masterpiece right now.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/design-studio"
                className="px-8 py-4 bg-[#B8763C] hover:bg-[#a36531] text-white font-bold text-sm rounded-full transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(184,118,60,0.4)] active:scale-95 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Paintbrush size={16} />
                <span>Create Your Own</span>
              </Link>
              <Link
                href="/shop"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-full transition-all active:scale-95 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Browse Catalog</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
