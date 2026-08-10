'use client'

import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

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

export default function QAPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          Questions & Answers
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Questions you've asked about products and their answers from our sellers.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Empty State */}
        <motion.div variants={itemVariants} className="bg-white border border-[#E8E2DB] rounded-[32px] p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} className="text-[#C6B6A5]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">No Questions Asked Yet</h3>
          <p className="text-[15px] text-[#8C8375] mb-8 max-w-sm mx-auto">
            If you're unsure about a product's details, you can ask a question directly on the product page.
          </p>
          <button className="bg-[#1A1A1A] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#1A1A1A]/20 hover:bg-[#2A2A2A] hover:-translate-y-0.5 transition-all text-[15px] active:scale-[0.97]">
            Explore Products
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
