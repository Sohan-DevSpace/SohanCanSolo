'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function GiftCardsPage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-16 md:pt-24 pb-12 md:pb-16 px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Perfect Gift
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Alpona Gift Cards
        </h1>
        <p className="text-[#666666] text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
          Give the gift of choice. Our gift cards never expire and can be used on any custom or curated product in our store.
        </p>
      </div>

      <div className="container mx-auto px-5 lg:px-16 max-w-[1000px]">
        <div className="bg-white border border-[#E8E2DB] rounded-3xl p-10 md:p-16 text-center shadow-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm mx-auto aspect-[1.6/1] bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-2xl p-6 relative overflow-hidden shadow-2xl mb-10"
          >
            {/* Gift Card Design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#B8763C]/20 rounded-full -ml-8 -mb-8 blur-lg"></div>
            
            <div className="relative h-full flex flex-col justify-between text-left">
              <div className="flex justify-between items-start">
                <span className="text-white font-display font-bold text-xl tracking-wider">ALPONA</span>
                <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Gift Card</span>
              </div>
              <div className="space-y-1">
                <div className="text-white/30 text-xs tracking-[0.2em] font-mono">XXXX XXXX XXXX XXXX</div>
                <div className="text-white font-bold text-2xl font-display">₹1,000 - ₹10,000</div>
              </div>
            </div>
          </motion.div>
          
          <h2 className="text-balance text-2xl font-bold font-serif mb-4">Coming Soon</h2>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            We are currently putting the finishing touches on our digital gift card experience. Check back soon!
          </p>
          
          <Link href="/shop" className="inline-flex items-center justify-center bg-[#B8763C] text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#A85A1E] transition-colors cursor-pointer active:scale-[0.97]">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
