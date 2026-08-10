'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const shouldReduceMotion = useReducedMotion() ?? false
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, {
    stiffness: shouldReduceMotion ? 500 : 120,
    damping: shouldReduceMotion ? 100 : 18,
  })

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplay(Math.round(latest))
    })
    return unsubscribe
  }, [spring])

  return <span className={className}>{format ? format(display) : display}</span>
}
