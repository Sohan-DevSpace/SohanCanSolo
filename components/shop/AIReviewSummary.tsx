'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Check, AlertCircle, Star, ThumbsUp, RefreshCw } from 'lucide-react'

interface ReviewSummaryData {
  overallSummary: string
  pros: string[]
  cons: string[]
  qualityScore: number
  fitScore: number
  comfortScore: number
  printScore: number
  sentimentPercentage: number
}

interface AIReviewSummaryProps {
  productName: string
  reviews: any[]
}

export function AIReviewSummary({ productName, reviews }: AIReviewSummaryProps) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ReviewSummaryData | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/ai/review-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName, reviews })
        })
        const json = await res.json()
        setLoading(false)
        if (json.success && json.data) {
          setSummary(json.data)
        }
      } catch (err) {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [productName, reviews])

  if (loading) {
    return (
      <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 space-y-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#B8763C]/30" />
          <div className="h-4 bg-[#E8E2DB] rounded w-48" />
        </div>
        <div className="h-12 bg-[#E8E2DB]/60 rounded-xl" />
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="bg-white border border-[#E8E2DB] rounded-3xl p-6 space-y-5 shadow-xs font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2DB] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs">
            <Sparkles size={16} className="text-[#B8763C] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
              AI Customer Insights & Review Summary
            </h3>
            <p className="text-[10px] text-neutral-500 font-medium">Synthesized from customer feedback</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF7F4] border border-[#E8E2DB] px-3 py-1.5 rounded-xl shrink-0">
          <ThumbsUp size={13} className="text-[#B8763C]" />
          <span className="text-xs font-black text-[#1A1A1A]">{summary.sentimentPercentage}% Positive Feedback</span>
        </div>
      </div>

      {/* Summary Narrative */}
      <p className="text-xs text-neutral-700 font-medium leading-relaxed bg-[#FAF7F4] p-4 rounded-2xl border border-[#E8E2DB]/80 italic">
        "{summary.overallSummary}"
      </p>

      {/* Grid: Pros, Cons, Metric Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
        {/* Pros */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
            What Customers Love
          </span>
          <div className="space-y-1.5">
            {summary.pros.map((pro, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium text-neutral-800 bg-emerald-500/5 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span>{pro}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cons / Feedback */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
            Notes & Feedback
          </span>
          <div className="space-y-1.5">
            {summary.cons.length > 0 ? (
              summary.cons.map((con, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-neutral-800 bg-amber-500/5 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
                  <AlertCircle size={13} className="text-amber-600 shrink-0" />
                  <span>{con}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic py-2">No negative complaints recorded.</p>
            )}
          </div>
        </div>

        {/* Breakdown Scores */}
        <div className="space-y-2 bg-[#FAF7F4] p-3.5 rounded-2xl border border-[#E8E2DB]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B8763C] block mb-2">
            Quality Ratings
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">Fabric Quality</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{summary.qualityScore}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">DTG Print Precision</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{summary.printScore}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">Garment Comfort</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{summary.comfortScore}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">Fit Accuracy</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{summary.fitScore}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
