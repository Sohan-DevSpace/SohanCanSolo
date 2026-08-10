'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const swatchColors = ['#1A1A1A', '#FAF7F4', '#B8763C', '#2E3F41']

export function CreateYourOwnBanner() {
  const [activeColor, setActiveColor] = useState('#FAF7F4')

  return (
    <section className="py-16 lg:py-24 bg-[#FAF7F4] select-none border-b border-black/5 relative overflow-hidden">
      {/* Soft lighting environment */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-80 pointer-events-none" />
      
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto relative z-10">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.1 }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          
          {/* ── CARD 1: DESIGN STUDIO ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 24 } }
            }}
            className="group relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col justify-between p-8 sm:p-10 min-h-[440px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
          >
            {/* Subtle glow behind text */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 group-hover:opacity-100 opacity-50 pointer-events-none" />
            
            <div className="relative z-10">
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8763C]">
                Design Studio
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary mt-4 leading-[1.15] max-w-[220px] text-balance">
                Create Something <span className="italic font-serif font-normal text-[#B8763C]">Uniquely Yours.</span>
              </h3>
              <p className="font-body text-sm text-[#8A8580] mt-4 leading-relaxed max-w-[240px]">
                Turn your ideas into custom apparel with our easy-to-use Design studio workbench.
              </p>
            </div>

            {/* Mobile Device Mockup */}
            <div className="absolute -right-2 sm:right-0 -bottom-8 sm:-bottom-4 w-[65%] h-[75%] flex items-end justify-end pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-6 group-hover:-translate-x-2 group-hover:-rotate-2">
              <div className="relative w-full h-[90%] bg-gradient-to-br from-[#2A2A2A] to-[#111] rounded-tl-3xl p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-t border-l border-white/20">
                <div className="relative w-full h-full bg-[#FAF7F4] rounded-tl-2xl overflow-hidden flex flex-col items-center justify-start pt-8 shadow-inner border border-black/5">
                  {/* Status bar */}
                  <div className="absolute top-3 w-12 h-1.5 bg-black/10 rounded-full" />
                  
                  {/* T-Shirt SVG */}
                  <div className="w-[85%] relative transition-transform duration-500 group-hover:scale-105">
                    <svg viewBox="0 0 100 100" fill="none" className="drop-shadow-sm">
                      <path
                        d="M20 30 C30 32 35 32 40 28 C45 25 50 15 50 15 C50 15 55 25 60 28 C65 32 70 32 80 30 C82 40 85 55 90 62 C85 65 80 67 75 67 C74 60 73 55 73 50 C73 48 70 45 68 45 C67 60 65 80 62 95 C60 98 55 98 50 98 C45 98 40 98 38 95 C35 80 33 60 32 45 C30 45 27 48 27 50 C27 55 26 60 25 67 C20 67 15 65 10 62 C15 55 18 40 20 30 Z"
                        fill={activeColor}
                        stroke="#1A1A1A"
                        strokeWidth="0.5"
                        className="transition-colors duration-500"
                      />
                      <circle cx="50" cy="55" r="10" fill="#B8763C" fillOpacity="0.1" stroke="#B8763C" strokeWidth="0.5" strokeDasharray="2 2" className="animate-[spin_10s_linear_infinite]" />
                    </svg>
                  </div>

                  {/* Floating Color Palette */}
                  <div className="absolute bottom-6 w-max flex gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.06)] pointer-events-auto border border-black/5 transition-transform duration-500 group-hover:-translate-y-2">
                    {swatchColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setActiveColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border border-black/10 transition-all duration-300 ${
                          activeColor === c ? 'scale-125 ring-2 ring-offset-2 ring-[#B8763C]' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 sm:mt-0">
              <Link
                href="/design-studio"
                className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-7 py-3 rounded-full transition-all duration-300 active:scale-[0.97] bg-white/70 backdrop-blur-sm min-h-[44px]"
              >
                Start Designing <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>

          {/* ── CARD 2: BULK ORDERS ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 24 } }
            }}
            className="group relative bg-[#0A0A0A] rounded-[2.5rem] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col justify-between p-8 sm:p-10 min-h-[440px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
          >
            {/* Cinematic dark spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#C87533]/25 via-[#1A1A1A]/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            <div className="relative z-10">
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#C87533]">
                Bulk Orders
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-4 leading-[1.15] text-balance">
                For Brands,<br />Events & Teams
              </h3>
              <p className="font-body text-sm text-white/70 mt-4 leading-relaxed max-w-[240px]">
                Premium quality prints for your collective. Scalable, durable, and precisely matched.
              </p>
            </div>

            {/* Dynamic Folded Apparel Stacks */}
            <div className="absolute right-0 bottom-0 w-[65%] h-[60%] flex items-end justify-end pointer-events-none p-6">
              <div className="relative w-full h-[80%] flex flex-col items-end justify-end gap-0">
                {/* 3D Stack layers that fan out dynamically on hover */}
                <div className="w-[85%] h-[32px] bg-gradient-to-r from-[#D4A574] to-[#B8763C] rounded-[10px] border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform transition-all duration-700 ease-out group-hover:-translate-y-4 group-hover:-translate-x-2 group-hover:-rotate-3 z-30" />
                
                <div className="w-[92%] h-[32px] bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] rounded-[10px] border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.4)] -mt-4 transform transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:-rotate-1 z-20" />
                
                <div className="w-full h-[32px] bg-gradient-to-r from-[#F5F1EC] to-[#E8E2DB] rounded-[10px] border border-black/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] -mt-4 transform transition-all duration-700 ease-out z-10" />
              </div>
            </div>

            <div className="relative z-10 mt-8 sm:mt-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-[#1A1A1A] bg-white hover:bg-[#FAF7F4] shadow-md px-7 py-3 rounded-full transition-all duration-300 active:scale-[0.97] min-h-[44px]"
              >
                Get a Quote <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>

          {/* ── CARD 3: GIFT CARDS ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 24 } }
            }}
            className="group relative bg-[#F5F1EC] rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col justify-between p-8 sm:p-10 min-h-[440px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
          >
            {/* Subtle glow */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#B8763C]/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 transition-opacity duration-700 group-hover:opacity-100 opacity-0 pointer-events-none" />

            <div className="relative z-10">
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8763C]">
                Gift Cards
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary mt-4 leading-[1.15] text-balance">
                The Perfect Gift<br />for Creators
              </h3>
              <p className="font-body text-sm text-[#6B6560] mt-4 leading-relaxed max-w-[240px]">
                Let them choose exactly what they love. Send digital design gift cards instantly.
              </p>
            </div>

            {/* Premium 3D Gift Card Mockup */}
            <div className="absolute -right-4 bottom-8 w-[70%] h-[50%] flex items-center justify-center pointer-events-none">
              <div className="relative w-[180px] h-[110px] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-3 group-hover:scale-105 group-hover:-translate-y-4">
                
                {/* The card itself */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#111] to-[#222] rounded-2xl shadow-[10px_20px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[15px_30px_40px_rgba(0,0,0,0.25)] border border-white/10 flex flex-col justify-between p-5 overflow-hidden transition-shadow duration-700">
                  
                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-[1.5s] ease-in-out pointer-events-none" />
                  
                  {/* Gold abstract shape in corner */}
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-bl from-[#D4A574] to-[#B8763C] opacity-20 rounded-full blur-xl" />

                  <div className="font-display text-sm font-bold tracking-[0.3em] text-[#D4A574] relative z-10">
                    ALPONA
                  </div>
                  
                  <div className="flex justify-between items-end relative z-10">
                    <div className="flex gap-1.5 pb-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                       <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                       <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    </div>
                    <div className="text-lg font-bold text-white tracking-widest font-body">
                      ₹2,500
                    </div>
                  </div>
                </div>
                
                {/* Card shadow that moves dynamically */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/10 blur-xl rounded-full transition-all duration-700 group-hover:w-[90%] group-hover:opacity-40" />
              </div>
            </div>

            <div className="relative z-10 mt-8 sm:mt-0">
              <Link
                href="/gift-cards"
                className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-7 py-3 rounded-full transition-all duration-300 active:scale-[0.97] bg-white/70 backdrop-blur-sm min-h-[44px]"
              >
                Shop Gift Cards <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
