'use client'

import { motion } from 'framer-motion'

const BRONZE = '#B8763C'
const WARM = '#B8763C'
const GOLD = '#D4A04A'
const ROSE = '#C87060'

interface IconProps {
  size?: number
  className?: string
}

export function AnimatedHeart({ size = 24, className = '', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
    >
      <motion.path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={filled ? '#E05C5C' : BRONZE}
        strokeWidth={1.5}
        fill={filled ? '#E05C5C' : 'rgba(184,118,60,0.08)'}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      {!filled && (
        <motion.circle
          cx="12" cy="10" r="3"
          fill={BRONZE}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.12 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ transformOrigin: '12px 10px' }}
        />
      )}
    </motion.svg>
  )
}

export function AnimatedCheck({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.circle
        cx="12" cy="12" r="10"
        strokeWidth={1.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M8 12l3 3 5-5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="12" cy="12" r="4"
        fill={BRONZE}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        style={{ transformOrigin: '12px 12px' }}
      />
    </motion.svg>
  )
}

export function AnimatedFilter({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.line
        x1="4" y1="6" x2="20" y2="6"
        stroke={BRONZE}
        strokeWidth={1.8}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="8" cy="6" r="2"
        fill={BRONZE}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
        style={{ transformOrigin: '8px 6px' }}
      />
      <motion.line
        x1="4" y1="12" x2="20" y2="12"
        stroke={WARM}
        strokeWidth={1.8}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="14" cy="12" r="2"
        fill={WARM}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
        style={{ transformOrigin: '14px 12px' }}
      />
      <motion.line
        x1="4" y1="18" x2="20" y2="18"
        stroke={BRONZE}
        strokeWidth={1.8}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="11" cy="18" r="2"
        fill={BRONZE}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 400, damping: 15 }}
        style={{ transformOrigin: '11px 18px' }}
      />
    </motion.svg>
  )
}

export function AnimatedStar({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ rotate: 15, scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={GOLD}
        strokeWidth={1.5}
        fill="rgba(212,160,74,0.1)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="12" cy="11" r="3"
        fill={GOLD}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        style={{ transformOrigin: '12px 11px' }}
      />
    </motion.svg>
  )
}

export function AnimatedStarFilled({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      whileHover={{ rotate: 15, scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={GOLD}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{ transformOrigin: '12px 12px' }}
      />
      <motion.circle
        cx="12" cy="11" r="3"
        fill="#FFF"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ transformOrigin: '12px 11px' }}
      />
    </motion.svg>
  )
}

export function AnimatedChevronRight({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M9 18l6-6-6-6"
        stroke={BRONZE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}

export function AnimatedChevronLeft({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M15 18l-6-6 6-6"
        stroke={BRONZE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}

export function AnimatedChevronDown({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ y: 2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M6 9l6 6 6-6"
        stroke={BRONZE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}

export function AnimatedClose({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ rotate: 90, scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
    >
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={ROSE}
        strokeWidth={1.2}
        fill="rgba(200,112,96,0.06)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: '12px 12px' }}
      />
      <motion.line
        x1="8" y1="8" x2="16" y2="16"
        stroke={ROSE}
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.15, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.line
        x1="16" y1="8" x2="8" y2="16"
        stroke={ROSE}
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}

export function AnimatedSearch({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.circle
        cx="11" cy="11" r="7"
        stroke={BRONZE}
        strokeWidth={1.6}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="11" cy="11" r="3"
        fill={BRONZE}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        style={{ transformOrigin: '11px 11px' }}
      />
      <motion.line
        x1="16.5" y1="16.5" x2="21" y2="21"
        stroke={BRONZE}
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.25, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}

export function AnimatedCart({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
        stroke={BRONZE}
        strokeWidth={1.5}
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.line
        x1="3" y1="6" x2="21" y2="6"
        stroke={WARM}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M16 10a4 4 0 01-8 0"
        stroke={BRONZE}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.35, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  )
}

export function AnimatedTshirt({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      animate={{ rotate: [-1, 1, -1] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
    >
      <motion.path
        d="M6 2l3 3h2l1-2 1 2h2l3-3L21 7l-4 1v12a2 2 0 01-2 2H7a2 2 0 01-2-2V8L3 7l3-5z"
        stroke={BRONZE}
        strokeWidth={1.5}
        strokeLinejoin="round"
        fill="rgba(184,118,60,0.04)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx="12" cy="12" r="4"
        fill={WARM}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        style={{ transformOrigin: '12px 12px' }}
      />
    </motion.svg>
  )
}

/* ─── AUTH / ACCOUNT ICONS ─── */

export function AnimatedMail({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.rect x="2" y="4" width="20" height="16" rx="3" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M22 6l-10 7L2 6" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedLock({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.rect x="5" y="11" width="14" height="11" rx="3" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M8 11V7a4 4 0 018 0v4" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="12" cy="16.5" r="1.5" fill={BRONZE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }} />
    </motion.svg>
  )
}

export function AnimatedEye({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="12" cy="12" r="3" stroke={WARM} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedEyeOff({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={WARM} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="1" y1="1" x2="23" y2="23" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="12" cy="12" r="3" stroke={ROSE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 0 }} transition={{ duration: 0.01 }} />
    </motion.svg>
  )
}

export function AnimatedUser({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.circle cx="12" cy="8" r="4" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedArrowRight({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ x: 2 }} whileTap={{ scale: 0.9 }}>
      <motion.line x1="5" y1="12" x2="19" y2="12" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M15 7l5 5-5 5" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedArrowLeft({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
      <motion.line x1="19" y1="12" x2="5" y2="12" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M9 7l-5 5 5 5" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedAlertCircle({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.circle cx="12" cy="12" r="10" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="12" y1="8" x2="12" y2="13" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="12" cy="16.5" r="0.75" fill={BRONZE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55, type: 'spring', stiffness: 400, damping: 15 }} />
    </motion.svg>
  )
}

export function AnimatedPackage({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="12" y1="22.08" x2="12" y2="12" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedMapPin({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="12" cy="10" r="3" stroke={WARM} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedKey({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.circle cx="8" cy="15" r="5" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="11.5" y1="12.5" x2="18" y2="6" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="18" y1="6" x2="21" y2="9" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="6.5" cy="15.5" r="0.75" fill={BRONZE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }} />
    </motion.svg>
  )
}

export function AnimatedBell({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ rotate: [0, -10, 10, -5, 0] }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M13.73 21a2 2 0 01-3.46 0" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedSettings({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ rotate: 45 }} whileTap={{ scale: 0.9 }}>
      <motion.circle cx="12" cy="12" r="3" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={WARM} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedPalette({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M12 2a10 10 0 00-3 19.46V21a2 2 0 002 2h8a2 2 0 002-2v-2.54A10 10 0 0012 2z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="8" cy="8" r="1.5" fill={WARM} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 15 }} />
      <motion.circle cx="16" cy="8" r="1.5" fill={GOLD} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.45, type: 'spring', stiffness: 400, damping: 15 }} />
      <motion.circle cx="6" cy="14" r="1.5" fill={ROSE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }} />
      <motion.circle cx="16" cy="16" r="1.5" fill={BRONZE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55, type: 'spring', stiffness: 400, damping: 15 }} />
    </motion.svg>
  )
}

export function AnimatedLogOut({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ x: 2 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="16 17 21 12 16 7" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="21" y1="12" x2="9" y2="12" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedTrash({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M3 6h18" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={GOLD} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="10" y1="11" x2="10" y2="17" stroke={ROSE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="14" y1="11" x2="14" y2="17" stroke={ROSE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.45, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedUpload({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="17 8 12 3 7 8" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="12" y1="3" x2="12" y2="15" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedPlus({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}>
      <motion.line x1="12" y1="5" x2="12" y2="19" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="5" y1="12" x2="19" y2="12" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedCalendar({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.rect x="3" y="4" width="18" height="18" rx="3" stroke={BRONZE} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="3" y1="10" x2="21" y2="10" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="8" y1="2" x2="8" y2="6" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="16" y1="2" x2="16" y2="6" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedPhone({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedHome({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M3 9.5l9-7 9 7V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="9 22 9 12 15 12 15 22" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedDownload({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ y: 2 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="7 10 12 15 17 10" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="12" y1="15" x2="12" y2="3" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedExternalLink({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="15 3 21 3 21 9" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="10" y1="14" x2="21" y2="3" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedSparkles({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M12 3l1.91 5.59L19 8l-4.5 3.5L16 17l-4-3-4 3 1.5-5.5L5 8l5.09-.59L12 3z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" fill="rgba(184,118,60,0.06)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M19 14l.73 2.27L22 17l-1.77 1.23L20 21l-1.5-1.5L17 21l.5-2.77L16 17l2.27-.73L19 14z" stroke={WARM} strokeWidth={1.2} strokeLinejoin="round" fill="rgba(200,117,51,0.04)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedPenTool({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M12 19l7-7 3 3-7 7-3-3z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="11" cy="11" r="1.5" fill={GOLD} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }} />
    </motion.svg>
  )
}

export function AnimatedFileImage({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.polyline points="14 2 14 8 20 8" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="9" cy="13" r="1.5" fill={GOLD} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }} />
      <motion.path d="M4 19l4-4 2 2 3-3 3 3 2-2 2 2" stroke={ROSE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedShieldAlert({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M12 2l7 4v5c0 5.25-3.13 10.02-7 11.5-3.87-1.48-7-6.25-7-11.5V6l7-4z" stroke={BRONZE} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      <motion.line x1="12" y1="9" x2="12" y2="13" stroke={WARM} strokeWidth={1.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx="12" cy="16.5" r="0.75" fill={BRONZE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55, type: 'spring', stiffness: 400, damping: 15 }} />
    </motion.svg>
  )
}

export function AnimatedEdit({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <motion.path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={BRONZE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={WARM} strokeWidth={1.5} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
    </motion.svg>
  )
}

export function AnimatedTag({ size = 24, className = '' }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      whileHover={{ rotate: 10, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </motion.svg>
  )
}
