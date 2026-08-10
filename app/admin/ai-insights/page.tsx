'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, Package, RefreshCw, Download, ArrowUpRight, BarChart3, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ForecastData {
  bestSellers: string[]
  lowStockRiskItems: { name: string; currentStock: number; recommendedRestock: number; urgency: string }[]
  trendingColors: string[]
  demandForecast: string
  projectedRevenue: string
  inventoryHealthScore: number
}

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ForecastData | null>(null)

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/inventory-forecast', { method: 'POST' })
      const json = await res.json()
      setLoading(false)
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [])

  return (
    <div className="space-y-8 py-4 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#B8763C] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#B8763C]">AI Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">AI Inventory & Trend Forecasting</h1>
          <p className="text-zinc-400 text-xs mt-1">Predictive supply chain analytics, restock risk alerts, and demand projections.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchForecast}
            variant="outline"
            disabled={loading}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold h-10 px-4 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Forecast
          </Button>
          <Button
            onClick={() => {
              if (!data) return
              const headers = ['Type', 'Item Name', 'Details']
              const rows = [
                ...data.bestSellers.map(b => ['Best Seller', `"${b}"`, 'High Demand']),
                ...data.lowStockRiskItems.map(l => ['Low Stock Risk', `"${l.name}"`, `Current: ${l.currentStock}, Restock: ${l.recommendedRestock}`])
              ]
              const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `ai_forecast_${Date.now()}.csv`; a.click()
            }}
            className="bg-[#B8763C] hover:bg-[#a66833] text-white text-xs font-bold h-10 px-4 rounded-xl cursor-pointer shadow-lg shadow-[#B8763C]/20"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3 bg-[#121214] border border-zinc-800/80 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-[#B8763C] animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-medium">Running AI predictive demand algorithm...</p>
        </div>
      ) : data ? (
        <>
          {/* Key Metric Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
                <span>Inventory Health Score</span>
                <BarChart3 className="w-4 h-4 text-[#B8763C]" />
              </div>
              <div className="text-3xl font-black text-white">{data.inventoryHealthScore}/100</div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Optimal stock ratio maintained
              </p>
            </div>

            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
                <span>Projected 30-Day Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{data.projectedRevenue}</div>
              <p className="text-[11px] text-zinc-400 font-medium">Based on order trajectory & seasonality</p>
            </div>

            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
                <span>Low Stock Alerts</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">{data.lowStockRiskItems.length} Items</div>
              <p className="text-[11px] text-amber-400 font-medium">Requires restock batch order</p>
            </div>
          </div>

          {/* Forecast Summary Narrative */}
          <div className="bg-gradient-to-r from-[#B8763C]/10 via-amber-500/10 to-transparent border border-[#B8763C]/30 rounded-2xl p-6 text-xs text-zinc-200 font-medium leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#B8763C] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-1">AI Demand Forecast Summary</span>
              {data.demandForecast}
            </div>
          </div>

          {/* Grid: Restock Alerts & Trending Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Restock Alerts Table */}
            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Risk & Restock Recommendations
              </h2>

              <div className="space-y-3">
                {data.lowStockRiskItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-[#09090b] border border-zinc-800/60 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Current Stock: <strong className="text-amber-400">{item.currentStock} units</strong></p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        + Restock {item.recommendedRestock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Sellers & Trending Colors */}
            <div className="space-y-6">
              
              {/* Best Sellers */}
              <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                  <Package className="w-4 h-4 text-[#B8763C]" /> Predicted Best Sellers
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.bestSellers.map((bs, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200">
                      🔥 {bs}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trending Colors */}
              <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800/60 pb-3">
                  Trending Color Demand
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.trendingColors.map((col, i) => (
                    <span key={i} className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300">
                      🎨 {col}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </>
      ) : null}
    </div>
  )
}
