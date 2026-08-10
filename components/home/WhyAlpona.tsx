'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Feather, Leaf, Heart, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PILLARS = [
  {
    icon: Feather,
    title: '240 GSM Heavyweight Cotton',
    description: 'Ultra-soft, ultra-durable combed cotton crafted for unmatched structure, drape, and long-lasting luxury feel.',
  },
  {
    icon: Sparkles,
    title: 'Bio-Washed & Pre-Shrunk',
    description: 'Zero shrinkage after washing. Silky smooth finish with vibrant color fastness guaranteed for 50+ washes.',
  },
  {
    icon: Award,
    title: 'Eco-Friendly DTG Printing',
    description: 'High-definition digital textile inks that fuse directly into fabric fibers with zero cracking or peeling.',
  },
  {
    icon: Heart,
    title: 'Artist-Driven Heritage',
    description: 'Every design honors authentic Bengali calligraphy and contemporary Indian graphic subcultures.',
  },
  {
    icon: Leaf,
    title: 'Zero-Waste Print-on-Demand',
    description: 'Ethical, sustainable production. Every garment is printed to order in India to eliminate fashion landfill waste.',
  },
  {
    icon: ShieldCheck,
    title: '7-Day Easy Replacement',
    description: 'Hassle-free size exchanges and easy replacements. 100% customer satisfaction backed by instant support.',
  },
]

export function WhyAlpona() {
  return (
    <section className="py-16 md:py-24 bg-[#FAF7F4] border-y border-[#E8E2DB] relative overflow-hidden select-none">
      {/* Decorative ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#B8763C]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Alpona Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1A1A1A] tracking-tight">
            Why Choose <span className="italic font-serif text-[#B8763C]">Alpona</span> Over Amazon?
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            We don’t produce mass-market polyester tees. We build heavyweight, artisanal streetwear celebrating Indian typography, artist craftsmanship, and sustainable ethics.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-[#E8E2DB] shadow-sm hover:shadow-md hover:border-[#B8763C]/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F4] border border-[#E8E2DB] group-hover:bg-[#B8763C] group-hover:border-[#B8763C] flex items-center justify-center text-[#B8763C] group-hover:text-white transition-all duration-300 mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-[#B8763C] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Footer Row */}
        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#1A1A1A] hover:bg-[#B8763C] text-white text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            <span>Explore Heavyweight Apparel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
