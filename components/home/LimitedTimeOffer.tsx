'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useReveal } from '@/hooks/useReveal'

export function LimitedTimeOffer() {
  const sectionRef = useReveal()
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 22,
  })

  // Basic countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else {
          if (minutes > 0) {
            minutes--
            seconds = 59
          } else {
            if (hours > 0) {
              hours--
              minutes = 59
              seconds = 59
            }
          }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-12 lg:py-16 bg-white overflow-hidden relative"
    >
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden bg-[#FAF7F4] flex flex-col md:flex-row items-center border border-[#E8E2DB]">
          
          {/* Content */}
          <div className="flex-1 p-8 lg:p-16 text-left relative z-10">
            <span className="inline-block font-body text-xs font-bold uppercase tracking-widest text-[#B8763C] mb-4 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-[#E8E2DB]">
              Limited Time Offer
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary tracking-tight leading-[1.1] mb-6">
              Summer Drop
            </h2>
            <p className="font-body text-base text-[#6B6560] max-w-md mb-8 leading-relaxed">
              Get up to 40% off on our latest summer collection. Exclusive designs for the bold.
            </p>

            {/* Countdown */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl font-bold tabular-nums bg-white border border-[#E8E2DB] shadow-sm w-16 h-16 flex items-center justify-center rounded-2xl text-primary">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="font-body text-[10px] uppercase tracking-widest font-bold text-[#8A8580] mt-2">Hours</span>
              </div>
              <span className="font-display text-2xl font-bold text-[#8A8580] -mt-6">:</span>
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl font-bold tabular-nums bg-white border border-[#E8E2DB] shadow-sm w-16 h-16 flex items-center justify-center rounded-2xl text-primary">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="font-body text-[10px] uppercase tracking-widest font-bold text-[#8A8580] mt-2">Mins</span>
              </div>
              <span className="font-display text-2xl font-bold text-[#8A8580] -mt-6">:</span>
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl font-bold tabular-nums bg-white border border-[#E8E2DB] shadow-sm w-16 h-16 flex items-center justify-center rounded-2xl text-primary">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="font-body text-[10px] uppercase tracking-widest font-bold text-[#8A8580] mt-2">Secs</span>
              </div>
            </div>

            <Link
              href="/shop?category=summer"
              className="inline-flex items-center justify-center gap-2 bg-[#C87533] hover:bg-[#A65E28] text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(200,117,51,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(200,117,51,0.5)] active:scale-95 min-h-[48px]"
            >
              Shop The Drop →
            </Link>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
            <Image
              src="/images/designer_1.png"
              alt="Summer Drop Collection"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-[#FAF7F4] pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  )
}
