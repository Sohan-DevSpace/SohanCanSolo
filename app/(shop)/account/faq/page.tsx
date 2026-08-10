'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, ChevronDown, MessageCircle, Mail, Phone, 
  Package, Truck, RefreshCcw, ChevronRight, Bot, MessageSquare,
  Headphones, ArrowRight
} from 'lucide-react'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import Link from 'next/link'
import Image from 'next/image'

// ── ANIMATION VARIANTS ──
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

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  category: string
  items: FAQItem[]
}

import { createClient } from '@/lib/supabase/client'
import { SmartAssistant } from '@/components/help/SmartAssistant'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAssistant, setShowAssistant] = useState(false)
  // openIndex structure: `${categoryIndex}-${itemIndex}`
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<FAQCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFaqs = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('support_faqs')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (!error && data) {
        // Group by category
        const grouped = data.reduce((acc, curr) => {
          const cat = curr.category
          if (!acc[cat]) {
            acc[cat] = { category: cat, items: [] }
          }
          acc[cat].items.push({ question: curr.question, answer: curr.answer })
          return acc
        }, {} as Record<string, FAQCategory>)
        
        setFaqs(Object.values(grouped))
      }
      setLoading(false)
    }
    
    fetchFaqs()
  }, [])

  // Filter FAQs based on search
  const filteredFaqCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqs

    return faqs.map(category => {
      const matchingItems = category.items.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return { ...category, items: matchingItems }
    }).filter(category => category.items.length > 0)
  }, [searchQuery, faqs])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-3xl mx-auto space-y-10 pb-12">
      
      {/* ═══════════════════════════════════════════ */}
      {/* TOP HEADER & REDIRECT TO HELP CENTER BANNER */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <p className="text-[13px] text-[#8C8375] font-medium mb-1">Need assistance?</p>
          <h1 className="text-balance text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Frequently Asked Questions
          </h1>
        </div>

        {/* Redirect Button to Full Help Center */}
        <div className="mt-4">
          <Link
            href="/help"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#1A1A1A] text-white border border-white/10 rounded-2xl hover:bg-[#B8763C] hover:border-[#B8763C] transition-all duration-300 group shadow-md active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-[#B8763C] group-hover:text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Headphones size={22} />
              </div>
              <div>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  Open Help Center & Concierge
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B8763C] text-white group-hover:bg-white group-hover:text-[#1A1A1A] transition-colors">
                    24/7 Live
                  </span>
                </p>
                <p className="text-xs text-neutral-300 group-hover:text-white/90 transition-colors mt-0.5">
                  AI Assistant, Direct Support Form, WhatsApp Live, & Order SLA Tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 group-hover:bg-white group-hover:text-[#1A1A1A] transition-all shrink-0">
              <span>Go to Help Page</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* FAQ SECTION                                 */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="space-y-6 pt-6">
        <h2 className="text-balance text-[18px] font-bold text-[#1A1A1A]">Frequently Asked Questions!</h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-[#A09485]" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setOpenIndex(null)
            }}
            placeholder="Search FAQ's" 
            className="w-full bg-white border border-[#E8E2DB] rounded-xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B8763C]/20 focus:border-[#B8763C] transition-all shadow-sm"
          />
        </div>

        <div className="space-y-8 mt-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-6 w-6 text-[#B8763C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredFaqCategories.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#E8E2DB]">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F4] flex items-center justify-center mb-3 text-[#A09485]">
                <Search size={20} />
              </div>
              <p className="text-[14px] font-bold text-[#1A1A1A]">No FAQs found</p>
              <p className="text-[13px] text-[#8C8375] mt-1">Try adjusting your search</p>
            </div>
          ) : (
            filteredFaqCategories.map((category, catIdx) => (
              <div key={catIdx} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-[#B8763C] rounded-full" />
                  <h3 className="text-[15px] font-bold text-[#1A1A1A]">{category.category}</h3>
                </div>

                {/* Accordion Items */}
                <div className="bg-white border border-[#E8E2DB]/60 rounded-[20px] overflow-hidden shadow-sm">
                  {category.items.map((item, itemIdx) => {
                    const currentIndex = `${catIdx}-${itemIdx}`
                    const isOpen = openIndex === currentIndex

                    return (
                      <div key={itemIdx} className="border-b border-[#F1F3F6] last:border-b-0">
                        <button 
                          onClick={() => setOpenIndex(isOpen ? null : currentIndex)}
                          className="w-full text-left p-5 flex items-center justify-between hover:bg-[#FAF7F4]/50 transition-all duration-200 active:scale-[0.97] group"
                        >
                          <span className={`text-[14px] font-medium pr-4 transition-colors ${isOpen ? 'text-[#B8763C]' : 'text-[#4A4A4A]'}`}>
                            {item.question}
                          </span>
                          <ChevronDown 
                            size={16} 
                            className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#B8763C]' : 'text-[#A09485] group-hover:text-[#B8763C]'}`} 
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-1 text-[13px] leading-relaxed text-[#6B6259]">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* MY ORDERS BUTTON                            */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="pt-8">
        <Link 
          href="/account/orders"
          className="flex items-center justify-center w-full py-3.5 bg-[#FAF7F4] hover:bg-[#F0ECE7] border border-[#E8E2DB] rounded-xl text-[14px] font-bold text-[#1A1A1A] transition-all duration-200 active:scale-[0.97]"
        >
          Go to My Orders
        </Link>
      </motion.div>


    </motion.div>
  )
}
