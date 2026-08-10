'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function AccountNavLink({ href, icon, children }: { href: string, icon: ReactNode, children: ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className="relative block group">
      {/* Active background pill */}
      {isActive && (
        <motion.div
          layoutId="activeNavBackground"
          className="absolute inset-0 bg-white shadow-[0_2px_12px_rgba(184,118,60,0.08)] border border-[#E8E2DB] rounded-xl"
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      )}
      {/* Left accent bar */}
      {isActive && (
        <motion.div
          layoutId="activeNavAccent"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#B8763C] rounded-r-full"
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      )}
      <div
        className={`relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-[13px] font-semibold transition-all duration-200 ${
          isActive
            ? 'text-[#1A1A1A] font-bold'
            : 'text-[#6B6259] hover:text-[#1A1A1A] hover:bg-white/60 hover:translate-x-[2px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
        }`}
      >
        <span className={`transition-colors duration-200 shrink-0 ${isActive ? 'text-[#B8763C]' : 'text-[#A39888] group-hover:text-[#B8763C]'}`}>
          {icon}
        </span>
        {children}
      </div>
    </Link>
  )
}
