import { SkeletonHero, SkeletonCategoryPills, SkeletonProductGrid, Skeleton } from '@/components/ui/skeleton'

export default function ShopGroupLoading() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen pb-20">
      <SkeletonHero />
      <div className="max-w-7xl mx-auto space-y-16 px-4 sm:px-6 lg:px-12 mt-12">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <SkeletonCategoryPills count={8} />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 rounded-xl mx-auto" />
          <SkeletonProductGrid count={8} />
        </div>
      </div>
    </div>
  )
}
