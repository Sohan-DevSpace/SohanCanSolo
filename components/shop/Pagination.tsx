'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { AnimatedChevronLeft, AnimatedChevronRight } from '@/components/shared/AnimatedIcons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const prefersReducedMotion = useReducedMotion()

  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 1
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const pages = getVisiblePages()

  return (
    <nav aria-label="Pagination" className="pt-8 sm:pt-12 pb-4 stagger">
      {/* Decorative top line */}
      <div className="flex items-center gap-4 mb-8 px-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        <span className="text-[10px] text-muted-foreground/60 font-extrabold uppercase tracking-[0.25em]">
          Page {currentPage} of {totalPages}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {/* Previous button */}
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 sm:p-3.5 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-ring hover:bg-card hover:border-ring/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
          aria-label="Previous page"
        >
          <AnimatedChevronLeft size={18} />
        </motion.button>

        {/* Page numbers */}
        <div className="flex items-center gap-1.5 p-1.5 bg-card/30 backdrop-blur-md rounded-3xl border border-border/40 shadow-sm">
          <AnimatePresence mode="popLayout">
            {pages.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="px-3 text-muted-foreground/50 text-[11px] font-extrabold tracking-[0.2em] select-none"
                  >
                    ···
                  </span>
                )
              }

              const isActive = page === currentPage
              return (
                <motion.button
                  key={page}
                  layout
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  onClick={() => onPageChange(page as number)}
                  className={`
                    relative w-11 h-11 sm:w-12 sm:h-12 rounded-[1.25rem] text-[13px] sm:text-[14px] font-bold
                    transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer
                    ${isActive
                      ? 'text-background'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Page ${page}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-page"
                      className="absolute inset-0 bg-foreground rounded-[1.25rem] shadow-matte-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 font-display">{page}</span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Next button */}
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 sm:p-3.5 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-ring hover:bg-card hover:border-ring/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
          aria-label="Next page"
        >
          <AnimatedChevronRight size={18} />
        </motion.button>
      </div>
    </nav>
  )
}
