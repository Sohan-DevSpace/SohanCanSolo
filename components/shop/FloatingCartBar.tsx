'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ShoppingCart, X, ChevronRight, Plus, Minus, 
  Trash2, Truck, CheckCircle2, ArrowRight, Sparkles, PartyPopper 
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

const FREE_SHIPPING_THRESHOLD = 999 // ₹999 free delivery threshold

export function FloatingCartBar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  const { items, itemCount, total, updateQuantity, removeItem } = useCartStore()

  // Hide floating cart bar when on product detail page, checkout page, or cart page
  const isProductDetailPage = pathname?.startsWith('/shop/') && pathname !== '/shop'
  const isCheckoutPage = pathname === '/checkout'
  const isCartPage = pathname === '/cart'

  // Trigger bounce effect on item count change
  useEffect(() => {
    if (itemCount <= 0) return
    setBounce(true)
    const timer = setTimeout(() => setBounce(false), 600)
    return () => clearTimeout(timer)
  }, [itemCount])

  // Trigger checking delivery simulation when drawer opens
  useEffect(() => {
    if (!isOpen) return
    setIsCheckingDelivery(true)
    const timer = setTimeout(() => setIsCheckingDelivery(false), 1000)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Calculate free delivery progress
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const isFreeShippingUnlocked = total >= FREE_SHIPPING_THRESHOLD
  const shippingProgressPct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  // Don't render anything if cart is completely empty, on product detail page, checkout page, or cart page
  if (itemCount === 0 || isProductDetailPage || isCheckoutPage || isCartPage) return null

  return (
    <div className="fixed bottom-36 md:bottom-6 right-4 md:right-24 z-40 font-sans pointer-events-auto select-none">
      <div className="relative">
        
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 1. POPOVER CART DRAWER MODAL                                     */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop Overlay for Mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden"
              />

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="absolute bottom-full mb-3 right-0 w-[calc(100vw-32px)] sm:w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[#E8E2DB] overflow-hidden z-40"
              >
                {/* Modal Header */}
                <div className="bg-[#1A1A1A] text-white px-5 py-4 flex items-center justify-between border-b border-white/10 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8763C]/10 blur-xl rounded-full pointer-events-none" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8.5 h-8.5 rounded-2xl bg-[#B8763C] text-white flex items-center justify-center shrink-0 shadow-md">
                      <ShoppingCart size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                        Your Cart
                        <span className="bg-[#B8763C]/20 text-[#E8C9A0] border border-[#B8763C]/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer relative z-10"
                    aria-label="Close cart drawer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Free Delivery Progress Banner */}
                <div className="bg-[#FAF7F4] border-b border-[#E8E2DB] px-4 py-3">
                  {isCheckingDelivery ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#B8763C] animate-pulse">
                      <svg className="animate-spin h-4 w-4 text-[#B8763C] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Checking delivery eligibility...</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-[#1A1A1A]">
                          <Truck size={14} className="text-[#B8763C]" />
                          {isFreeShippingUnlocked ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <PartyPopper className="w-4 h-4 text-emerald-600 inline" aria-hidden="true" />
                              <span>You&apos;ve unlocked</span>
                              <strong className="underline">FREE Delivery</strong>
                            </span>
                          ) : (
                            <span>Add <strong className="text-[#B8763C]">₹{amountNeededForFreeShipping.toFixed(0)}</strong> for FREE Delivery</span>
                          )}
                        </div>
                        {isFreeShippingUnlocked && <CheckCircle2 size={14} className="text-emerald-600" />}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#E8E2DB] rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${shippingProgressPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full transition-colors ${
                            isFreeShippingUnlocked ? 'bg-emerald-500' : 'bg-[#B8763C]'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-3 divide-y divide-[#E8E2DB]/50 scroll-smooth">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="pt-3 first:pt-0 flex items-center gap-3"
                      >
                        {/* Product Thumbnail */}
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#E8E2DB] bg-[#FAF7F4] shrink-0 group">
                          <Image
                            src={item.productImage || item.designImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80'}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Info & Quantity Controls */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{item.productName}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            {item.color && (
                              <span className="flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full border border-black/10 inline-block shadow-2xs" style={{ backgroundColor: item.colorHex || '#1A1A1A' }} />
                                {item.color}
                              </span>
                            )}
                            {item.size && <span className="font-bold uppercase bg-black/5 text-[#1A1A1A] px-1.5 py-0.5 rounded">Size: {item.size}</span>}
                          </div>
                          <p className="text-xs font-extrabold text-[#B8763C] mt-1 tabular-nums">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-1 bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl p-1 shrink-0 shadow-2xs">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[#1A1A1A] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Minus size={11} />
                          </motion.button>
                          <span className="w-5 text-center text-xs font-extrabold text-[#1A1A1A] tabular-nums">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[#1A1A1A] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Plus size={11} />
                          </motion.button>
                        </div>

                        {/* Trash Button */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors p-1.5 cursor-pointer shrink-0 rounded-lg hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Subtotal & Checkout Footer */}
                <div className="bg-[#FAF7F4] border-t border-[#E8E2DB] p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">Subtotal</span>
                    <span className="font-extrabold text-base text-[#1A1A1A] tabular-nums">₹{total.toFixed(2)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="group relative w-full py-4 bg-gradient-to-r from-[#B8763C] to-[#9E5F2A] hover:from-[#A06430] hover:to-[#884E20] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#B8763C]/30 transition-all duration-300 active:scale-[0.98] cursor-pointer overflow-hidden"
                  >
                    <span>Proceed to Checkout</span>
                    <span className="tabular-nums font-bold bg-white/20 px-2 py-0.5 rounded-md">₹{total.toFixed(2)}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 2. FLOATING CART PILL TRIGGER                                    */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          animate={bounce ? { scale: [1, 1.08, 0.98, 1], y: [0, -6, 2, 0] } : { scale: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={bounce ? {
            duration: 0.5,
            ease: "easeInOut"
          } : {
            type: 'spring',
            stiffness: 400,
            damping: 22
          }}
          className="relative flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#262626] text-white px-5 py-3 rounded-full shadow-[0_14px_35px_rgba(0,0,0,0.4),0_0_20px_rgba(184,118,60,0.25)] border border-[#B8763C]/40 cursor-pointer transition-all duration-300 group"
          aria-label="View Cart"
        >
          {/* Cart Icon with Counter Badge */}
          <div className="relative flex items-center justify-center">
            <ShoppingCart size={18} className="text-[#B8763C] group-hover:rotate-[-8deg] transition-transform duration-300" />
            <motion.span 
              key={itemCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="absolute -top-2.5 -right-2.5 bg-[#B8763C] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md border border-white/30"
            >
              {itemCount}
            </motion.span>
          </div>

          {/* Label */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold leading-tight tracking-wide text-white">View cart</span>
            <span className="text-[10px] text-white/70 font-medium leading-tight">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Right Chevron Indicator */}
          <div className="ml-1 w-5.5 h-5.5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ChevronRight size={13} className={`text-[#B8763C] transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        </motion.button>

      </div>
    </div>
  )
}
