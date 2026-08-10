export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-24 bg-zinc-900/50 rounded-xl border border-white/[0.04]" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-zinc-900/40 rounded-xl border border-white/[0.04]" />
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-zinc-900/30 rounded-xl border border-white/[0.04]" />
        <div className="h-64 bg-zinc-900/30 rounded-xl border border-white/[0.04]" />
      </div>
    </div>
  )
}
