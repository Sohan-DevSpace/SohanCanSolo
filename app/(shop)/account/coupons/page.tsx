'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Copy, Check, TicketPercent } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
}

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'shipping'
  value: number
  description?: string
  expiry_date: string
}

export default function CouponsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoupons = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setCoupons(data as Coupon[])
      }
      setLoading(false)
    }
    
    fetchCoupons()
  }, [])

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          My Coupons
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Exclusive offers and promo codes for your next purchase.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Banner */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-[24px] p-6 sm:p-8 flex items-center justify-between overflow-hidden relative shadow-lg shadow-[#1A1A1A]/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(184,118,60,0.3)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-[#B8763C]/20 border border-[#B8763C]/30 flex items-center justify-center shrink-0">
              <TicketPercent size={28} className="text-[#B8763C]" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white mb-1">Earn Alpona Points</h3>
              <p className="text-[14px] text-[#C6B6A5] max-w-sm">
                Write reviews and refer friends to unlock exclusive high-value coupons directly in your account.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Coupons List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-6 w-6 text-[#B8763C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2DB] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FAF7F4] rounded-full flex items-center justify-center mb-4">
              <TicketPercent size={24} className="text-[#8C8375]" />
            </div>
            <p className="text-[15px] font-bold text-[#1A1A1A]">No coupons available yet</p>
            <p className="text-[13px] text-neutral-500 mt-2 max-w-[280px]">Check back later or track your Alpona points to unlock special rewards.</p>
          </div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white border border-[#E8E2DB] rounded-[24px] overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-[#B8763C]/30 transition-all duration-300">
                {/* Top part */}
                <div className="p-6 pb-4 border-b border-dashed border-[#E8E2DB] relative">
                  {/* Left/Right cutouts for ticket effect */}
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#FAF7F4] rounded-full border-t border-r border-[#E8E2DB] rotate-45" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#FAF7F4] rounded-full border-t border-l border-[#E8E2DB] -rotate-45" />
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F4] flex items-center justify-center shrink-0">
                      <Tag size={16} className="text-[#B8763C]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1A1A1A]">
                        {coupon.type === 'percentage' ? `${coupon.value}% Off` : coupon.type === 'fixed' ? `₹${coupon.value} Off` : 'Free Shipping'}
                      </h4>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C8375]">
                        {new Date(coupon.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#5C534A] leading-relaxed">
                    {coupon.description || `Applicable discount for your next order.`}
                  </p>
                </div>

                {/* Bottom part / Code */}
                <div className="p-6 pt-4 bg-[#FAF7F4] flex items-center justify-between">
                  <div className="bg-white border border-[#E8E2DB] px-4 py-2 rounded-xl text-[14px] font-bold tracking-widest text-[#1A1A1A] shadow-sm select-all">
                    {coupon.code}
                  </div>
                <button 
                  onClick={() => handleCopy(coupon.id, coupon.code)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-[0.97] ${
                    copiedId === coupon.id 
                      ? 'bg-[#34A853] text-white shadow-md' 
                      : 'bg-white border border-[#E8E2DB] text-[#8C8375] hover:bg-neutral-50 hover:text-[#1A1A1A]'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {copiedId === coupon.id ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check size={16} strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy size={16} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          ))}
        </motion.div>
        )}

      </motion.div>
    </div>
  )
}
