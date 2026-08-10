'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { IconExternalLink } from '@/components/shared/PremiumIcons'
import { CheckCircle2, Package, Truck, MapPin, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const easePremium: [number, number, number, number] = [0.32, 0.72, 0, 1]

function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { id: 'confirmed', label: 'Confirmed', estimate: 'Day 1', icon: CheckCircle2 },
    { id: 'processing', label: 'Processing', estimate: 'Day 2-3', icon: Package },
    { id: 'shipped', label: 'Shipped', estimate: 'Day 4-5', icon: Truck },
    { id: 'delivered', label: 'Delivered', estimate: 'Day 5-7', icon: MapPin },
  ]

  let currentIndex = -1
  if (status === 'pending' || status === 'confirmed') currentIndex = 0
  else if (status === 'processing' || status === 'printed' || status === 'packed') currentIndex = 1
  else if (status === 'shipped') currentIndex = 2
  else if (status === 'delivered') currentIndex = 3
  else if (status === 'cancelled') currentIndex = -2

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (status === 'cancelled') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.6, ease: easePremium }}
        className="w-full p-6 bg-red-50 border border-red-200 rounded-2xl text-center flex flex-col items-center shadow-inner"
        style={{ perspective: 1000 }}
      >
        <XCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-red-600 font-bold text-xl">Order Cancelled</h3>
        <p className="text-red-500/80 text-sm mt-2 font-medium">This order has been cancelled and cannot be fulfilled.</p>
      </motion.div>
    )
  }

  return (
    <div className="py-6 relative">
      {/* Desktop Layout (horizontal timeline) */}
      <div className="hidden md:flex justify-between items-center w-full relative px-6">
        {/* Background Line */}
        <div className="absolute top-[1.75rem] left-[12%] right-[12%] h-[3px] bg-[#E8E2DB] -z-10 rounded-full" />
        {/* Active Progress Line */}
        {currentIndex >= 0 && (
          <motion.div 
            className="absolute top-[1.75rem] left-[12%] h-[3px] bg-gradient-to-r from-[#B8763C] to-[#E8C9A0] -z-10 rounded-full origin-left shadow-[0_0_10px_rgba(184,118,60,0.5)]" 
            initial={{ width: '0%' }}
            animate={{ width: mounted ? `${(currentIndex / (steps.length - 1)) * 76}%` : '0%' }}
            transition={{ duration: 1.2, ease: easePremium, delay: 0.3 }}
          />
        )}

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isActive = index === currentIndex
          
          return (
            <motion.div 
              key={index} 
              className="flex flex-col items-center gap-3 relative flex-1 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm z-10 ${
                isCompleted 
                  ? 'bg-gradient-to-br from-[#B8763C] to-[#9A5A2B] text-white shadow-[0_8px_16px_rgba(184,118,60,0.4)]' 
                  : 'bg-white border-2 border-[#E8E2DB] text-[#B0AAA4]'
              } ${isActive ? 'ring-4 ring-[#B8763C]/20 scale-110' : ''}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className={`text-xs font-bold uppercase tracking-wider block ${isCompleted ? 'text-[#1A1A1A]' : 'text-[#8A8580]'}`}>{step.label}</span>
                <span className="text-[10px] font-medium text-[#B0AAA4] mt-1 block">Est. {step.estimate}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Mobile Layout (vertical timeline) */}
      <div className="flex md:hidden flex-col gap-6 relative px-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isActive = index === currentIndex
          const isNextActive = index + 1 <= currentIndex
          
          return (
            <div key={index} className="flex items-center gap-5 relative">
              {/* Connecting line to the next item */}
              {index < steps.length - 1 && (
                <div className="absolute top-6 left-[1.5rem] w-[2px] h-[calc(100%+1.5rem)] bg-[#E8E2DB] -z-10 -translate-x-1/2" />
              )}
              {index < steps.length - 1 && isNextActive && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: mounted ? 'calc(100% + 1.5rem)' : 0 }}
                  transition={{ duration: 0.8, ease: easePremium, delay: 0.2 + (index * 0.1) }}
                  className="absolute top-6 left-[1.5rem] w-[2px] bg-gradient-to-b from-[#B8763C] to-[#E8C9A0] -z-10 -translate-x-1/2 shadow-[0_0_10px_rgba(184,118,60,0.5)] origin-top" 
                />
              )}

              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm z-10 ${
                isCompleted 
                  ? 'bg-gradient-to-br from-[#B8763C] to-[#9A5A2B] text-white shadow-[0_6px_12px_rgba(184,118,60,0.3)]' 
                  : 'bg-white border-2 border-[#E8E2DB] text-[#B0AAA4]'
              } ${isActive ? 'ring-4 ring-[#B8763C]/20 scale-105 shadow-[0_0_15px_rgba(184,118,60,0.3)]' : ''}`}>
                <step.icon className="w-5 h-5" />
              </div>

              <div className="flex flex-col text-left">
                <span className={`text-xs font-bold uppercase tracking-wider block ${isCompleted ? 'text-[#1A1A1A]' : 'text-[#8A8580]'}`}>{step.label}</span>
                <span className="text-[10px] font-medium text-[#B0AAA4] mt-0.5 block">Est. {step.estimate}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TrackResultClient({ orderData }: { orderData: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: easePremium, staggerChildren: 0.1 }}
      className="mt-8 space-y-6"
      style={{ perspective: 1200 }}
    >
      {/* Main Order Card */}
      <motion.div 
        className="relative transform-style-preserve-3d"
        whileHover={{ rotateX: 0.5, rotateY: -0.5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl shadow-[0_15px_45px_-12px_rgba(0,0,0,0.06)] rounded-[2rem] border border-[#E8E2DB]/60 -z-10" />
        
        <div className="p-5 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-6 border-b border-[#E8E2DB]/60">
            <div className="w-full min-w-0 pr-4">
              <span className="text-[10px] font-bold text-[#8A8580] uppercase tracking-widest block mb-1">
                Order Placed On
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-[#B8763C] truncate leading-tight">
                {orderData.order_number}
              </h2>
              <p className="text-xs text-[#1A1A1A] mt-1.5 font-medium flex items-center gap-2 bg-[#FAF7F4] w-max px-3 py-1 rounded-md border border-[#E8E2DB]/50">
                {new Date(orderData.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {orderData.tracking_url && (
              <Link href={orderData.tracking_url} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto shrink-0">
                <Button className="w-full md:w-auto bg-[#1A1A1A] hover:bg-[#B8763C] text-white font-bold h-11 rounded-xl px-5 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-xs uppercase tracking-wide group">
                  Track Courier 
                  <IconExternalLink size={14} color="currentColor" className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Timeline */}
          <OrderTimeline status={orderData.status} />
        </div>
      </motion.div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Items */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: easePremium, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-2xl border border-[#E8E2DB]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 md:p-8 hover:shadow-[0_15px_30px_rgb(0,0,0,0.05)] transition-shadow duration-500"
        >
          <h3 className="text-xs font-bold text-[#8A8580] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items Ordered
          </h3>
          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {orderData.order_items.map((item: any) => {
              const imageUrl = item.designs?.image_url || (item.products?.images?.[0]) || '/placeholder.png'
              return (
                <div key={item.id} className="flex gap-5 border-b border-[#E8E2DB]/60 pb-5 last:border-0 last:pb-0 group">
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl shrink-0 overflow-hidden shadow-sm">
                    <Image 
                      src={imageUrl} 
                      alt={item.product_name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-sm min-w-0">
                    <p className="font-bold text-[#1A1A1A] line-clamp-2 text-sm sm:text-base leading-snug">{item.product_name}</p>
                    <p className="text-[#8A8580] mt-1.5 text-xs font-medium">{item.color} <span className="mx-1">•</span> {item.size}</p>
                    <div className="flex flex-wrap gap-2 justify-between items-center mt-3">
                      <p className="text-[#1A1A1A] text-xs font-bold bg-[#FAF7F4] px-2.5 py-1 rounded-md border border-[#E8E2DB]/50">Qty: {item.quantity}</p>
                      <span className="font-bold font-mono text-[#B8763C] text-sm sm:text-base">
                        {CURRENCY_SYMBOL}{item.total_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 pt-5 border-t border-[#E8E2DB] flex justify-between items-end">
            <span className="text-xs font-bold text-[#8A8580] uppercase tracking-widest">Grand Total</span>
            <span className="text-3xl font-bold font-mono text-[#1A1A1A] leading-none tracking-tight">{CURRENCY_SYMBOL}{orderData.total.toLocaleString('en-IN')}</span>
          </div>
        </motion.div>

        {/* Right: Shipping & Payment */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: easePremium, delay: 0.3 }}
            className="bg-white/70 backdrop-blur-2xl border border-[#E8E2DB]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 md:p-8 hover:shadow-[0_15px_30px_rgb(0,0,0,0.05)] transition-shadow duration-500"
          >
            <h3 className="text-xs font-bold text-[#8A8580] uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Shipping Address
            </h3>
            <div className="text-sm text-[#1A1A1A] space-y-1 leading-relaxed bg-[#FAF7F4]/50 p-4 rounded-2xl border border-[#E8E2DB]/50 backdrop-blur-sm">
              <p className="font-bold text-base">{orderData.shipping_address.fullName}</p>
              <p className="text-[#555555]">{orderData.shipping_address.addressLine1}</p>
              {orderData.shipping_address.addressLine2 && <p className="text-[#555555]">{orderData.shipping_address.addressLine2}</p>}
              <p className="text-[#555555]">{orderData.shipping_address.city}, {orderData.shipping_address.state} <span className="font-mono text-[#1A1A1A] font-semibold bg-white px-1.5 py-0.5 rounded border border-[#E8E2DB] shadow-sm ml-1">{orderData.shipping_address.pincode}</span></p>
              <p className="pt-2 mt-2 border-t border-[#E8E2DB]/60 text-[#555555] flex items-center gap-2">
                <span className="font-semibold text-[#1A1A1A]">Phone:</span> {orderData.shipping_address.phone}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: easePremium, delay: 0.4 }}
            className="bg-white/70 backdrop-blur-2xl border border-[#E8E2DB]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 md:p-8 hover:shadow-[0_15px_30px_rgb(0,0,0,0.05)] transition-shadow duration-500"
          >
            <h3 className="text-xs font-bold text-[#8A8580] uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Payment Information
            </h3>
            <div className="text-sm space-y-2 bg-[#FAF7F4]/50 p-4 rounded-2xl border border-[#E8E2DB]/50 backdrop-blur-sm">
              <div className="flex justify-between items-center border-b border-[#E8E2DB]/60 pb-2">
                <span className="text-[#555555] font-medium">Method</span>
                <span className="text-[#1A1A1A] font-bold">Razorpay</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E8E2DB]/60 pb-2">
                <span className="text-[#555555] font-medium">Status</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/50 border border-emerald-200 px-2.5 py-0.5 rounded-md capitalize tracking-wide text-[10px] uppercase">
                  {orderData.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#555555] font-medium">Transaction ID</span>
                <span className="text-[#1A1A1A] font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-[#E8E2DB] shadow-sm">
                  {orderData.payment_id || orderData.razorpay_payment_id || 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
