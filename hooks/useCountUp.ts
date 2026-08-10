'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface UseCountUpOptions {
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 1200, decimals = 0, suffix = '', prefix = '' } = options
  const ref = useRef<HTMLElement>(null)
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`)
  const hasAnimated = useRef(false)

  const animate = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      setDisplayValue(`${prefix}${current.toFixed(decimals)}${suffix}`)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [target, duration, decimals, suffix, prefix])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(`${prefix}${target.toFixed(decimals)}${suffix}`)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animate, target, decimals, suffix, prefix])

  return { ref, displayValue }
}
