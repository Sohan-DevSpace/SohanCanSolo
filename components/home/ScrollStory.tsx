'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IconSparkles, IconToteBag, IconLeaf, IconArrowRight } from '@/components/shared/PremiumIcons'
import Link from 'next/link'

// Register ScrollTrigger plugin safely for SSR
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const TOTAL_FRAMES = 240
const FRAME_PREFIX = '/scroll_story/ezgif-frame-'
const FRAME_SUFFIX = '.jpg'

const getFramePath = (index: number) => {
  const paddedIndex = index.toString().padStart(3, '0')
  return `${FRAME_PREFIX}${paddedIndex}${FRAME_SUFFIX}`
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  
  const textRef1 = useRef<HTMLDivElement>(null)
  const textRef2 = useRef<HTMLDivElement>(null)
  const textRef3 = useRef<HTMLDivElement>(null)

  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  // Preload all frames with fallback timer to prevent blank freeze
  useEffect(() => {
    let isActive = true
    let loadedCount = 0
    const loadedImages: HTMLImageElement[] = []

    // Fallback timer: ensure section is marked loaded even if network stalls on mobile refresh
    const fallbackTimer = setTimeout(() => {
      if (isActive && !isLoaded) {
        setIsLoaded(true)
        setImages(loadedImages)
      }
    }, 2500)

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFramePath(i)

      img.onload = () => {
        if (!isActive) return
        loadedCount++
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100))

        if (loadedCount === TOTAL_FRAMES) {
          clearTimeout(fallbackTimer)
          setIsLoaded(true)
          setImages(loadedImages)
        }
      }

      img.onerror = () => {
        if (!isActive) return
        loadedCount++
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100))

        if (loadedCount === TOTAL_FRAMES) {
          clearTimeout(fallbackTimer)
          setIsLoaded(true)
          setImages(loadedImages)
        }
      }

      loadedImages.push(img)
    }

    return () => {
      isActive = false
      clearTimeout(fallbackTimer)
    }
  }, [isLoaded])

  // GSAP ScrollTrigger Setup
  useEffect(() => {
    if (!isLoaded || images.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frameObj = { frame: 0 }

    // Helper function to draw frame with object-contain fit
    const drawFrame = (img: HTMLImageElement) => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const imgRatio = img.width / img.height
      const canvasRatio = canvas.width / canvas.height
      
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let offsetX = 0
      let offsetY = 0
      
      if (imgRatio > canvasRatio) {
        drawHeight = canvas.width / imgRatio
        offsetY = (canvas.height - drawHeight) / 2
      } else {
        drawWidth = canvas.height * imgRatio
        offsetX = (canvas.width - drawWidth) / 2
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    }

    // Handle high-DPI scaling & resizing dynamically for crispness
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // Re-draw current frame immediately
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameObj.frame)))
      const img = images[idx]
      if (img && img.complete) {
        drawFrame(img)
      }
    }

    // Set initial size
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Set up GSAP context for clean scoping and React cleanup
    const ctxGsap = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: true,
          pinSpacing: true,
          scrub: 0.5, // Smooth scrub interpolation
        }
      })

      // 1. Scrub Canvas Frames
      tl.to(frameObj, {
        frame: TOTAL_FRAMES - 1,
        ease: 'none',
        duration: 1.0,
        onUpdate: () => {
          const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameObj.frame)))
          const img = images[idx]
          if (img && img.complete) {
            drawFrame(img)
          }
        }
      }, 0)

      // 2. Animate Background wrapper transition
      tl.fromTo(bgRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.1, ease: 'none' },
        0
      )
      tl.to(bgRef.current,
        { opacity: 0, duration: 0.1, ease: 'none' },
        0.9
      )

      // 3. Animate Text Overlays
      // Slide 1: Heritage
      tl.fromTo(textRef1.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
        0.08
      )
      tl.to(textRef1.current,
        { opacity: 0, y: -40, duration: 0.12, ease: 'power2.in' },
        0.25
      )

      // Slide 2: Quality
      tl.fromTo(textRef2.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
        0.40
      )
      tl.to(textRef2.current,
        { opacity: 0, y: -40, duration: 0.12, ease: 'power2.in' },
        0.57
      )

      // Slide 3: Eco
      tl.fromTo(textRef3.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
        0.72
      )
      tl.to(textRef3.current,
        { opacity: 0, y: -40, duration: 0.12, ease: 'power2.in' },
        0.88
      )

    }, containerRef)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      ctxGsap.revert()
    }
  }, [isLoaded, images])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[350vh] bg-[#FAF7F4]"
    >
      {/* Background Wrapper driven by GSAP */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[#806d5f] pointer-events-none opacity-0"
      />

      {/* Sticky Content Wrapper */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center"
      >
        {/* Ambient Top and Bottom Fades for Seamless Layout Integration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent opacity-100 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent opacity-100 z-10 pointer-events-none" />

        {/* Static Placeholder (renders immediately while preloading in background) */}
        <img
          src={getFramePath(1)}
          alt="Alpona Story"
          className="absolute w-full h-full object-contain object-center transition-opacity duration-1000"
          style={{ 
            opacity: isLoaded ? 0 : 1, 
            pointerEvents: 'none',
            zIndex: 5
          }}
        />

        {/* Canvas for High-Performance Frame Rendering */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain object-center pointer-events-none"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10
          }}
        />

        {/* ── NARRATIVE TEXT OVERLAYS ── */}
        {/* Overlay 1: Heritage */}
        <div
          ref={textRef1}
          className="absolute bottom-20 left-4 right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-24 md:right-auto max-w-[calc(100vw-32px)] md:max-w-md bg-black/40 backdrop-blur-2xl border border-white/20 p-6 md:p-10 rounded-[2rem] text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-20 opacity-0"
        >
          <div className="flex items-center gap-2 text-[#EADCCB] mb-3">
            <IconSparkles size={16} color="currentColor" />
            <span className="text-xs md:text-xs font-bold tracking-[0.2em] uppercase">
              The Heritage
            </span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight mb-2.5 text-balance">
            Alpona Art Reimagined
          </h3>
          <p className="text-white/70 text-xs md:text-sm leading-relaxed">
            Centuries of traditional South Asian art, meticulously vectorized and reimagined for high-fidelity retail fashion.
          </p>
        </div>

        {/* Overlay 2: Quality */}
        <div
          ref={textRef2}
          className="absolute bottom-20 left-4 right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-auto md:right-24 max-w-[calc(100vw-32px)] md:max-w-md bg-black/40 backdrop-blur-2xl border border-white/20 p-6 md:p-10 rounded-[2rem] text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-20 opacity-0"
        >
          <div className="flex items-center gap-2 text-[#EADCCB] mb-3">
            <IconToteBag size={16} color="currentColor" />
            <span className="text-xs md:text-xs font-bold tracking-[0.2em] uppercase">
              Retail Quality
            </span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight mb-2.5 text-balance">
            Premium Combed Cotton
          </h3>
          <p className="text-white/70 text-xs md:text-sm leading-relaxed">
            Heavyweight, pre-shrunk combed cotton tailored for a modern, structured drape. Fabric that holds its form and softness over time.
          </p>
        </div>

        {/* Overlay 3: Sustainability */}
        <div
          ref={textRef3}
          className="absolute bottom-20 left-4 right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-24 md:right-auto max-w-[calc(100vw-32px)] md:max-w-md bg-black/40 backdrop-blur-2xl border border-white/20 p-6 md:p-10 rounded-[2rem] text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-20 opacity-0"
        >
          <div className="flex items-center gap-2 text-[#EADCCB] mb-3">
            <IconLeaf size={16} color="currentColor" />
            <span className="text-xs md:text-xs font-bold tracking-[0.2em] uppercase">
              Eco Blueprint
            </span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight mb-2.5 text-balance">
            Printed on Demand
          </h3>
          <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
            Individually printed for you in India. Eliminates massive production overstock waste, lowering our carbon blueprint.
          </p>
          <Link
            href="/shop"
            className="group inline-flex items-center justify-between pl-5 pr-1.5 py-1.5 bg-white hover:bg-neutral-50 text-primary rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] shadow-sm hover:shadow-md border border-border/80 w-max"
          >
            <span className="mr-4">Explore Collection</span>
            <div className="w-6.5 h-6.5 rounded-full bg-ring/8 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-ring/15 group-hover:scale-105">
              <IconArrowRight size={11} color="#B8763C" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
