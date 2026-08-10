'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const messages = [
  "🚚  Free Shipping on all orders above ₹999",
  "↩  7 Days Easy Returns — No questions asked",
  "🇮🇳  Proudly Made in India",
  "✨  New designs added every week",
]

export function AnnouncementBar() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted || !isVisible) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [mounted, isVisible])

  if (!mounted || !isVisible) return null

  return (
    <div className="w-full bg-[#F5EFE8] h-[36px] flex items-center justify-center overflow-hidden select-none relative z-50">
      <div className="relative h-full w-full max-w-[1440px] flex items-center justify-between overflow-hidden px-4 md:px-10">

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center px-12"
          >
            <span className="font-body text-[11px] font-medium tracking-[0.06em] text-[#1A1A1A]/80 text-center whitespace-nowrap">
              {messages[activeIndex]}
            </span>
          </motion.div>
        </AnimatePresence>
        
        {/* Close Button */}
        <div className="flex items-center gap-2 z-10 ml-auto">
          <button
            onClick={() => setIsVisible(false)}
            className="w-6 h-6 flex items-center justify-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors cursor-pointer rounded-full hover:bg-black/5 active:scale-95"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
