'use client'

import { motion } from 'framer-motion'

interface AnimatedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
}

export function AnimatedToggle({
  checked,
  onChange,
  id,
  disabled = false,
}: AnimatedToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8763C]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-[#B8763C]' : 'bg-[#E8E2DB]'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm mt-0.5 ${
          checked ? 'ml-[18px]' : 'ml-[2px]'
        }`}
      />
    </button>
  )
}
