'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '@/hooks/useReveal'
import Link from 'next/link'
import { IconArrowRight } from '@/components/shared/PremiumIcons'

const FAQS = [
  {
    question: "Will the artwork print fade or crack after washing?",
    answer: "No. We use state-of-the-art Japanese DTG (Direct-to-Garment) printing technology with bio-based pigment inks that fuse directly into the cotton fibers. All prints are lab-tested for 50+ machine washes with zero fading, peeling, or cracking."
  },
  {
    question: "What is your return & size exchange policy?",
    answer: "We offer a 7-day hassle-free return and size exchange policy for all standard apparel items in original unworn condition. Custom workbench creations with personalized prints are backed by full replacement if there's any print or garment defect."
  },
  {
    question: "How long does printing & delivery take?",
    answer: "Every garment is printed on demand to eliminate waste. Production takes 24–48 hours, followed by 3–5 business days express delivery across India with live step-by-step SMS tracking."
  },
  {
    question: "Is Cash on Delivery (COD) supported?",
    answer: "Yes! Cash on Delivery is available nationwide alongside Instant Razorpay checkout via UPI, NetBanking, and major credit/debit cards across 19,000+ PIN codes."
  },
  {
    question: "What fabrics and weight do you use?",
    answer: "We print exclusively on 100% combed organic cotton (240 GSM to 300 GSM heavyweight) featuring pre-shrunk bio-washed finish for supreme comfort and structured streetwear silhouette."
  }
]

export function FAQPreview() {
  const sectionRef = useReveal()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-16 lg:py-24 bg-[#FAF7F4] overflow-hidden select-none border-b border-[#E8E2DB]/50"
    >
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* Left Sticky / Intro Header */}
          <div className="lg:w-1/3 lg:sticky lg:top-32">
            <span className="inline-block font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8763C] mb-3 bg-[#B8763C]/10 border border-[#B8763C]/20 px-3.5 py-1 rounded-full">
              Got Questions?
            </span>
            
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#1A1A1A] tracking-tight leading-[1.1] mb-5">
              Everything You Need to <span className="italic font-serif font-normal text-[#B8763C]">Know.</span>
            </h2>
            
            <p className="font-body text-sm md:text-base text-[#6B6560] mb-8 leading-relaxed max-w-sm">
              Clear answers on sizing, print quality, shipping times, and how to start selling your own designs.
            </p>
            
            <Link
              href="/faq"
              className="inline-flex items-center gap-2.5 bg-[#1A1A1A] hover:bg-[#C87533] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 group min-h-[48px]"
            >
              <span>Read Full FAQ Center</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <IconArrowRight size={12} color="white" />
              </span>
            </Link>
          </div>

          {/* Right Accordion List */}
          <div className="lg:w-2/3 w-full">
            <div className="flex flex-col gap-4">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-white border-[#C87533]/40 shadow-[0_12px_32px_rgba(200,117,51,0.08)] ring-1 ring-[#C87533]/20'
                        : 'bg-white/80 hover:bg-white border-[#E8E2DB] shadow-sm hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left cursor-pointer focus:outline-none"
                    >
                      <span className="font-display text-lg sm:text-xl font-bold text-[#1A1A1A] pr-6 leading-snug">
                        {faq.question}
                      </span>

                      <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-400 ${
                        isOpen 
                          ? 'bg-[#C87533] border-[#C87533] text-white rotate-180' 
                          : 'bg-[#FAF7F4] border-[#E8E2DB] text-[#1A1A1A]'
                      }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-6 pb-6 pt-1 font-body text-sm text-[#5C5650] leading-relaxed border-t border-[#E8E2DB]/60">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
