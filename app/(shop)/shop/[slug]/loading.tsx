import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export default function ProductDetailLoading() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-9 w-4/5 rounded-2xl" />
            <Skeleton className="h-7 w-32 rounded-xl" />
          </div>

          <SkeletonText lines={4} />

          {/* Variants Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-20 rounded-full" />
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-12 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-14 flex-1 rounded-full" />
            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
