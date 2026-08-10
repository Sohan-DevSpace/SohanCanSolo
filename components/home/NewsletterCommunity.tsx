'use client'

import { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { IconMail } from '@/components/shared/PremiumIcons'
import { motion, AnimatePresence } from 'framer-motion'

export function NewsletterCommunity() {
  const sectionRef = useReveal()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubscribed(true)
    setIsSubmitting(false)
    setTimeout(() => {
      setSubscribed(false)
      setEmail('')
    }, 4000)
  }

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal bg-[#FAF7F4] py-20 lg:py-28 overflow-hidden select-none relative border-t border-black/5"
    >
      {/* Ambient background glowing lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#C87533]/20 via-[#B8763C]/10 to-transparent blur-3xl pointer-events-none rounded-full opacity-70" />

      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto relative z-10">
        {/* Double-Bezel Outer Frame */}
        <div className="max-w-5xl mx-auto rounded-[3rem] p-2 sm:p-2.5 bg-gradient-to-b from-[#3D342E]/10 via-[#2A2420]/20 to-[#1A1817]/40 shadow-[0_32px_80px_-20px_rgba(200,117,51,0.22),_0_16px_40px_-10px_rgba(0,0,0,0.12)] border border-black/10 backdrop-blur-2xl transition-all duration-700 hover:shadow-[0_40px_90px_-15px_rgba(200,117,51,0.28)]">
          
          {/* Inner Core Card */}
          <div className="rounded-[calc(3rem-0.625rem)] bg-gradient-to-br from-[#1E1C1A] via-[#161413] to-[#0E0D0C] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            
            {/* Shimmer / Glow highlights inside card */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-bl from-[#D4A574]/25 via-[#B8763C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-[#C87533]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Left Content Column */}
            <div className="text-left max-w-xl relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] bg-[#C87533]/20 text-[#E8A36E] border border-[#C87533]/30 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#C87533] animate-pulse" />
                Join The Club
              </span>
              
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white leading-[1.15] tracking-tight">
                Join the Alpona <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#F5D0A9] via-[#E8A36E] to-[#C87533]">Community.</span>
              </h3>
              
              <p className="font-body text-sm sm:text-base text-[#B3ABA3] mt-3.5 leading-relaxed">
                Get early access to exclusive drops, private offers, and design inspiration straight to your inbox.
              </p>
            </div>

            {/* Right Form Column */}
            <div className="w-full lg:w-[420px] shrink-0 relative z-10">
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3.5">
                {/* Double-Bezel Input Container */}
                <div className="relative flex items-center bg-white/10 hover:bg-white/[0.14] border border-white/20 focus-within:border-[#C87533] focus-within:ring-4 focus-within:ring-[#C87533]/25 rounded-full p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5),_0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-300">
                  <div className="pl-4 text-[#E8A36E] shrink-0">
                    <IconMail size={18} color="currentColor" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter"
                    required
                    className="w-full bg-transparent px-3 py-2.5 outline-none font-body text-sm text-white placeholder-[#8C847C] min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#D9823B] to-[#B86526] hover:from-[#E88F47] hover:to-[#C87333] text-white pl-6 pr-2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_8px_25px_rgba(200,117,51,0.45)] transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] disabled:opacity-50 cursor-pointer flex items-center gap-2.5 group shrink-0 min-h-[44px]"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Subscribe'}</span>
                    <span className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 pt-0.5 font-body text-xs text-[#9C948C]">
                  <span className="flex items-center gap-1.5">
                    <span>🔒</span> No spam. Unsubscribe anytime.
                  </span>
                  <span className="flex items-center gap-1 text-[#E8A36E]">
                    <span>★</span> 10% off 1st order
                  </span>
                </div>
              </form>

              {/* Success Feedback */}
              <AnimatePresence>
                {subscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        d="M20 6L9 17l-5-5" 
                      />
                    </svg>
                    You&apos;re on the VIP list! Welcome to Alpona.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
