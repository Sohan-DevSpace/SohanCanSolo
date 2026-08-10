'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 select-none w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-8"
      >
        {/* Brand Text Reveal */}
        <div className="relative overflow-hidden">
          <motion.h1 
            className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1A1A] tracking-[0.3em] uppercase"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Alpona
          </motion.h1>
          
          {/* Shimmer effect overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
          />
        </div>

        {/* Elegant Progress Line & Text */}
        <div className="flex flex-col items-center gap-4 w-48">
          <div className="h-[2px] w-full bg-[#E8E2DB] rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-[#C87533] w-1/3 rounded-full"
              animate={{ left: ['-40%', '110%'] }}
              transition={{ 
                duration: 1.4, 
                repeat: Infinity, 
                ease: [0.65, 0, 0.35, 1]
              }}
            />
          </div>
          <motion.span 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6560]"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            Curating Collection
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}

export default PageLoader
