'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, HTMLMotionProps, useReducedMotion } from 'framer-motion'

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  once?: boolean
  margin?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  direction = 'up',
  distance = 30,
  once = true,
  margin = '-50px',
  ...props
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: margin as any })
  const shouldReduceMotion = useReducedMotion()

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {}
  }

  const animateX = direction === 'left' || direction === 'right'
  const animateY = direction === 'up' || direction === 'down'

  const hasDirection = direction !== 'none' && !shouldReduceMotion

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: animateX && hasDirection ? directions[direction].x : 0,
        y: animateY && hasDirection ? directions[direction].y : 0,
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : {
              opacity: 0,
              x: animateX && hasDirection ? directions[direction].x : 0,
              y: animateY && hasDirection ? directions[direction].y : 0,
            }
      }
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as any, // luxury easeOutExpo
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface TextRevealProps extends HTMLMotionProps<'h1'> {
  text: string
  delay?: number
  once?: boolean
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export function TextReveal({
  text,
  delay = 0,
  once = true,
  className = '',
  as = 'h1',
  ...props
}: TextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const isInView = useInView(ref, { once, margin: '-20px' })
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.02,
        delayChildren: delay,
      },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : '0.45em' },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as any,
      },
    },
  }

  const Tag = motion[as] as any

  return (
    <Tag
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`inline-block overflow-hidden ${className}`}
      {...props}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </Tag>
  )
}

interface TextStaggerRevealProps extends HTMLMotionProps<'h1'> {
  text: string
  delay?: number
  once?: boolean
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export function TextStaggerReveal({
  text,
  delay = 0,
  once = true,
  className = '',
  as = 'h1',
  ...props
}: TextStaggerRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const isInView = useInView(ref, { once, margin: '-20px' })
  const shouldReduceMotion = useReducedMotion()
  const words = text.split(' ')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : '0.6em' },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any, // easeOutExpo
      },
    },
  }

  const Tag = motion[as] as any

  return (
    <Tag
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`inline-flex flex-wrap gap-x-[0.25em] overflow-hidden ${className}`}
      {...props}
    >
      {words.map((word, index) => (
        <span key={index} className="inline-block overflow-hidden py-1">
          <motion.span
            variants={wordVariants}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

interface HoverLiftProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  yOffset?: number
  scale?: number
  className?: string
}

export function HoverLift({
  children,
  yOffset = -8,
  scale = 1.015,
  className = '',
  ...props
}: HoverLiftProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : {
        y: yOffset,
        scale,
        boxShadow: '0 20px 40px -15px rgba(200, 117, 51, 0.08)',
      }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as any,
      }}
      className={`transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── World-Class Magnetic Effect ───
export function Magnetic({
  children,
  range = 45,
  actionScale = 1.02,
  className = '',
  ...props
}: {
  children: React.ReactNode
  range?: number
  actionScale?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const shouldReduceMotion = useReducedMotion()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion || !ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY

    if (Math.abs(distanceX) < range * 1.5 && Math.abs(distanceY) < range * 1.5) {
      const strength = 0.35
      setPosition({ x: distanceX * strength, y: distanceY * strength })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      whileHover={shouldReduceMotion ? {} : { scale: actionScale }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── Dynamic 3D Tilt Card ───
export function TiltCard({
  children,
  maxTilt = 8,
  glowIntensity = 0.12,
  className = '',
  ...props
}: {
  children: React.ReactNode
  maxTilt?: number
  glowIntensity?: number
  className?: string
} & HTMLMotionProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 })
  const shouldReduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion || isMobile || !ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const relativeX = (clientX - left) / width - 0.5
    const relativeY = (clientY - top) / height - 0.5

    setRotate({
      x: -relativeY * maxTilt,
      y: relativeX * maxTilt
    })

    setGlow({
      x: ((clientX - left) / width) * 100,
      y: ((clientY - top) / height) * 100,
      opacity: glowIntensity
    })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setGlow(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
        transformPerspective: 1000,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, mass: 0.4 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
      {...props}
    >
      {children}
      {/* Dynamic spot glow overlay */}
      {!shouldReduceMotion && !isMobile && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-30"
          style={{
            opacity: glow.opacity,
            background: `radial-gradient(circle 140px at ${glow.x}% ${glow.y}%, rgba(200, 117, 51, 0.35), transparent 75%)`
          }}
        />
      )}
    </motion.div>
  )
}

// ─── Glow Overlay spotlight on buttons/containers ───
export function GlowOverlay({
  children,
  className = '',
  glowColor = 'rgba(200, 117, 51, 0.12)',
  glowRadius = 100,
  ...props
}: {
  children: React.ReactNode
  className?: string
  glowColor?: string
  glowRadius?: number
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0, opacity: 0 })
  const shouldReduceMotion = useReducedMotion()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion || !ref.current) return
    const { clientX, clientY } = e
    const { left, top } = ref.current.getBoundingClientRect()
    setCoords({
      x: clientX - left,
      y: clientY - top,
      opacity: 1
    })
  }

  const handleMouseLeave = () => {
    setCoords(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
          style={{
            opacity: coords.opacity,
            background: `radial-gradient(circle ${glowRadius}px at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`
          }}
        />
      )}
    </div>
  )
}
