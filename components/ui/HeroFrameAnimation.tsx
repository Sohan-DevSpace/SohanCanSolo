'use client'

import { useEffect, useRef, useState } from 'react'

const FRAME_STEP = 5
const TOTAL_FRAMES = 48
const FRAME_PREFIX = '/hero_section/ezgif-frame-'
const FRAME_SUFFIX = '.png'
const FPS = 30
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

  // Preload frames in small idle batches to keep the network pipeline clear during initial render
  useEffect(() => {
    let isActive = true
    let loadedCount = 0
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES)

    const loadBatch = (startIndex: number, batchSize: number) => {
      if (!isActive) return

      const endIndex = Math.min(startIndex + batchSize, TOTAL_FRAMES + 1)
      let batchLoaded = 0
      const totalInBatch = endIndex - startIndex

      for (let i = startIndex; i < endIndex; i++) {
        const img = new Image()
        img.src = getFramePath(i)
        
        img.onload = () => {
          if (!isActive) return
          loadedImages[i - 1] = img
          loadedCount++
          batchLoaded++

          if (loadedCount === TOTAL_FRAMES) {
            setIsLoaded(true)
            setImages(loadedImages.filter(Boolean))
            if (canvasRef.current && loadedImages[0]) {
              canvasRef.current.width = loadedImages[0].width || 800
              canvasRef.current.height = loadedImages[0].height || 800
            }
          } else if (batchLoaded === totalInBatch && endIndex <= TOTAL_FRAMES) {
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              window.requestIdleCallback(() => loadBatch(endIndex, batchSize))
            } else {
              setTimeout(() => loadBatch(endIndex, batchSize), 50)
            }
          }
        }

        img.onerror = () => {
          if (!isActive) return
          loadedCount++
          batchLoaded++
          if (loadedCount === TOTAL_FRAMES) {
            setIsLoaded(true)
            setImages(loadedImages.filter(Boolean))
          } else if (batchLoaded === totalInBatch && endIndex <= TOTAL_FRAMES) {
            setTimeout(() => loadBatch(endIndex, batchSize), 50)
          }
        }
      }
    }

    // Delay start until after FCP/LCP paint
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadBatch(1, 20))
      } else {
        loadBatch(1, 20)
      }
    }, 1500)

    return () => {
      isActive = false
      clearTimeout(timer)
    }
  }, [])

  // Animation Loop
  useEffect(() => {
    if (!isLoaded || images.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset frame tracking references for a clean start on mount/reload
    frameIndexRef.current = 0
    lastTimeRef.current = 0

    // Draw first frame immediately when loaded
    const initialImg = images[0]
    if (initialImg && initialImg.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(initialImg, 0, 0, canvas.width, canvas.height)
    }

    const render = (time: number) => {
      // Pause animation if tab is hidden
      if (document.hidden) {
        requestRef.current = requestAnimationFrame(render)
        return
      }

      if (time - lastTimeRef.current >= FRAME_TIME - 2) {
        // Clear and draw the current frame
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const img = images[frameIndexRef.current]
        
        // Draw the image filling the canvas
        if (img && img.complete) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }

        // Increment frame or stop at the last frame
        if (frameIndexRef.current < TOTAL_FRAMES - 1) {
          frameIndexRef.current = frameIndexRef.current + 1
          lastTimeRef.current = time
        } else {
          // Reached the last frame, stop the animation loop
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

