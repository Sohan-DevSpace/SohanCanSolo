'use client'

import { FaqClient } from './FaqClient'
import Link from 'next/link'
import { Headphones, ArrowRight, Sparkles } from 'lucide-react'

export function FaqPageClient({ faqs }: { faqs: any }) {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 space-y-10">
      
      {/* FAQ Accordion Component */}
      <div className="bg-white border border-[#E8E2DB] rounded-3xl p-6 sm:p-10 shadow-sm">
        <FaqClient faqs={faqs} />
      </div>

      {/* Link to Dedicated Help Center */}
      <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] flex items-center justify-center shrink-0">
            <Headphones size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B8763C]">Need Order Assistance?</span>
            <h4 className="text-base font-extrabold text-[#1A1A1A]">Visit Our Help Center Concierge</h4>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Live order tracking, WhatsApp support, returns, and direct concierge messaging.
            </p>
          </div>
        </div>

        <Link
          href="/help"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#B8763C] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <span>Open Help Center</span>
          <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  )
}
