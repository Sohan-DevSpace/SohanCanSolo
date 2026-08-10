'use client'

import { useEffect, useRef, useState } from 'react'

const FRAME_STEP = 5
const TOTAL_FRAMES = 48
const FRAME_PREFIX = '/hero_section/ezgif-frame-'
const FRAME_SUFFIX = '.png'
const FPS = 15
const FRAME_TIME = 1000 / FPS

// Helper to pad frame numbers with step (e.g. 1 -> '001', 2 -> '006')
const getFramePath = (index: number) => {
  const frameNum = Math.min((index - 1) * FRAME_STEP + 1, 240)
  const paddedIndex = frameNum.toString().padStart(3, '0')
  return `${FRAME_PREFIX}${paddedIndex}${FRAME_SUFFIX}`
}

interface HeroFrameAnimationProps {
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  sizes?: string
}

export function HeroFrameAnimation({ className, style }: HeroFrameAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const frameIndexRef = useRef(0)
  const lastTimeRef = useRef(0)
  const requestRef = useRef<number>(0)

  // Preload all frames immediately for buttery-smooth performance
  useEffect(() => {
    let isActive = true
    let loadedCount = 0
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES)

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFramePath(i)
      
      const handleLoad = () => {
        if (!isActive) return
        loadedImages[i - 1] = img
        loadedCount++

        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true)
          setImages(loadedImages.filter(Boolean))
          if (canvasRef.current && loadedImages[0]) {
            canvasRef.current.width = loadedImages[0].width || 800
            canvasRef.current.height = loadedImages[0].height || 800
          }
        }
      }

      img.onload = handleLoad
      img.onerror = handleLoad
    }

    return () => {
      isActive = false
    }
  }, [])

  // Animation Loop - Smooth 24 FPS hardware-accelerated playback
  useEffect(() => {
    if (!isLoaded || images.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    frameIndexRef.current = 0
    lastTimeRef.current = performance.now()

    // Draw first frame immediately
    const initialImg = images[0]
    if (initialImg && initialImg.complete) {
      ctx.drawImage(initialImg, 0, 0, canvas.width, canvas.height)
    }

    const TARGET_INTERVAL = 1000 / 24 // 24 FPS smooth playback

    const render = (time: number) => {
      if (document.hidden) {
        requestRef.current = requestAnimationFrame(render)
        return
      }

      const elapsed = time - lastTimeRef.current

      if (elapsed >= TARGET_INTERVAL) {
        const img = images[frameIndexRef.current]
        
        if (img && img.complete) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }

        if (frameIndexRef.current < TOTAL_FRAMES - 1) {
          frameIndexRef.current += 1
          lastTimeRef.current = time - (elapsed % TARGET_INTERVAL)
        } else {
          // Keep displaying final high-res frame
          return
        }
      }

      requestRef.current = requestAnimationFrame(render)
    }

    requestRef.current = requestAnimationFrame(render)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isLoaded, images])

  // Remove objectFit properties from main wrapper style to prevent confusion
  const wrapperStyle = { ...style }
  delete wrapperStyle.objectFit
  delete wrapperStyle.objectPosition

  const wrapperClasses = className?.includes('absolute') 
    ? className 
    : `relative ${className || ''}`

  return (
    <div className={wrapperClasses} style={wrapperStyle}>
      {!isLoaded && (
        <img 
          src={getFramePath(1)} 
          alt="Loading animation..." 
          className="w-full h-full absolute inset-0 object-cover object-right"
        />
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 object-cover object-right"
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  )
}

