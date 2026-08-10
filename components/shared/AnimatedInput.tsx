'use client'

import { type InputHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  label?: string
  error?: string
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ icon, label, error, className = '', id, ...props }, ref) => {
    return (
      <motion.div
        className="space-y-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {label && (
          <label
            htmlFor={id}
            className="block text-[10px] tracking-[0.18em] uppercase font-bold text-[#7A6B5B]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A88B70] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-white border border-[#E8E2DB] focus-visible:ring-[3px] focus-visible:ring-[#B8763C]/12 text-[#1A1A1A] ${icon ? 'pl-11' : 'pl-4'} pr-4 rounded-xl h-11 text-sm font-medium shadow-none focus:border-[#B8763C] outline-none transition-all duration-200 placeholder:text-neutral-300 ${className}`}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            className="text-[11px] text-red-500 font-medium pl-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'
