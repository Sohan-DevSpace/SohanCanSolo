import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export default function CartLoading() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-8 w-48 rounded-2xl" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-neutral-200/80 flex gap-4 items-center">
                <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/4 rounded-md" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 space-y-6 h-fit">
            <Skeleton className="h-6 w-36 rounded-xl" />
            <SkeletonText lines={3} />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
