import { Skeleton } from '@/components/ui/skeleton'

export default function AccountOrdersLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40 rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-neutral-200/80 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
