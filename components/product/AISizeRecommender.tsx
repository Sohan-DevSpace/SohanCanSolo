'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Check, AlertTriangle, ArrowRight, RefreshCw, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AISizeRecommenderProps {
  productName: string
  availableSizes: string[]
  onSelectSize?: (size: string) => void
}

interface SizeResult {
  recommendedSize: string
  confidenceScore: number
  reason: string
  alternativeSize: string
  orderTwoSizesRecommendation: boolean
}

export function AISizeRecommender({ productName, availableSizes, onSelectSize }: AISizeRecommenderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [heightCm, setHeightCm] = useState('175')
  const [weightKg, setWeightKg] = useState('70')
  const [age, setAge] = useState('24')
  const [gender, setGender] = useState('Men')
  const [bodyType, setBodyType] = useState('Average')
  const [fitPreference, setFitPreference] = useState('Oversized')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SizeResult | null>(null)

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/ai/size-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          age: Number(age),
          gender,
          bodyType,
          fitPreference,
          productName,
          availableSizes
        })
      })

      const json = await res.json()
      setLoading(false)

      if (json.success && json.data) {
        setResult(json.data)
      }
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B8763C] hover:text-[#9E5F2A] transition-colors cursor-pointer group"
      >
        <Sparkles size={13} className="text-[#B8763C] group-hover:rotate-12 transition-transform" />
        <span>Find My Size (AI)</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#1A1A1A] select-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8E2DB] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                    <Ruler size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">
                      AI Size Recommendation
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-medium">{productName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {!result ? (
                /* Form Inputs */
                <form onSubmit={handleCalculate} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-500">Height (cm)</label>
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full bg-white border border-[#E8E2DB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B8763C]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-500">Weight (kg)</label>
                      <input
                        type="number"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="w-full bg-white border border-[#E8E2DB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B8763C]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-500">Gender Profile</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-white border border-[#E8E2DB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B8763C] cursor-pointer"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-500">Fit Preference</label>
                      <select
                        value={fitPreference}
                        onChange={(e) => setFitPreference(e.target.value)}
                        className="w-full bg-white border border-[#E8E2DB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B8763C] cursor-pointer"
                      >
                        <option value="Oversized">Streetwear Oversized</option>
                        <option value="Regular">Standard Regular Fit</option>
                        <option value="Slim">Tailored Slim Fit</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-500">Body Profile</label>
                    <div className="flex gap-2">
                      {['Slim', 'Average', 'Athletic', 'Heavy'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBodyType(type)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            bodyType === type
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                              : 'bg-white text-neutral-700 border-[#E8E2DB] hover:border-[#B8763C]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#B8763C] hover:bg-[#9E5F2A] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin mr-2" /> Calculating Fit Prediction...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="mr-2" /> Predict Optimal Size
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* Size Prediction Result Card */
                <div className="space-y-4">
                  <div className="bg-white border border-[#E8E2DB] rounded-2xl p-5 text-center space-y-3 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#B8763C] block">
                      AI Fit Recommendation
                    </span>
                    <div className="text-3xl font-black text-[#1A1A1A]">
                      {result.recommendedSize}
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1 max-w-xs mx-auto pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-neutral-500">
                        <span>Confidence</span>
                        <span>{result.confidenceScore}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B8763C] transition-all duration-500"
                          style={{ width: `${result.confidenceScore}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 font-medium leading-relaxed pt-2">
                      "{result.reason}"
                    </p>
                  </div>

                  {result.orderTwoSizesRecommendation && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-medium">
                      <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                      <span>Borderline fit profile: Consider ordering alternative size <strong>({result.alternativeSize})</strong> for comparison.</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResult(null)}
                      className="flex-1 h-10 rounded-xl text-xs font-bold border-[#E8E2DB]"
                    >
                      Recalculate
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const cleanSize = result.recommendedSize.replace(/Oversized |Slim |Regular /g, '').trim()
                        if (onSelectSize) onSelectSize(cleanSize)
                        setIsOpen(false)
                      }}
                      className="flex-1 h-10 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold hover:bg-[#B8763C] transition-colors"
                    >
                      Select Size ({result.recommendedSize})
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
