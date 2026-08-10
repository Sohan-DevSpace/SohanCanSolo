'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Check, Languages } from 'lucide-react'

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

const languages = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
]

export default function LanguagePage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2"
        >
          Select Language
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#8C8375] text-[15px]"
        >
          Choose your preferred language for navigating Alpona.
        </motion.p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Banner */}
        <motion.div variants={itemVariants} className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-[24px] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center shrink-0">
            <Languages size={24} className="text-[#B8763C]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-1">Regional Preferences</h3>
            <p className="text-[14px] text-[#8C8375]">
              Your language preference will be saved across all your devices.
            </p>
          </div>
        </motion.div>

        {/* Language Selection */}
        <motion.div variants={itemVariants}>
          <div className="bg-white border border-[#E8E2DB] rounded-[24px] shadow-sm overflow-hidden">
            {languages.map((lang, index) => {
              const isSelected = selectedLanguage === lang.id
              
              return (
                <div 
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.97] ${
                    index !== languages.length - 1 ? 'border-b border-[#F1F3F6]' : ''
                  } ${isSelected ? 'bg-[#FAF7F4]' : 'hover:bg-neutral-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#B8763C] border-transparent' : 'bg-[#FAF7F4] border border-[#E8E2DB]'
                    }`}>
                      <Globe size={18} className={isSelected ? 'text-white' : 'text-[#8C8375]'} />
                    </div>
                    <div>
                      <h4 className={`text-[15px] font-bold ${isSelected ? 'text-[#1A1A1A]' : 'text-[#5C534A]'}`}>
                        {lang.name}
                      </h4>
                      <p className={`text-[13px] ${isSelected ? 'text-[#8C8375]' : 'text-[#A09485]'}`}>
                        {lang.native}
                      </p>
                    </div>
                  </div>
                  
                  {/* Checkmark */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#B8763C] text-white scale-100' : 'bg-transparent scale-0'
                  }`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <button className="w-full sm:w-auto bg-[#1A1A1A] text-white text-[14px] font-bold py-4 px-10 rounded-full shadow-lg shadow-[#1A1A1A]/20 hover:bg-[#2A2A2A] hover:-translate-y-0.5 transition-all active:scale-[0.97]">
            Save Preferences
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
