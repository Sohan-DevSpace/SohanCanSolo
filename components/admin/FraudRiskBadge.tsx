'use client'

import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Shield, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react'

interface FraudRiskBadgeProps {
  orderId: string
  initialRisk?: {
    level: 'Low' | 'Medium' | 'High'
    score: number
    explanation: string
    signals: string[]
  }
  orderData?: any
}

export function FraudRiskBadge({ orderId, initialRisk, orderData }: FraudRiskBadgeProps) {
  const [risk, setRisk] = useState(initialRisk || null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchRisk = async () => {
    if (risk || loading) {
      setExpanded(!expanded)
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'fraud_risk',
          orderId,
          orderData
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setRisk({
          level: data.level,
          score: data.score,
          explanation: data.explanation,
          signals: data.signals || []
        })
        setExpanded(true)
      }
    } catch (err) {
      console.error('[FRAUD RISK BADGE ERROR]:', err)
    } finally {
      setLoading(false)
    }
  }

  // Pre-computed fallback display if not loaded yet
  const level = risk?.level || 'Low'
  const score = risk?.score ?? 10

  const getBadgeStyle = (lvl: 'Low' | 'Medium' | 'High') => {
    switch (lvl) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
    }
  }

  const getIcon = (lvl: 'Low' | 'Medium' | 'High') => {
    switch (lvl) {
      case 'High':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
      case 'Medium':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={fetchRisk}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${getBadgeStyle(level)}`}
        title="Click to view AI Fraud Risk Analysis"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8763C]" />
        ) : (
          getIcon(level)
        )}
        <span>{risk ? `${risk.level} (${risk.score})` : 'AI Risk Analysis'}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded Risk Drawer */}
      {expanded && risk && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#121214] border border-white/[0.08] rounded-xl shadow-2xl p-4 z-50 text-xs text-zinc-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Fraud Risk Score: <span className="text-[#B8763C]">{risk.score}/100</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeStyle(risk.level)}`}>
              {risk.level} Risk
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed mb-3 italic">
            "{risk.explanation}"
          </p>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Heuristic Signals Detected:</p>
            <ul className="space-y-1 text-[11px] text-zinc-400">
              {risk.signals.map((sig, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400">•</span>
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3 pt-2 border-t border-white/[0.06] text-[9px] text-zinc-500 text-right">
            Advisory Signal • Admin Review Recommended
          </div>
        </div>
      )}
    </div>
  )
}
