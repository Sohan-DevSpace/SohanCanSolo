'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface MotionLayoutProps {
  children: React.ReactNode
}

export function MotionLayout({ children }: MotionLayoutProps) {
  const pathname = usePathname()

  return (
    <>
      {/* ─── Global Page Transitions ─── */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
        className="flex-grow flex flex-col min-h-[inherit]"
      >
        {children}
      </motion.div>
    </>
  )
}
