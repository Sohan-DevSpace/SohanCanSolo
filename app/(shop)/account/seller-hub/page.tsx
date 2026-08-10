'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, TrendingUp, Users, ShieldCheck } from 'lucide-react'

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

export default function SellerHubPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="bg-[#1A1A1A] rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] aspect-square bg-gradient-to-b from-[#B8763C]/20 to-transparent blur-3xl rounded-full opacity-50 pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-[#B8763C] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B8763C]/30 relative z-10">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-balance text-3xl md:text-4xl font-serif font-bold text-white mb-4 relative z-10">Become an Alpona Creator</h1>
          <p className="text-[#A09485] text-[16px] max-w-lg mx-auto mb-8 relative z-10">
            Turn your designs and crafts into a thriving business. Join India's premium marketplace for independent creators.
          </p>
          <button className="bg-[#B8763C] text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-[#B8763C]/30 hover:bg-[#A66935] hover:-translate-y-0.5 transition-all text-[15px] flex items-center gap-2 mx-auto relative z-10 active:scale-[0.97]">
            Apply Now <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mb-4">
              <Users size={18} className="text-[#B8763C]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">Massive Audience</h3>
            <p className="text-[13px] text-[#8C8375]">Reach millions of premium shoppers looking for unique, high-quality products.</p>
          </div>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mb-4">
              <TrendingUp size={18} className="text-[#B8763C]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">High Margins</h3>
            <p className="text-[13px] text-[#8C8375]">Enjoy industry-low commission rates, meaning you keep more of what you earn.</p>
          </div>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mb-4">
              <ShieldCheck size={18} className="text-[#B8763C]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">Seller Protection</h3>
            <p className="text-[13px] text-[#8C8375]">Robust fraud protection and dedicated support to handle logistics seamlessly.</p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
