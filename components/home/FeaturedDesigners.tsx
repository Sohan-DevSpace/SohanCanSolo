'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'

const DESIGNERS = [
  {
    id: 'd1',
    name: 'Aisha Sharma',
    handle: '@aishacreates',
    image: '/images/designer_1.png',
    sales: '1.2K Sales',
    style: 'Minimalist & Typography',
  },
  {
    id: 'd2',
    name: 'Rahul Verma',
    handle: '@rahul.designs',
    image: '/images/designer_2.png',
    sales: '850 Sales',
    style: 'Streetwear & Grunge',
  },
  {
    id: 'd3',
    name: 'Priya Patel',
    handle: '@priyapatel.art',
    image: '/images/designer_1.png',
    sales: '2.5K Sales',
    style: 'Abstract & Flow',
  },
  {
    id: 'd4',
    name: 'David Chen',
    handle: '@chen.studios',
    image: '/images/designer_2.png',
    sales: '3.1K Sales',
    style: 'Retro & Vintage',
  }
]

export function FeaturedDesigners() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal py-12 lg:py-16 bg-white overflow-hidden select-none"
    >
      <div className="px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 lg:mb-14 text-left gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary tracking-tight leading-[1.1] text-balance">
              Featured Designers
            </h2>
            <p className="font-body text-sm text-[#8A8580] mt-3 uppercase tracking-widest font-semibold">
              The creative minds behind the most popular drops
            </p>
          </div>
          <Link
            href="/design-studio"
            className="font-body text-sm font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-6 py-3 rounded-full hover:bg-[#B8763C] flex items-center gap-2 transition-all duration-300 active:scale-95 group shadow-sm"
          >
            Become a Creator <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESIGNERS.map((designer) => (
            <div
              key={designer.id}
              className="group flex flex-col items-center text-center p-8 rounded-[24px] bg-[#FAF7F4] border border-[#E8E2DB] shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-500 ease-out cursor-pointer hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={designer.image}
                  alt={designer.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="font-display text-xl font-bold text-primary mb-1">
                {designer.name}
              </h3>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-[#B8763C] mb-4">
                {designer.handle}
              </p>

              <div className="w-full h-px bg-[#E8E2DB] mb-4 group-hover:bg-black/10 transition-colors" />

              <div className="flex flex-col gap-1 w-full text-left">
                <span className="font-body text-xs font-semibold text-[#8A8580]">Style: <span className="text-primary">{designer.style}</span></span>
                <span className="font-body text-xs font-semibold text-[#8A8580]">Track Record: <span className="text-primary">{designer.sales}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
