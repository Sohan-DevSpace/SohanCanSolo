'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Sparkles,
  Feather,
  Leaf,
  Heart,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Layers,
  Palette,
  Printer
} from 'lucide-react'
import Link from 'next/link'

const COMPARISONS = [
  {
    feature: 'Apparel Fabric & Weight',
    generic: '140–160 GSM Synthetic Polyester blend',
    alpona: '240 GSM Heavyweight 100% Combed Cotton',
    icon: Feather,
  },
  {
    feature: 'Print Quality & Longevity',
    generic: 'Cheap vinyl stickers that crack & peel',
    alpona: 'Bio-Washed HD DTG Inks (50+ wash guarantee)',
    icon: Printer,
  },
  {
    feature: 'Design & Artwork',
    generic: 'Overused stock clipart & template designs',
    alpona: 'Authentic Bengali Calligraphy & Original Pop Art',
    icon: Palette,
  },
  {
    feature: 'Customization Freedom',
    generic: 'Rigid catalog, zero personal customization',
    alpona: 'Real-Time Merch Studio (Front, Back & Pocket placement)',
    icon: Layers,
  },
  {
    feature: 'Environmental Impact',
    generic: 'Mass overproduction & landfill fashion waste',
    alpona: 'Zero-Waste Print-on-Demand (Made in India)',
    icon: Leaf,
  },
  {
    feature: 'Customer Guarantee',
    generic: 'No returns or difficult 14-day delays',
    alpona: '7-Day Hassle-Free Exchange & Dedicated Support',
    icon: ShieldCheck,
  },
]

export function WhyAlpona() {
  return (
    <section className="py-16 md:py-24 bg-[#FAF7F4] border-y border-[#E8E2DB] relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#B8763C]/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Alpona Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1A1A1A] tracking-tight leading-[1.15]">
            Why Choose <span className="italic font-serif text-[#B8763C]">Alpona</span> Over Generic Marketplaces & POD Brands?
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-4 leading-relaxed max-w-2xl mx-auto">
            We don’t sell mass-produced synthetic clothing. We engineer heavyweight, artisanal streetwear celebrating Indian typography, artist craftsmanship, and sustainable ethics.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {COMPARISONS.map((comp, idx) => {
            const Icon = comp.icon
            return (
              <motion.div
                key={comp.feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E2DB] shadow-sm hover:shadow-xl hover:border-[#B8763C]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F4] border border-[#E8E2DB] group-hover:bg-[#B8763C] group-hover:border-[#B8763C] flex items-center justify-center text-[#B8763C] group-hover:text-white transition-all duration-300 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-[#B8763C] bg-[#B8763C]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Standard
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 mb-4 group-hover:text-[#B8763C] transition-colors">
                    {comp.feature}
                  </h3>

                  {/* Alpona Advantage */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F4] border border-[#E8E2DB] space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Alpona Craftsmanship</span>
                    </div>
                    <p className="text-xs text-stone-700 font-semibold pl-5">
                      {comp.alpona}
                    </p>
                  </div>

                  {/* Generic Competitor Disadvantage */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Generic Marketplaces</span>
                    </div>
                    <p className="text-[11px] text-stone-500 pl-5">
                      {comp.generic}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Footer Row */}
        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#1A1A1A] hover:bg-[#B8763C] text-white text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 group"
          >
            <span>Explore Heavyweight Apparel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  )
}
