'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AIInsightsCard() {
  const [insights, setInsights] = useState<string[]>([
    'Weekly revenue shows positive momentum across custom apparel collections.',
    'Hoodie & sweatshirt categories present top cross-sell potential for the coming week.',
    'Consider launching a targeted cart recovery flow to capture weekend visitors.'
  ])
  const [loading, setLoading] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'business_insights' })
      })

      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.insights)) {
        setInsights(data.insights)
        if (data.generatedAt) {
          setGeneratedAt(new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
      }
    } catch (err) {
      console.error('[AI INSIGHTS CARD ERROR]:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#121214]/80 backdrop-blur-md border border-[#B8763C]/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8763C]/10 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#B8763C]/20 border border-[#B8763C]/40 flex items-center justify-center text-[#B8763C]">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI Financial & Business Insights
              <span className="text-[10px] font-semibold bg-[#B8763C]/20 text-amber-300 px-2 py-0.5 rounded border border-[#B8763C]/30">
                Gemini 1.5
              </span>
            </h2>
            <p className="text-xs text-zinc-400">On-Demand Financial Strategy Advisor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {generatedAt && (
            <span className="text-[10px] text-zinc-500 font-mono">
              Updated {generatedAt}
            </span>
          )}
          <Button
            onClick={fetchInsights}
            disabled={loading}
            size="sm"
            className="bg-[#B8763C] hover:bg-[#a66833] text-white text-xs font-semibold rounded-xl px-3 py-1.5 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing Store Data...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* Insights Content */}
      <div className="relative z-10 space-y-2.5">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-[#B8763C]/30 transition-all text-xs text-zinc-200"
          >
            <div className="mt-0.5 w-5 h-5 rounded-md bg-[#B8763C]/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="leading-relaxed text-zinc-300 font-medium">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
