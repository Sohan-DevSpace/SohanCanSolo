'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Package, Truck, CheckCircle2, Search, ArrowRight, Clock, MapPin, ExternalLink, AlertCircle, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CURRENCY_SYMBOL } from '@/constants/config'

const easePremium: [number, number, number, number] = [0.32, 0.72, 0, 1]

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !emailOrPhone.trim()) return

    setIsSearching(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          emailOrPhone: emailOrPhone.trim()
        })
      })
      const data = await res.json()

      if (res.ok && data.success && data.order) {
        setResult(data.order)
      } else {
        setErrorMsg(data.error || 'Order not found. Please verify your order number and email/phone.')
        setResult(null)
      }
    } catch (err) {
      setErrorMsg('Failed to connect to tracking system. Please try again.')
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const formatPrice = (amount: number) => `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`

  return (
    <div className="relative min-h-screen bg-[#FAF7F4] text-[#1A1A1A] overflow-hidden pt-24 pb-32">
      {/* Background Decor - Cinematic blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] max-w-5xl pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#B8763C]/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#E8C9A0]/20 blur-[100px]" />
      </div>

      <div className="container mx-auto px-5 lg:px-16 max-w-[800px] relative z-10">
        <motion.div 
          className="text-center pb-10 md:pb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easePremium }}
        >
          <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Real-Time Logistics Tracker
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-serif tracking-tight text-zinc-900 text-balance mb-4 leading-[1.1]">
            Track Your Order
          </h1>
          <p className="text-[#8A8580] text-sm md:text-base max-w-[440px] mx-auto leading-relaxed">
            Enter your order ID and email/phone below to view live crafting, dispatch, and delivery updates.
          </p>
        </motion.div>

        {/* TRACKING SEARCH FORM */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 -z-10" />
          
          <form onSubmit={handleTrack} className="p-6 md:p-8 space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8580] uppercase tracking-wider ml-1">
                  Order Number
                </label>
                <Input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-1721992019"
                  className="bg-white/80 backdrop-blur-sm border-[#E8E2DB] shadow-sm text-[#1A1A1A] h-12 rounded-xl text-sm px-4 focus-visible:ring-[#B8763C]/20"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8580] uppercase tracking-wider ml-1">
                  Email or Phone Number
                </label>
                <Input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. name@domain.com or 9876543210"
                  className="bg-white/80 backdrop-blur-sm border-[#E8E2DB] shadow-sm text-[#1A1A1A] h-12 rounded-xl text-sm px-4 focus-visible:ring-[#B8763C]/20"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSearching}
              className="w-full h-13 bg-[#1A1A1A] hover:bg-[#B8763C] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 group"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching Live Database...
                </>
              ) : (
                <>
                  <span>Track Order Status</span>
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* LIVE TRACKING RESULTS */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="tracking-result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: easePremium }}
              className="space-y-8"
            >
              {/* Header Badge */}
              <div className="bg-white border border-[#E8E2DB] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2DB]/80">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8763C] bg-[#B8763C]/10 border border-[#B8763C]/20 px-2.5 py-1 rounded-md">
                      Status: {result.status.toUpperCase()}
                    </span>
                    <h2 className="text-2xl font-bold font-serif text-[#1A1A1A] mt-2">
                      Order #{result.orderNumber.slice(0, 14).toUpperCase()}
                    </h2>
                    <p className="text-xs text-[#8A8580] mt-1 font-mono">
                      Placed on {new Date(result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {result.trackingNumber && (
                    <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl p-3 text-right">
                      <span className="text-[10px] font-bold text-[#8A8580] uppercase tracking-wider block">Courier AWB</span>
                      <span className="text-xs font-mono font-bold text-[#B8763C] block">{result.trackingNumber}</span>
                      <span className="text-[10px] font-semibold text-[#1A1A1A] block">{result.courierName}</span>
                    </div>
                  )}
                </div>

                {/* Progress Stepper */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8580]">Fulfillment Timeline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {result.statusSteps.map((step: any, idx: number) => {
                      const isCompleted = idx + 1 <= result.currentStepIndex
                      const isCurrent = idx + 1 === result.currentStepIndex

                      return (
                        <div 
                          key={step.id} 
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCurrent 
                              ? 'bg-[#B8763C]/10 border-[#B8763C] text-[#1A1A1A]' 
                              : isCompleted 
                                ? 'bg-white border-[#E8E2DB] text-[#1A1A1A]' 
                                : 'bg-[#FAF7F4] border-[#E8E2DB]/50 text-muted-foreground/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8580]">Step {idx + 1}</span>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#B8763C]" />}
                          </div>
                          <p className="text-xs font-bold leading-snug">{step.label}</p>
                          {step.date && (
                            <p className="text-[10px] font-mono text-[#8A8580] mt-1">
                              {new Date(step.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Live Courier Tracking Link Trigger */}
                {result.trackingUrl && (
                  <div className="pt-4 border-t border-[#E8E2DB]/80 flex justify-end">
                    <a
                      href={result.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#B8763C] text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <span>Track on {result.courierName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Itemized Order Products */}
              <div className="bg-white border border-[#E8E2DB] rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] pb-3 border-b border-[#E8E2DB]">
                  Package Contents ({result.items?.length || 0})
                </h3>

                <div className="space-y-3">
                  {result.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#FAF7F4] last:border-0">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1A]">{item.productName}</p>
                          <p className="text-[11px] text-[#8A8580]">Qty: {item.quantity} {item.size ? `• ${item.size}` : ''} {item.color ? `• ${item.color}` : ''}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1A1A1A]">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E8E2DB] flex justify-between items-center text-xs font-bold">
                  <span className="text-[#8A8580]">Total Paid ({result.paymentMethod.toUpperCase()}):</span>
                  <span className="text-base font-mono text-[#B8763C]">{formatPrice(result.total)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
