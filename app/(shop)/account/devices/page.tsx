'use client'

import { motion } from 'framer-motion'
import { Smartphone, Monitor, ShieldCheck, History } from 'lucide-react'

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

export default function ManageDevicesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          Manage Devices
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Review the devices currently signed into your Alpona account.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Security Alert / Banner */}
        <motion.div variants={itemVariants} className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-[24px] p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-[#B8763C]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-1">Your Account is Secure</h3>
            <p className="text-[14px] text-[#8C8375] leading-relaxed">
              We monitor login activity to ensure your account's safety. If you don't recognize a device, sign out immediately and change your password.
            </p>
          </div>
        </motion.div>

        {/* Current Session */}
        <motion.div variants={itemVariants}>
          <h2 className="text-balance text-[12px] font-bold uppercase tracking-widest text-[#8C8375] mb-4 ml-2">Current Session</h2>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                  <Monitor size={20} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A]">Windows PC • Chrome</h4>
                  <p className="text-[13px] text-[#8C8375]">Mumbai, India • Active Now</p>
                </div>
              </div>
              <span className="bg-[#B8763C]/10 text-[#B8763C] text-[11px] font-bold px-3 py-1 rounded-full border border-[#B8763C]/20">
                This Device
              </span>
            </div>
            <div className="pt-4 border-t border-[#F1F3F6] flex items-center gap-2 text-[13px] text-[#8C8375]">
              <History size={14} />
              <span>Signed in today at 10:45 AM</span>
            </div>
          </div>
        </motion.div>

        {/* Other Devices */}
        <motion.div variants={itemVariants}>
          <h2 className="text-balance text-[12px] font-bold uppercase tracking-widest text-[#8C8375] mb-4 ml-2">Other Devices</h2>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] shadow-sm overflow-hidden">
            
            {/* Device 1 */}
            <div className="p-6 border-b border-[#F1F3F6] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                  <Smartphone size={20} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A]">iPhone 15 Pro • Safari</h4>
                  <p className="text-[13px] text-[#8C8375]">Delhi, India • Last active 2 days ago</p>
                </div>
              </div>
              <button className="text-[13px] font-bold text-[#D84B4B] opacity-0 group-hover:opacity-100 transition-opacity active:scale-[0.97]">
                Sign Out
              </button>
            </div>

            {/* Device 2 */}
            <div className="p-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center">
                  <Monitor size={20} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A]">MacBook Pro • Safari</h4>
                  <p className="text-[13px] text-[#8C8375]">Mumbai, India • Last active last week</p>
                </div>
              </div>
              <button className="text-[13px] font-bold text-[#D84B4B] opacity-0 group-hover:opacity-100 transition-opacity active:scale-[0.97]">
                Sign Out
              </button>
            </div>

          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <button className="w-full sm:w-auto bg-white border border-[#E8E2DB] text-[#D84B4B] text-[14px] font-bold py-4 px-8 rounded-full hover:bg-[#FFF0F0] hover:border-[#D84B4B]/30 transition-all active:scale-[0.97]">
            Sign Out of All Other Devices
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
