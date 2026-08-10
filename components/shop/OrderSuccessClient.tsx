'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  ArrowRight, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag,
  Mail,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react'

// Particle explosion generator for /impeccable delight animation
function ConfettiBurst() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; rotation: number }>>([])

  useEffect(() => {
    const colors = ['#B8763C', '#10B981', '#F59E0B', '#1A1A1A', '#E8C9A0']
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.7) * 450,
      color: colors[Math.floor(Math.random() * colors.length)] || '#B8763C',
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
          animate={{ 
            x: p.x, 
            y: p.y, 
            opacity: [1, 1, 0], 
            scale: [0.5, 1.2, 0.4], 
            rotate: p.rotation 
          }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute rounded-full"
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  )
}

interface OrderSuccessClientProps {
  order: any
  items: any[]
  shippingAddress: any
}

export function OrderSuccessClient({ order, items, shippingAddress: sa }: OrderSuccessClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatPrice = (amount: number) => `${CURRENCY_SYMBOL}${Number(amount || 0).toLocaleString('en-IN')}`
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-[#FAF7F4] text-[#1A1A1A] pt-24 pb-28 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] max-w-5xl pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-[#B8763C]/10 blur-[130px]" />
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Confetti Explosion Burst */}
      {mounted && <ConfettiBurst />}

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">

        {/* HERO SUCCESS BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4"
        >
          {/* Pulsing Check Icon Badge */}
          <div className="relative inline-flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-8 ring-emerald-500/15"
            >
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.6, 2] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 rounded-full border-2 border-emerald-500/40 pointer-events-none"
            />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#B8763C] bg-[#B8763C]/10 px-3 py-1 rounded-full border border-[#B8763C]/20 inline-block mb-3">
              Payment & Order Confirmed
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed font-medium">
              Thank you! Your order <span className="font-mono font-bold text-[#B8763C]">#{order.order_number || order.id?.slice(0, 12)}</span> has entered our Express Atelier crafting pipeline.
            </p>
          </div>
        </motion.div>

        {/* ATELIER ORDER PASS RECEIPT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#E8E2DB] rounded-3xl p-6 sm:p-8 shadow-matte-md relative overflow-hidden"
        >
          {/* Top Pass Decorative Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2DB]/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Reference</span>
              <p className="font-mono text-xl font-bold text-[#1A1A1A] tracking-tight">{order.order_number || order.id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{orderDate}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                order.payment_method === 'cod'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {order.payment_method === 'cod' ? 'COD (Pending)' : 'Paid Online (Verified)'}
              </span>
            </div>
          </div>

          {/* Delivery Date Highlight Box */}
          <div className="my-6 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2DB] flex items-center justify-center text-[#B8763C] shrink-0 shadow-matte-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8763C] block">Estimated Delivery</span>
                <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                  {order.rush_order ? 'Express Priority Dispatch (2-4 Business Days)' : 'Standard Delivery (3-5 Business Days)'}
                </span>
              </div>
            </div>

            <Link href={`/track-order?order=${order.order_number || order.id}`}>
              <button className="text-xs font-bold text-[#B8763C] hover:underline flex items-center gap-1 shrink-0 cursor-pointer">
                Track Live <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Itemized Order Products List */}
          <div className="space-y-4 my-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-[#E8E2DB]/60">
              Ordered Atelier Items ({items.length})
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              {items.map((item: any) => {
                const isStudio = !item.product_name && item.qikink_product_name
                const name = isStudio ? item.qikink_product_name : item.product_name
                const imageUrl = item.design_front_url || item.design_back_url || item.designs?.image_url || (item.products?.images?.[0]) || '/images/designer_1.png'
                const color = isStudio ? item.product_base_color : item.color
                const size = isStudio ? Object.keys(item.sizes_quantities || {}).join(', ') : item.size
                const totalPx = isStudio ? order.total : item.total_price
                const qty = isStudio ? Object.values(item.sizesQuantities || item.sizes_quantities || {}).reduce((a: any, b: any) => Number(a)+Number(b), 0) : item.quantity

                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-2.5 border-b border-[#FAF7F4] last:border-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-14 h-14 bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl overflow-hidden shrink-0">
                        <Image src={imageUrl} alt={name || 'Item'} fill className="object-cover" />
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          {color && <span>Color: {color}</span>}
                          {size && <span>• Size: {size}</span>}
                          <span>• Qty: {qty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-[#1A1A1A] shrink-0">
                      {formatPrice(totalPx || (item.unit_price * item.quantity))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing Total Summary Table */}
          <div className="space-y-2 pt-4 border-t border-[#E8E2DB] text-xs font-medium text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{formatPrice(order.subtotal)}</span>
            </div>

            {order.shipping_charge > 0 ? (
              <div className="flex justify-between items-center">
                <span>Shipping Charge</span>
                <span className="font-bold text-[#1A1A1A] font-mono">{formatPrice(order.shipping_charge)}</span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-[#B8763C] font-semibold">
                <span>Shipping Option</span>
                <span className="font-bold uppercase tracking-wider">FREE</span>
              </div>
            )}

            {order.prepaid_discount > 0 && (
              <div className="flex justify-between items-center text-[#B8763C] font-semibold">
                <span>Prepaid Instant Savings</span>
                <span className="font-mono">-{formatPrice(order.prepaid_discount)}</span>
              </div>
            )}

            {order.cod_fee > 0 && (
              <div className="flex justify-between items-center">
                <span>COD Handling Fee</span>
                <span className="font-mono">{formatPrice(order.cod_fee)}</span>
              </div>
            )}

            {order.gift_wrap && (
              <div className="flex justify-between items-center">
                <span>Gift Wrapping Package</span>
                <span className="font-mono">+₹59</span>
              </div>
            )}

            {order.box_packing && (
              <div className="flex justify-between items-center">
                <span>Luxury Box Packing</span>
                <span className="font-mono">+₹29</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E8E2DB] flex justify-between items-baseline text-[#1A1A1A]">
              <span className="text-base font-bold font-display">Total Amount Paid</span>
              <span className="text-2xl font-bold font-mono text-[#B8763C]">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* 2-COLUMN DETAILS: SHIPPING ADDRESS & NOTIFICATION NOTICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 mt-6 border-t border-[#E8E2DB]">
            
            {/* Delivery Address Box */}
            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B8763C] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs font-bold text-[#1A1A1A]">{sa.fullName || sa.full_name || sa.name}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {sa.addressLine1 || sa.address_line1} {sa.addressLine2 || sa.address_line2 ? `, ${sa.addressLine2 || sa.address_line2}` : ''}<br />
                {sa.city}, {sa.state} - {sa.pincode}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground pt-1">+91 {sa.phone}</p>
            </div>

            {/* Notification Confirmation Box */}
            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl p-4 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B8763C] mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Order Confirmation</span>
                </div>
                <p className="text-xs font-bold text-[#1A1A1A]">Live Tracking Updates</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  A receipt and dispatch tracking link have been sent to your email. You can also track shipment status anytime using your Order ID.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Guaranteed Fulfillment
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ACTION BUTTONS BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href={`/track-order?order=${order.order_number || order.id}`} className="flex-1">
            <Button size="lg" className="w-full bg-[#1A1A1A] hover:bg-[#B8763C] text-white font-bold text-xs uppercase tracking-[0.15em] h-14 rounded-2xl transition-all duration-300 shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Track Order Status</span>
            </Button>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-6 h-14 rounded-2xl border border-[#E8E2DB] bg-white hover:bg-[#FAF7F4] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-matte-xs"
          >
            <Printer className="w-4 h-4 text-muted-foreground" />
            <span>Print Receipt</span>
          </button>

          <Link href="/shop" className="flex-1">
            <Button size="lg" variant="outline" className="w-full border-[#E8E2DB] bg-white hover:bg-[#FAF7F4] hover:text-[#B8763C] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider h-14 rounded-2xl transition-all duration-300 shadow-matte-xs cursor-pointer active:scale-95 flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
