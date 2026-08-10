'use client'

import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 dark:bg-white/[0.06] rounded-xl ${className}`}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonImage({ className = '' }: { className?: string }) {
  return <Skeleton className={`aspect-square w-full rounded-2xl ${className}`} />
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-4 space-y-4 shadow-sm ${className}`}>
      <SkeletonImage />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )
}

export function SkeletonProductGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonHero({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-[70vh] sm:h-[80vh] bg-[#E8E2DB]/30 overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Skeleton className="h-12 sm:h-16 w-3/4 sm:w-1/2 rounded-3xl" />
        <Skeleton className="h-6 sm:h-8 w-2/3 sm:w-1/3 rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-full mt-8" />
      </div>
    </div>
  )
}

export function SkeletonCategoryPills({ count = 6 }: { count?: number }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 sm:w-32 rounded-full flex-shrink-0" />
      ))}
    </div>
  )
}
