'use client'

import { useState, useEffect } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { useCountUp } from '@/hooks/useCountUp'
import { motion, AnimatePresence } from 'framer-motion'
import { IconStar } from '@/components/shared/PremiumIcons'

const testimonials = [
  {
    quote: "The print quality blew my mind. It's not some cheap iron-on — this feels like a proper luxury brand tee.",
    name: "Arjun Mehta",
    role: "Verified Creator",
    city: "Mumbai",
  },
  {
    quote: "Super fast delivery and the packaging felt ultra-premium. I've already ordered three more custom hoodies.",
    name: "Priya Sharma",
    role: "Verified Buyer",
    city: "Bangalore",
  },
  {
    quote: "I loved the fabric weight and how the vibrant colours stayed 100% vivid after multiple machine washes.",
    name: "Rahul Verma",
    role: "Verified Buyer",
    city: "Delhi",
  },
  {
    quote: "The oversized boxy fit is exactly what I wanted. The design options are creative and the print feels indestructible.",
    name: "Neha Kapoor",
    role: "Verified Creator",
    city: "Pune",
  },
  {
    quote: "Created a custom artwork for our team and everyone thought it was imported from an international boutique.",
    name: "Vikram Tech",
    role: "Studio Lead",
    city: "Hyderabad",
  },
]

export function Testimonials() {
  const sectionRef = useReveal()
  const [activeIndex, setActiveIndex] = useState(0)
  const { ref: ratingRef, displayValue: ratingValue } = useCountUp(4.8, { decimals: 1 })

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const currentTestimonial = testimonials[activeIndex] || testimonials[0] || {
    quote: '',
    name: '',
    role: '',
    city: ''
  }

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-16 lg:py-24 px-6 bg-[#FAF7F4] relative overflow-hidden select-none border-b border-[#E8E2DB]/50"
    >
      {/* Decorative radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#C87533]/10 via-[#B8763C]/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Eyebrow */}
        <span className="inline-block font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8763C] mb-3 bg-[#B8763C]/10 border border-[#B8763C]/20 px-3.5 py-1 rounded-full">
          Creator & Customer Reviews
        </span>

        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-10">
          Loved by Thousands.
        </h2>

        {/* Testimonial Card Frame with Double Bezel */}
        <div className="max-w-2xl mx-auto rounded-[2.5rem] p-2 bg-gradient-to-b from-white via-[#FAF7F4] to-[#E8E2DB]/50 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E8E2DB]">
          <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-8 sm:p-12 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
            
            {/* Big quote graphic */}
            <span className="absolute -top-6 -left-2 font-serif text-8xl leading-none text-[#C87533]/15 pointer-events-none">
              &ldquo;
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-between h-full"
              >
                <p className="font-serif text-xl sm:text-2xl font-light italic text-[#1A1A1A] leading-relaxed text-balance mb-8">
                  &ldquo;{currentTestimonial.quote}&rdquo;
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E8E2DB]/60">
                  <div className="text-left">
                    <p className="font-display text-base font-bold text-[#1A1A1A]">
                      {currentTestimonial.name}
                    </p>
                    <p className="font-body text-xs text-[#8C857C]">
                      {currentTestimonial.role} • {currentTestimonial.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[#C87533]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} size={15} color="currentColor" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`transition-all duration-500 rounded-full cursor-pointer active:scale-95 ${
                i === activeIndex
                  ? 'w-8 h-2 bg-[#C87533]'
                  : 'w-2 h-2 bg-[#E8E2DB] hover:bg-[#C87533]/50'
              }`}
              aria-label={`Show review ${i + 1}`}
            />
          ))}
        </div>

        {/* Overall Trust Metric */}
        <div className="inline-flex items-center gap-3 mt-10 px-5 py-2.5 rounded-full bg-white border border-[#E8E2DB] shadow-sm">
          <div className="flex gap-0.5 text-[#C87533]">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar key={i} size={15} color="currentColor" />
            ))}
          </div>
          <span
            ref={ratingRef as React.RefObject<HTMLSpanElement>}
            className="font-display text-base font-bold text-[#1A1A1A] tabular-nums"
          >
            {ratingValue}
          </span>
          <span className="font-body text-xs font-semibold text-[#8C857C]">
            from 10,000+ happy creators
          </span>
        </div>

      </div>
    </section>
  )
}
