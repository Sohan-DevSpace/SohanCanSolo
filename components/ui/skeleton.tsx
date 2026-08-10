'use client'

import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#E8E2DB]/60 dark:bg-white/[0.08] rounded-xl ${className}`}
      {...props}
    >
      <div className="absolute inset-0 shimmer-wave opacity-70" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonImage({ className = '' }: { className?: string }) {
  return <Skeleton className={`aspect-[3/4] w-full rounded-2xl ${className}`} />
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#121214] border border-[#E8E2DB] dark:border-white/[0.08] rounded-[1.75rem] p-3 sm:p-4 space-y-3 shadow-xs transition-all ${className}`}>
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] sm:aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F1EC] dark:bg-white/[0.04]">
        <Skeleton className="absolute inset-0 rounded-2xl" />
        {/* Category Badge Pill Placeholder */}
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md" />
      </div>

      {/* Product Details Skeleton */}
      <div className="space-y-2 pt-1 px-1">
        <Skeleton className="h-3.5 w-3/4 rounded-md" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <div className="flex gap-1">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonProductGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonHero({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-[60vh] sm:h-[75vh] bg-[#F5F1EC] dark:bg-[#121214] border-b border-[#E8E2DB] dark:border-white/10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-12 sm:h-16 w-3/4 rounded-3xl" />
        <Skeleton className="h-6 w-2/3 rounded-xl" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCategoryPills({ count = 6 }: { count?: number }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-28 sm:w-36 rounded-full flex-shrink-0" />
      ))}
    </div>
  )
}
