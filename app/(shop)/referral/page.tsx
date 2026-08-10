'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconGift, IconCopy, IconInfo, IconAward } from '@/components/shared/PremiumIcons'
import { MorphingIcon } from '@/components/shared/MorphingIcon'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'ALPONA-FRIEND-5240'
  const referralLink = `https://alpona.com/signup?ref=${referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Loyalty Rewards
        </span>
        <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-zinc-900 leading-tight">
          Invite Friends, Earn Store Credits
        </h1>
        <p className="text-[#666666] text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
          Share the love of premium print designs. Give your friends ₹150 off on their first purchase, and you\'ll earn ₹150 store credit!
        </p>
      </div>

      {/* Main card panel */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] mt-12 md:mt-16">
        <div className="bg-white border border-[#E8E2DB] rounded-[32px] p-6 md:p-10 shadow-sm space-y-10">
          
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-b border-[#E8E2DB] pb-10">
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 bg-[#FAF7F4] text-[#B8763C] border border-[#E8E2DB] rounded-2xl flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">Send Invitation</h4>
              <p className="text-xs text-[#666666] max-w-[180px] leading-relaxed">Share your unique referral link with your friends.</p>
            </div>
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 bg-[#FAF7F4] text-[#B8763C] border border-[#E8E2DB] rounded-2xl flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">Friend Shops</h4>
              <p className="text-xs text-[#666666] max-w-[180px] leading-relaxed">Your friend gets ₹150 discount applied at checkout.</p>
            </div>
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 bg-[#FAF7F4] text-[#B8763C] border border-[#E8E2DB] rounded-2xl flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">Get Rewarded</h4>
              <p className="text-xs text-[#666666] max-w-[180px] leading-relaxed">You receive ₹150 store credit after their order ships.</p>
            </div>
          </div>

          {/* Copy Widget */}
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-[#555555] uppercase tracking-wider">
              <span>Your Referral Link</span>
              <span className="flex items-center gap-1"><IconGift size={14} className="text-[#B8763C]" color="currentColor" /> Give ₹150, Get ₹150</span>
            </div>

            <div className="flex bg-[#FAF7F4]/60 border border-[#E8E2DB] rounded-full overflow-hidden p-1.5 focus-within:border-[#B8763C]/50 transition-colors">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-grow bg-transparent px-4 py-2.5 text-[#1A1A1A] font-semibold text-xs md:text-sm focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-[#B8763C] hover:bg-[#B06024] text-white font-bold px-6 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 text-xs md:text-sm active:scale-[0.97] shrink-0"
              >
                {copied ? (
                  <>
                    Copied <MorphingIcon name="check" size={16} color="currentColor" strokeWidth={2} />
                  </>
                ) : (
                  <>
                    Copy Link <IconCopy size={16} color="currentColor" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#FAF6F2] border border-[#E8E2DB]/65 rounded-2xl p-5 flex gap-4 max-w-xl mx-auto">
            <IconInfo size={20} className="text-[#B8763C] shrink-0 mt-0.5" color="currentColor" />
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-[#1A1A1A]">Terms & Expiry</h5>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Store credits accumulated through referrals can be stacked and applied to any purchase over ₹500. Credits have a validity of 12 months from the date of issuance.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
