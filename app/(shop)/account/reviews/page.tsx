'use client'

import { motion } from 'framer-motion'
import { Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'

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

export default function MyReviewsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          My Reviews
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Your feedback helps other shoppers make better decisions.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Empty State / No Reviews Yet */}
        <motion.div variants={itemVariants} className="bg-white border border-[#E8E2DB] rounded-[32px] p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={32} className="text-[#C6B6A5]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">No Reviews Yet</h3>
          <p className="text-[15px] text-[#8C8375] mb-8 max-w-sm mx-auto">
            You haven't reviewed any products yet. Review your recent purchases to earn Alpona points!
          </p>
          <button className="bg-[#1A1A1A] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#1A1A1A]/20 hover:bg-[#2A2A2A] hover:-translate-y-0.5 transition-all text-[15px] active:scale-[0.97]">
            Review Recent Purchases
          </button>
        </motion.div>

        {/* Mocked Example of a Review 
        <motion.div variants={itemVariants} className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-[#FAF7F4] rounded-[12px] border border-[#E8E2DB] overflow-hidden shrink-0">
              <Image src="/mock-product.jpg" alt="Product" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1">Classic Linen Kurta</h4>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#B8763C] text-[#B8763C]" />
                ))}
              </div>
              <p className="text-[14px] text-[#5C534A]">
                Absolutely love the fabric quality. The fit is perfect and it feels incredibly premium. Highly recommend!
              </p>
            </div>
          </div>
        </motion.div>
        */}

      </motion.div>
    </div>
  )
}
