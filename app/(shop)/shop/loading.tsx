import { SkeletonProductGrid, Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Skeleton */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <Skeleton className="h-4 w-32 mx-auto rounded-full" />
          <Skeleton className="h-10 w-3/4 mx-auto rounded-2xl" />
          <Skeleton className="h-5 w-2/3 mx-auto rounded-xl" />
        </div>

        {/* Filter bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-neutral-200/80">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>

        {/* Product Grid Skeleton */}
        <SkeletonProductGrid count={12} />
      </div>
    </div>
  )
}
