export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse py-2">
      <div className="h-6 bg-neutral-100 rounded-lg w-1/3" />
      <div className="h-3.5 bg-neutral-100 rounded w-1/2" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-11 bg-neutral-100 rounded-xl w-full" />
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-[#E8E2DB]/50 rounded-2xl p-5 space-y-3">
          <div className="h-5 bg-neutral-100 rounded w-2/3" />
          <div className="h-3 bg-neutral-100 rounded w-1/2" />
          <div className="h-3 bg-neutral-100 rounded w-3/4" />
          <div className="h-8 bg-neutral-100 rounded-xl w-1/3 mt-4" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-[#E8E2DB]/40 rounded-xl">
          <div className="w-12 h-12 bg-neutral-100 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-100 rounded w-1/3" />
            <div className="h-3 bg-neutral-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
