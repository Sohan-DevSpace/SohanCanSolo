'use client'

import { useEffect, useRef, useState } from 'react'

const TOTAL_FRAMES = 300
const FRAME_STEP = 10
const FPS = 30
const FRAME_DURATION = 1000 / FPS

function getFramePaths(): string[] {
  const frames: string[] = []
  for (let i = 1; i <= TOTAL_FRAMES; i += FRAME_STEP) {
    const frameNum = i.toString().padStart(3, '0')
    frames.push(`/images/hero-sequence/ezgif-frame-${frameNum}.jpg`)
  }
  return frames
}

export function AnimatedHeroBackground() {
  const [mounted, setMounted] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [frames, setFrames] = useState<string[]>([])
  const frameRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(0)
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    setMounted(true)
    setFrames(getFramePaths())
  }, [])

  useEffect(() => {
    if (!mounted || prefersReducedMotion || frames.length === 0) return

    const animate = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= FRAME_DURATION) {
        setCurrentFrame((prev) => (prev + 1) % frames.length)
        lastTimeRef.current = currentTime
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [mounted, frames.length, prefersReducedMotion])

  useEffect(() => {
    if (frameRef.current && frames.length > 0) {
      frameRef.current.style.backgroundImage = `url(${frames[currentFrame]})`
    }
  }, [currentFrame, frames])

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-[#FAF6F2] z-0" />
    )
  }

  return (
    <div
      ref={frameRef}
      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: frames.length > 0 ? `url(${frames[0]})` : 'none',
        transition: 'background-image 0ms',
      } as React.CSSProperties}
      role="img"
      aria-label="Animated hero background"
    />
  )
}