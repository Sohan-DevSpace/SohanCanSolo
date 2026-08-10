'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

interface UseScrollRevealOptions {
  /** IntersectionObserver threshold (0–1). Default 0.15 */
  threshold?: number
  /** Root margin for earlier/later triggering. Default '0px 0px -60px 0px' */
  rootMargin?: string
  /** Whether the animation should only trigger once. Default true */
  once?: boolean
}

/**
 * Returns a ref and a boolean `isVisible`.
 * Attach the ref to a container; `isVisible` becomes true when it enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, isVisible]
}
