'use client'

import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

interface SmoothScrollProps {
  children: React.ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Disable Lenis smooth scrolling on /shop page due to h-screen dashboard layout with nested overflow container.
    if (pathname === '/shop') {
      lenisRef.current = null
      return
    }

    // Instantiate Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium exponential easeOut
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      syncTouch: false,
    })

    lenisRef.current = lenis

    // Animation frame callback
    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    // Clean up
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [pathname])

  // Scroll to top instantly when pathname changes (Next.js App Router transition)
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
  }, [pathname])

  return <>{children}</>
}
