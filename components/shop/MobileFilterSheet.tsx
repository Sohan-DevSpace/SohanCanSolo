'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { FilterSidebar } from './FilterSidebar'
import { AnimatedClose } from '@/components/shared/AnimatedIcons'
import { useState, useEffect, useCallback, useRef } from 'react'

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: any[]
  subcategories: any[]
  productTypes: any[]
  activeFilterCount: number
  onResetFilters: () => void
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  subcategories,
  productTypes,
  activeFilterCount,
  onResetFilters,
}: MobileFilterSheetProps) {
  const [isMounted, setIsMounted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  if (!isMounted) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        ref={contentRef}
        side="bottom"
        showCloseButton={false}
        className="bg-card/90 backdrop-blur-3xl border-t border-border/80 rounded-t-[2.5rem] max-h-[90vh] flex flex-col shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.2)]"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-border/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-muted-foreground/80">
              Filter & Refine
            </span>
            {activeFilterCount > 0 && (
              <span className="w-6 h-6 bg-ring text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-matte-sm">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={onResetFilters}
                className="text-[10px] font-extrabold uppercase tracking-widest text-ring hover:text-ring/80 transition-colors duration-200 cursor-pointer active:scale-95 px-2 py-1 rounded-lg hover:bg-ring/10"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-secondary/80 rounded-full transition-all duration-200 cursor-pointer active:scale-90"
              aria-label="Close filters"
            >
              <AnimatedClose size={18} />
            </button>
          </div>
        </div>

        {/* Filters content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar stagger">
          <FilterSidebar
            categories={categories}
            subcategories={subcategories}
            productTypes={productTypes}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border/40 bg-card/60 backdrop-blur-xl">
          <div className="flex gap-3">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={onResetFilters}
                className="flex-1 h-12 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
              >
                Clear All
              </Button>
            )}
            <Button
              onClick={handleClose}
              className={`flex-1 h-12 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest bg-foreground text-background hover:bg-ring transition-all duration-300 shadow-matte-md cursor-pointer active:scale-95 ${activeFilterCount === 0 ? 'flex-1' : ''}`}
            >
              Show Results
              {activeFilterCount > 0 && (
                <span className="ml-2 text-background/70 tabular-nums font-bold">({activeFilterCount})</span>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
