'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, ShoppingBag } from 'lucide-react'

interface PurchaseEvent {
  id: string
  customerName: string
  location: string
  productTitle: string
  productImage: string
  productSlug: string
  timeAgo: string
}

const SAMPLE_PURCHASES: PurchaseEvent[] = [
  {
    id: 'p1',
    customerName: 'Rahul M.',
    location: 'Kolkata, WB',
    productTitle: 'Calcutta Technical Heritage Oversized Tee',
    productImage: 'https://res.cloudinary.com/i7j8ej5v/image/upload/v1785830081/alpona/products/aucmawjm1kxytfhppsig.jpg',
    productSlug: 'calcutta-technical-heritage-heavyweight-oversized-tee',
    timeAgo: '2 minutes ago',
  },
  {
    id: 'p2',
    customerName: 'Priya S.',
    location: 'Mumbai, MH',
    productTitle: 'Keep Growing Mountain Peak Heavyweight Tee',
    productImage: 'https://ggielaflfgkkfubwfgck.supabase.co/storage/v1/object/public/products/1785247504868-787x48echuq.png',
    productSlug: 'keep-growing-mountain-peak-heavyweight-t-shirt',
    timeAgo: '5 minutes ago',
  },
  {
    id: 'p3',
    customerName: 'Arjun K.',
    location: 'Bengaluru, KA',
    productTitle: 'Heavyweight Archive Oversized Tee',
    productImage: 'https://ggielaflfgkkfubwfgck.supabase.co/storage/v1/object/public/products/1785350996015-86hkh7cj6i.png',
    productSlug: 'heavyweight-archive-oversized-tee',
    timeAgo: '8 minutes ago',
  },
  {
    id: 'p4',
    customerName: 'Sneha D.',
    location: 'Delhi, NCR',
    productTitle: 'Essential V-Neck Streetwear Top',
    productImage: '/images/categories/tee_vneck_front_1783452468360.png',
    productSlug: 'essential-v-neck',
    timeAgo: '12 minutes ago',
  },
]

export function RecentPurchaseToast() {
  const [currentEvent, setCurrentEvent] = useState<PurchaseEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return

    // Show initial toast after 4 seconds
    const initialTimer = setTimeout(() => {
      const selected = SAMPLE_PURCHASES[Math.floor(Math.random() * SAMPLE_PURCHASES.length)]
      if (selected) {
        setCurrentEvent(selected)
        setIsVisible(true)
      }
    }, 4000)

    // Hide after 6 seconds
    const interval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        const selected = SAMPLE_PURCHASES[Math.floor(Math.random() * SAMPLE_PURCHASES.length)]
        if (selected) {
          setCurrentEvent(selected)
          setIsVisible(true)
        }
      }, 3000)
    }, 16000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [dismissed])

  if (dismissed || !currentEvent) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-5 left-5 z-50 max-w-[340px] bg-white/95 backdrop-blur-md border border-[#E8E2DB] shadow-2xl rounded-2xl p-3 select-none"
        >
          <div className="flex items-center gap-3 relative">
            {/* Product Thumbnail */}
            <Link href={`/shop/${currentEvent.productSlug}`} className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 block">
              <Image
                src={currentEvent.productImage}
                alt={currentEvent.productTitle}
                fill
                sizes="56px"
                className="object-cover"
              />
            </Link>

            {/* Notification Details */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Order</span>
              </div>
              <p className="text-xs font-semibold text-stone-900 truncate">
                <span className="font-bold text-stone-900">{currentEvent.customerName}</span> from {currentEvent.location}
              </p>
              <Link href={`/shop/${currentEvent.productSlug}`} className="text-[11px] text-[#B8763C] hover:underline font-medium block truncate">
                purchased {currentEvent.productTitle}
              </Link>
              <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                {currentEvent.timeAgo}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false)
                setDismissed(true)
              }}
              className="absolute top-0 right-0 p-1 text-stone-400 hover:text-stone-700 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
