'use client'

import { motion } from 'framer-motion'
import { AnimatedClose } from '@/components/shared/AnimatedIcons'

const SIZE_GUIDE_ROWS = [
  { size: 'XS', chest: '34-36', length: '26', shoulder: '16' },
  { size: 'S', chest: '36-38', length: '27', shoulder: '17' },
  { size: 'M', chest: '38-40', length: '28', shoulder: '18' },
  { size: 'L', chest: '40-42', length: '29', shoulder: '19' },
  { size: 'XL', chest: '42-44', length: '30', shoulder: '20' },
  { size: 'XXL', chest: '44-46', length: '31', shoulder: '21' },
]

export default function SizeGuidePage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-16 md:pt-20 pb-12 px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Find Your Fit
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Size Guide
        </h1>
        <p className="text-[#666666] text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
          Measurements are approximate. For the best fit, compare these measurements with a similar item you already own.
        </p>
      </div>

      <div className="container mx-auto px-5 lg:px-16 max-w-[900px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8E2DB] rounded-3xl p-6 md:p-10 shadow-sm"
        >
          <div className="mb-10">
            <h3 className="text-xl font-display font-bold mb-4">Unisex T-Shirts & Hoodies</h3>
            <div className="overflow-x-auto rounded-xl border border-[#E8E2DB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F5F1EC]/50 border-b border-[#E8E2DB]">
                    {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'].map(h => (
                      <th key={h} className="text-left py-4 px-6 font-bold text-[#1A1A1A] uppercase tracking-wider text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE_ROWS.map(row => (
                    <tr key={row.size} className="border-b border-[#F5F1EC] last:border-b-0 hover:bg-[#F5F1EC]/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#1A1A1A]">{row.size}</td>
                      <td className="py-4 px-6 text-neutral-500 tabular-nums">{row.chest}</td>
                      <td className="py-4 px-6 text-neutral-500 tabular-nums">{row.length}</td>
                      <td className="py-4 px-6 text-neutral-500 tabular-nums">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#E8E2DB]">
            <div>
              <h4 className="font-bold text-lg mb-2">How to Measure</h4>
              <ul className="space-y-4 text-sm text-neutral-600 mt-4">
                <li>
                  <strong className="text-[#1A1A1A] block mb-1">Chest</strong>
                  Measure under your arms, around the fullest part of your chest.
                </li>
                <li>
                  <strong className="text-[#1A1A1A] block mb-1">Length</strong>
                  Measure from the highest point of the shoulder straight down to the hem.
                </li>
                <li>
                  <strong className="text-[#1A1A1A] block mb-1">Shoulder</strong>
                  Measure from shoulder seam to shoulder seam straight across the back.
                </li>
              </ul>
            </div>
            <div className="bg-[#FAF7F4] rounded-2xl p-6 flex items-center justify-center border border-[#E8E2DB]/50">
              {/* Abstract Illustration of measuring */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto border-2 border-dashed border-[#B8763C]/40 rounded-full flex items-center justify-center mb-4 text-[#B8763C]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
                    <line x1="6" y1="7" x2="6" y2="17"></line>
                    <line x1="10" y1="7" x2="10" y2="17"></line>
                    <line x1="14" y1="7" x2="14" y2="17"></line>
                    <line x1="18" y1="7" x2="18" y2="17"></line>
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Need help?</p>
                <p className="text-sm text-[#1A1A1A] mt-1">Contact support@alpona.com</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
