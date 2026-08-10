'use client'

import {
  IconTruck,
  IconRefresh,
  IconLock,
  IconMapPin,
  IconMessage,
} from '@/components/shared/PremiumIcons'

const trustCards = [
  {
    icon: IconTruck,
    title: 'Free Shipping',
    desc: 'On orders above ₹999',
  },
  {
    icon: IconRefresh,
    title: '7 Days Easy Returns',
    desc: 'Hassle-free returns',
  },
  {
    icon: IconLock,
    title: 'COD Available',
    desc: 'Cash on delivery',
  },
  {
    icon: IconMapPin,
    title: 'Made in India',
    desc: 'Proudly Indian',
  },
  {
    icon: IconMessage,
    title: '24/7 Support',
    desc: "We're here for you",
  },
]

// 3 sets for 100% seamless, uninterrupted GPU marquee scroll
const marqueeCards = [...trustCards, ...trustCards, ...trustCards]

export function TrustSection() {
  return (
    <section className="bg-[#FAF7F4] py-8 border-b border-[#E8E2DB]/30 select-none overflow-hidden relative">
      {/* Soft gradient fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAF7F4] via-[#FAF7F4]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF7F4] via-[#FAF7F4]/90 to-transparent z-10 pointer-events-none" />
      
      <div className="flex overflow-hidden">
        <div className="animate-marquee-continuous flex gap-4 pr-4">
          {marqueeCards.map((card, i) => {
            const CardIcon = card.icon
            return (
              <div
                key={i}
                className="flex-shrink-0 w-[240px] sm:w-[260px] bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E8E2DB] shadow-sm flex items-center gap-4 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:bg-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-[#E8E2DB]/80 flex items-center justify-center text-[#B8763C] shrink-0">
                  <CardIcon size={18} color="currentColor" />
                </div>
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    {card.title}
                  </h3>
                  <p className="font-body text-xs text-[#6B6560] mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
