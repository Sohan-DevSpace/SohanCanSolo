'use client'

import { useCallback, useRef } from 'react'

interface TiltOptions {
  maxAngle?: number
  perspective?: number
  scale?: number
  glare?: boolean
}

export function useTilt3D<T extends HTMLElement>({
  maxAngle = 8,
  perspective = 800,
  scale = 1.02,
  glare = false,
}: TiltOptions = {}) {
  const ref = useRef<T>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -maxAngle
      const rotateY = ((x - centerX) / centerX) * maxAngle

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
      el.style.transition = 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)'

      if (glare && glareRef.current) {
        const glareX = (x / rect.width) * 100
        const glareY = (y / rect.height) * 100
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
        glareRef.current.style.opacity = '1'
      }
    },
    [maxAngle, perspective, scale, glare]
  )

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'

    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0'
    }
  }, [perspective, glare])

  return { ref, glareRef, handleMouseMove, handleMouseLeave }
}
