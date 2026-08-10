'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'

export function MobileStickyBar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls past 450px on mobile screens
      if (window.scrollY > 450) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E2DB] shadow-[0_-8px_25px_rgba(0,0,0,0.1)] px-4 py-2.5 select-none"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            {/* Offer details */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-extrabold text-[#C87533] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Heavyweight Drops</span>
              </span>
              <span className="text-xs font-bold text-stone-900 truncate">
                Starts from <span className="text-emerald-700 font-extrabold">₹699</span> • Free Delivery
              </span>
            </div>

            {/* CTA Button */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#C87533] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shrink-0 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
