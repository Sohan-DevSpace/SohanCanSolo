'use client'

import { useMemo } from 'react'

interface DashboardChartProps {
  orders: { created_at: string; total: number; status: string }[]
}

export function DashboardChart({ orders }: DashboardChartProps) {
  const chartData = useMemo(() => {
    const days: Record<string, number> = {}
    const now = new Date()

    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().substring(0, 10)
      days[key] = 0
    }

    // Fill with order data
    orders.forEach(o => {
      const key = o.created_at.substring(0, 10)
      if (days[key] !== undefined) {
        days[key] += Number(o.total) || 0
      }
    })

    const entries = Object.entries(days)
    const maxVal = Math.max(...Object.values(days), 1)

    return entries.map(([date, value]) => ({
      date,
      value,
      label: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      pct: (value / maxVal) * 100,
    }))
  }, [orders])

  const total = chartData.reduce((a, b) => a + b.value, 0)

  return (
    <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Revenue — Last 14 Days</h3>
          <p className="text-2xl font-display font-semibold text-white mt-1 tabular-nums tracking-tight">
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-32 w-full">
        {chartData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="w-full relative">
              <div
                className="w-full bg-[#B8763C]/30 hover:bg-[#B8763C] hover:shadow-[0_0_12px_rgba(184,118,60,0.6)] rounded-t-sm transition-all duration-300 min-h-[4px]"
                style={{ height: `${Math.max(d.pct, 4)}%` }}
                title={`${d.label}: ₹${d.value.toLocaleString('en-IN')}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-[10px] font-medium text-zinc-500">
        <span>{chartData[0]?.label}</span>
        <span>{chartData[chartData.length - 1]?.label}</span>
      </div>
    </div>
  )
}
