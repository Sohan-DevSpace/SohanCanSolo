'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconPercent, IconBadgeCheck, IconDollar, IconSparkles, IconArrowRight } from '@/components/shared/PremiumIcons'
import { CURRENCY_SYMBOL } from '@/constants/config'

export default function AffiliatePage() {
  const [salesPerMonth, setSalesPerMonth] = useState(150)
  const averageOrderValue = 899
  const commissionRate = 0.10 // 10%

  const estimatedEarnings = Math.round(salesPerMonth * averageOrderValue * commissionRate)

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Hero Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Partner Program
        </span>
        <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-zinc-900 leading-tight">
          Earn With Alpona
        </h1>
        <p className="text-[#666666] text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
          Join our affiliate network. Promote our premium custom printed apparel and earn 10% commission on every checkout.
        </p>
      </div>

      {/* Grid details */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[1200px] mt-12 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-balance text-2xl md:text-3xl font-bold font-serif tracking-tight">
              Why Partner With Us?
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed">
              Are you an artist, content creator, or fashion blogger? Alpona offers the most reliable print-on-demand partnership structure in India. Simply share your custom referral links and earn passive commission.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E2DB] text-[#B8763C] shrink-0">
                  <IconPercent size={20} color="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">10% Commission Rate</h4>
                  <p className="text-xs text-[#555555]">Earn a high percentage on every item purchased via your link.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E2DB] text-[#B8763C] shrink-0">
                  <IconBadgeCheck size={20} color="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">Transparent Tracking</h4>
                  <p className="text-xs text-[#555555]">Track your referrals, orders, and payouts on your custom dashboard.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E2DB] text-[#B8763C] shrink-0">
                  <IconDollar size={20} color="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">Monthly Payouts</h4>
                  <p className="text-xs text-[#555555]">Get direct bank transfers of your earnings on the 10th of every month.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Earnings Calculator */}
          <div className="lg:col-span-6 bg-white border border-[#E8E2DB] rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#B8763C] font-bold text-xs uppercase tracking-wider">
                <IconSparkles size={16} color="currentColor" /> Earnings Calculator
              </div>
              <h3 className="text-xl font-bold font-serif text-[#1A1A1A]">
                Estimate Your Payouts
              </h3>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#666666] font-medium">Referred Orders / Month</span>
                <span className="font-bold text-[#1A1A1A] text-base">{salesPerMonth} Sales</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={salesPerMonth}
                onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
                className="w-full h-2 bg-[#FAF7F4] border border-[#E8E2DB] rounded-lg appearance-none cursor-pointer accent-[#B8763C]"
              />
            </div>

            {/* Earnings breakdown */}
            <div className="bg-[#FAF6F2] rounded-2xl p-6 border border-[#E8E2DB]/65 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#666666] font-semibold block">Avg. Order Value</span>
                <span className="text-lg font-bold text-[#1A1A1A]">{CURRENCY_SYMBOL}{averageOrderValue}</span>
              </div>
              <div>
                <span className="text-xs text-[#666666] font-semibold block">Commission Rate</span>
                <span className="text-lg font-bold text-[#1A1A1A]">10% per sale</span>
              </div>
              <div className="col-span-2 pt-4 border-t border-[#E8E2DB] flex justify-between items-end">
                <div>
                  <span className="text-xs text-[#B8763C] font-bold block uppercase tracking-wider">Estimated Monthly Profit</span>
                  <span className="text-3xl font-extrabold text-[#1A1A1A] ">{CURRENCY_SYMBOL}{estimatedEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-[#B8763C] hover:bg-[#B06024] text-white font-bold h-14 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-matte-md hover:shadow-[#B8763C]/20 active:scale-[0.97]">
              Apply to Program <IconArrowRight size={16} color="currentColor" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
