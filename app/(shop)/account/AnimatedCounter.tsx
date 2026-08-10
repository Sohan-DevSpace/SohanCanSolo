'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className="tabular-nums"
    >
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01 }}
        >
          <CountUp target={value} />
        </motion.span>
      ) : (
        '0'
      )}
    </motion.span>
  )
}

function CountUp({ target }: { target: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01 }}
    >
      <AnimatedNumber value={target} />
    </motion.span>
  )
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
    >
      {value}
    </motion.span>
  )
}
