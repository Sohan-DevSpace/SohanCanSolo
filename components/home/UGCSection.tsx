'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useReveal } from '@/hooks/useReveal'

const ugcImages = [
  { url: '/images/designer_2.png', alt: 'Creator style 1' },
  { url: '/images/designer_1.png', alt: 'Creator style 2' },
  { url: '/images/designer_2.png', alt: 'Creator style 3' },
  { url: '/images/designer_1.png', alt: 'Creator style 4' },
  { url: '/images/designer_2.png', alt: 'Creator style 5' },
  { url: '/images/designer_1.png', alt: 'Creator style 6' },
  { url: '/images/designer_2.png', alt: 'Creator style 7' },
]

export function UGCSection() {
  const sectionRef = useReveal()
  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-12 lg:py-16 bg-white overflow-hidden select-none"
    >
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 lg:mb-14 text-left gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary tracking-tight leading-[1.1] text-balance">
              Spotted in <span className="italic font-serif font-normal text-[#B8763C]">Alpona.</span>
            </h2>
            <p className="font-body text-sm text-[#8A8580] mt-3 uppercase tracking-widest font-semibold">
              Tag @alpona.store to get featured
            </p>
          </div>
          <a
            href="https://instagram.com/alpona.store"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-6 py-3 rounded-full hover:bg-[#B8763C] flex items-center gap-2 transition-all duration-300 active:scale-95 group shadow-sm"
          >
            Follow Our Instagram <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 md:gap-6 pt-0 md:pt-12">
            {([ugcImages[0], ugcImages[4]].filter(Boolean) as typeof ugcImages).map((img, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                <Image src={img.url} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              </div>
            ))}
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col gap-4 md:gap-6">
            {([ugcImages[1], ugcImages[5]].filter(Boolean) as typeof ugcImages).map((img, idx) => (
              <div key={idx} className="relative aspect-[4/5] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                <Image src={img.url} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              </div>
            ))}
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4 md:gap-6 pt-0 md:pt-8">
            {([ugcImages[2], ugcImages[6]].filter(Boolean) as typeof ugcImages).map((img, idx) => (
              <div key={idx} className="relative aspect-square md:aspect-[3/4] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                <Image src={img.url} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              </div>
            ))}
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-4 md:gap-6 pt-0 md:pt-20">
            {ugcImages[3] && (
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                <Image src={ugcImages[3].url} alt={ugcImages[3].alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              </div>
            )}
            
            <div className="bg-[#FAF7F4] rounded-[24px] p-6 flex flex-col items-center justify-center text-center border border-[#E8E2DB]/50 aspect-square">
              <span className="font-display text-4xl font-bold text-primary mb-2">25K+</span>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-[#8A8580]">
                Happy Customers Worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
