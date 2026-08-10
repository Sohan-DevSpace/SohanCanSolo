'use client'

import { motion } from 'framer-motion'
import { FileText, ChevronDown } from 'lucide-react'

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

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          Terms, Policies and Licenses
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Important legal information about your use of Alpona.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Document List */}
        <motion.div variants={itemVariants}>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] shadow-sm overflow-hidden">
            
            <div className="p-5 border-b border-[#F1F3F6] flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-all duration-200 active:scale-[0.97] group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                  <FileText size={18} className="text-[#5C534A]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors">Terms of Service</h4>
                  <p className="text-[13px] text-[#8C8375]">Last updated: June 2026</p>
                </div>
              </div>
              <ChevronDown size={18} className="text-[#C6B6A5] -rotate-90" />
            </div>

            <div className="p-5 border-b border-[#F1F3F6] flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-all duration-200 active:scale-[0.97] group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                  <FileText size={18} className="text-[#5C534A]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors">Privacy Policy</h4>
                  <p className="text-[13px] text-[#8C8375]">Last updated: June 2026</p>
                </div>
              </div>
              <ChevronDown size={18} className="text-[#C6B6A5] -rotate-90" />
            </div>

            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-all duration-200 active:scale-[0.97] group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                  <FileText size={18} className="text-[#5C534A]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors">Open Source Licenses</h4>
                  <p className="text-[13px] text-[#8C8375]">Credits to our open-source dependencies</p>
                </div>
              </div>
              <ChevronDown size={18} className="text-[#C6B6A5] -rotate-90" />
            </div>

          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
