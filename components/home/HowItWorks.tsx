'use client'

import { IconPencil, IconBadgeCheck, IconTruck } from '@/components/shared/PremiumIcons'

const steps = [
  {
    step: '01',
    title: 'Pick or Create a Design',
    description: 'Explore 120+ original studio artworks or upload your custom design.',
    icon: IconPencil,
  },
  {
    step: '02',
    title: 'Select Premium Garment',
    description: 'Choose your apparel cut, color, and size crafted from 100% combed cotton.',
    icon: IconBadgeCheck,
  },
  {
    step: '03',
    title: 'We Print & Ship to You',
    description: 'Custom printed on demand and delivered directly to your doorstep in 5–7 days.',
    icon: IconTruck,
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white py-10 lg:py-14 border-b border-[#E8E2DB]/50 select-none">
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
          {steps.map((s, idx) => {
            const IconComp = s.icon
            return (
              <div key={s.step} className="flex-1 flex items-start gap-4 w-full group">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center text-[#C87533] shrink-0 group-hover:bg-[#C87533] group-hover:text-white group-hover:border-[#C87533] transition-all duration-300 shadow-sm">
                  <IconComp size={20} color="currentColor" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-extrabold text-[#C87533] tracking-widest">{s.step}</span>
                    <h3 className="font-display text-base font-bold text-[#1A1A1A] tracking-tight">{s.title}</h3>
                  </div>
                  <p className="font-sans text-xs text-[#6B6560] leading-relaxed max-w-sm">
                    {s.description}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block h-10 w-px bg-[#E8E2DB] self-center ml-auto mr-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
