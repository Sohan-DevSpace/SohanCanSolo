import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-8 w-56 rounded-2xl mx-auto" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping Form Skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 space-y-6">
            <Skeleton className="h-6 w-40 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 space-y-6 h-fit">
            <Skeleton className="h-6 w-36 rounded-xl" />
            <SkeletonText lines={4} />
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
