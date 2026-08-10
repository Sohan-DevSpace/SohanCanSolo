'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Download, Trash2, ArrowRight } from 'lucide-react'

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

export default function PrivacyCenterPage() {
  return (
    <div className="reveal max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          Privacy Center
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Manage your data and privacy settings.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Banner */}
        <motion.div variants={itemVariants} className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center shrink-0">
              <ShieldCheck size={24} className="text-[#B8763C]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-1">Your Privacy Matters</h3>
              <p className="text-[14px] text-[#8C8375] max-w-md">
                We are committed to protecting your personal data. Alpona does not sell your data to third parties.
              </p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-[#1A1A1A] bg-white border border-[#E8E2DB] px-5 py-2.5 rounded-full hover:bg-neutral-50 transition-all duration-200 active:scale-[0.97] whitespace-nowrap">
            Read Privacy Policy
          </button>
        </motion.div>

        {/* Data Export */}
        <motion.div variants={itemVariants}>
          <h2 className="text-balance text-[12px] font-bold uppercase tracking-widest text-[#8C8375] mb-4 ml-2">Data Management</h2>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-[#F1F3F6] group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                    <Download size={18} className="text-[#1A1A1A]" />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A]">Request Data Export</h4>
                </div>
                <button className="flex items-center gap-2 text-[13px] font-bold text-[#B8763C] opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity active:scale-[0.97]">
                  Request <ArrowRight size={14} />
                </button>
              </div>
              <p className="text-[13px] text-[#8C8375] pl-13">
                Download a copy of your personal data, including order history and saved addresses.
              </p>
            </div>

            <div className="p-6 group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF0F0] border border-[#FEE2E2] flex items-center justify-center">
                    <Trash2 size={18} className="text-[#D84B4B]" />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#D84B4B]">Delete Account</h4>
                </div>
                <button className="flex items-center gap-2 text-[13px] font-bold text-[#D84B4B] opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity active:scale-[0.97]">
                  Delete <ArrowRight size={14} />
                </button>
              </div>
              <p className="text-[13px] text-[#8C8375] pl-13">
                Permanently delete your Alpona account and all associated data. This action cannot be undone.
              </p>
            </div>

          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
