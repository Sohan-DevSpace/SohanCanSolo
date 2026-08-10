'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'

const easePremium: [number, number, number, number] = [0.32, 0.72, 0, 1]

export default function TrackForm({ 
  initialOrder = '', 
  recentOrders = [] 
}: { 
  initialOrder?: string, 
  recentOrders: { order_number: string, created_at: string }[] 
}) {
  const router = useRouter()
  const [orderInput, setOrderInput] = useState(initialOrder)
  const [isSearching, setIsSearching] = useState(false)

  // Reset loading state if initialOrder prop changes (nav finished)
  useEffect(() => {
    setIsSearching(false)
    setOrderInput(initialOrder)
  }, [initialOrder])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderInput.trim()) return
    setIsSearching(true)
    router.push(`/order/track?order=${orderInput.trim()}`)
  }

  const handleSelectOrder = (orderNum: string) => {
    setOrderInput(orderNum)
    setIsSearching(true)
    router.push(`/order/track?order=${orderNum}`)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easePremium }}
      className="relative z-10"
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 -z-10" />
      
      <div className="p-6 md:p-10 flex flex-col gap-6 relative z-10">
        <form onSubmit={handleTrack} className="w-full space-y-2.5">
          <label htmlFor="orderNum" className="text-xs font-bold text-[#8A8580] uppercase tracking-wider ml-1">
            Order Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              id="orderNum"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder="e.g. ORD-20260606-00001"
              className="bg-white/80 backdrop-blur-sm border-[#E8E2DB] shadow-sm text-[#1A1A1A] h-14 md:text-base rounded-xl px-5 focus-visible:ring-[#B8763C]/20 flex-1 min-w-0"
            />
            <Button 
              type="submit" 
              disabled={isSearching}
              className="bg-[#1A1A1A] hover:bg-[#B8763C] text-white font-bold h-14 px-8 rounded-xl flex items-center justify-center transition-all duration-500 shadow-[0_4px_14px_rgba(26,26,26,0.2)] hover:shadow-[0_6px_20px_rgba(184,118,60,0.3)] hover:-translate-y-1 active:translate-y-0 text-sm tracking-wide shrink-0"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Track</>}
            </Button>
          </div>
        </form>

        {recentOrders.length > 0 && (
          <div className="w-full space-y-3 pt-2 border-t border-[#E8E2DB]/50">
            <label className="text-xs font-bold text-[#8A8580] uppercase tracking-wider ml-1">
              Select Recent Order
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5 -mx-1 px-1">
              {recentOrders.map(ro => (
                <button
                  key={ro.order_number}
                  type="button"
                  onClick={() => handleSelectOrder(ro.order_number)}
                  disabled={isSearching}
                  className={`shrink-0 h-10 px-4 rounded-xl border font-mono text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    orderInput === ro.order_number
                      ? 'bg-[#B8763C] border-[#B8763C] text-white shadow-[0_4px_10px_rgba(184,118,60,0.25)]'
                      : 'bg-white/80 border-[#E8E2DB] text-[#1A1A1A] hover:border-[#B8763C] hover:text-[#B8763C] hover:bg-[#B8763C]/5'
                  }`}
                >
                  {ro.order_number}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
