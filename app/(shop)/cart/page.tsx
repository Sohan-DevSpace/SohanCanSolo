'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useCartStore, type Coupon } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { User, UserPlus, X, LogIn, ArrowRight } from 'lucide-react'
import { CURRENCY_SYMBOL, SITE_URL } from '@/constants/config'
import { JsonLd } from '@/components/shared/JsonLd'
import {
  AnimatedAlertCircle,
  AnimatedArrowLeft,
  AnimatedCart,
  AnimatedCheck,
  AnimatedHeart,
  AnimatedLock,
  AnimatedSparkles,
  AnimatedTrash,
} from '@/components/shared/AnimatedIcons'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { MorphingIcon } from '@/components/shared/MorphingIcon'
import toast from 'react-hot-toast'

const FREE_SHIPPING_THRESHOLD = 499

const format = (n: number) => `${CURRENCY_SYMBOL}${n.toLocaleString('en-IN')}`

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

// ─── Toast helpers ──────────────────────────────────────────────────────────────
const showToast = (message: string, type: 'success' | 'error') => {
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#1A1A1A] px-5 py-3.5 text-[13px] text-white shadow-matte-lg"
      >
        {type === 'success' ? (
          <AnimatedCheck size={18} className="text-[#B8763C]" />
        ) : (
          <AnimatedAlertCircle size={18} className="text-red-400" />
        )}
        {message}
      </div>
    ),
    { duration: 3000 },
  )
}

// ─── Free shipping progress rail ──────────────────────────────────────────────
function FreeShippingRail({ activeTotal }: { activeTotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - activeTotal)
  const progress = Math.min((activeTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const unlocked = remaining === 0

  return (
    <div className="mb-8 rounded-2xl border border-border/80 bg-gradient-to-r from-white via-[#FAF7F4]/50 to-white p-5 shadow-matte-sm select-none">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-bold text-neutral-800">
          {unlocked ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, ease: 'easeOut', repeat: Infinity, repeatDelay: 3 }}
            >
              <AnimatedCheck size={16} className="text-ring" />
            </motion.div>
          ) : (
            <AnimatedSparkles size={16} className="text-ring" />
          )}
          {unlocked ? 'Complimentary Express Delivery Unlocked' : 'Free Shipping Goal'}
        </span>
        {!unlocked && (
          <span className="text-[11px] font-medium text-neutral-500">
            Add {format(remaining)} more
          </span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-ring via-[#C87533] to-ring"
        />
        {unlocked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
          />
        )}
      </div>
      <p className="mt-2 text-[11px] font-medium text-muted-foreground">
        {unlocked
          ? 'Your order qualifies for complimentary express delivery across India.'
          : `Add ${format(remaining)} more of custom apparel to unlock free express delivery.`}
      </p>
    </div>
  )
}

// ─── Summary row ───────────────────────────────────────────────────────────────
function SummaryRow({ label, value, className = '' }: { label: ReactNode; value: ReactNode; className?: string }) {
  return <div className={`flex justify-between items-center ${className}`}>{label}{value}</div>
}

// ─── Order summary ─────────────────────────────────────────────────────────────
interface OrderSummaryProps {
  activeTotal: number
  shipping: number
  appliedCoupon: Coupon | null
  discountAmount: number
  couponCodeInput: string
  setCouponCodeInput: (v: string) => void
  isApplying: boolean
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  showCheckout: boolean
  onCheckoutClick?: (e: React.MouseEvent) => void
}

function OrderSummary({
  activeTotal,
  shipping,
  appliedCoupon,
  discountAmount,
  couponCodeInput,
  setCouponCodeInput,
  isApplying,
  onApplyCoupon,
  onRemoveCoupon,
  showCheckout,
  onCheckoutClick,
}: OrderSummaryProps) {
  const final = Math.max(0, activeTotal + shipping - discountAmount)

  return (
    <div className="space-y-6 select-none">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-display text-xl font-bold text-primary tracking-tight">Order Summary</h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Taxes and discounts calculated below.</p>
      </div>

      {/* Coupon */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-xl border border-ring/30 bg-[#FBF1E6] px-4 py-3 shadow-matte-xs">
          <span className="flex items-center gap-2 text-xs font-bold text-ring">
            <AnimatedCheck size={16} className="text-ring" />
            {appliedCoupon.code} applied
          </span>
          <button
            onClick={onRemoveCoupon}
            className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-ring hover:text-primary transition-colors active:scale-[0.97]"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCodeInput}
            onChange={(e) => setCouponCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon()}
            placeholder="PROMO CODE"
            disabled={isApplying}
            aria-label="Coupon code"
            className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary outline-none transition placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:opacity-50"
          />
          <button
            onClick={onApplyCoupon}
            disabled={isApplying || !couponCodeInput.trim()}
            className="flex min-w-[80px] shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-neutral-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 shadow-matte-xs"
          >
            {isApplying ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Apply'
            )}
          </button>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-3 text.xs font-medium text-neutral-600">
        <SummaryRow
          label={<span className="text-xs font-semibold text-neutral-600">Bag Subtotal</span>}
          value={
            <span className="font-bold tabular-nums text-primary text-sm">
              <AnimatedNumber value={activeTotal} format={format} />
            </span>
          }
        />
        <SummaryRow
          label={<span className="text-xs font-semibold text-neutral-600">Estimated Shipping</span>}
          value={
            shipping === 0 ? (
              <span className="font-bold text-ring tabular-nums text-xs uppercase tracking-wider">COMPLIMENTARY</span>
            ) : (
              <span className="font-bold tabular-nums text-primary text-sm">{format(49)}</span>
            )
          }
        />
        {appliedCoupon && (
          <SummaryRow
            label={<span className="text-xs font-semibold text-ring">Promo Discount ({appliedCoupon.code})</span>}
            value={<span className="font-bold tabular-nums text-ring text-sm">−{format(discountAmount)}</span>}
          />
        )}
        <div className="flex items-center justify-between border-t border-border/80 pt-4 text-base font-bold text-primary">
          <span className="font-display text-lg">Total Amount</span>
          <span className="tabular-nums text-xl text-primary font-bold"><AnimatedNumber value={final} format={format} /></span>
        </div>
      </div>

      {showCheckout && (
        <div className="space-y-4 pt-2">
          <Link href="/checkout" onClick={onCheckoutClick} className="block">
            <Button
              size="lg"
              className="h-12 w-full rounded-2xl bg-primary text-xs font-bold uppercase tracking-[0.15em] text-white shadow-matte-sm hover:bg-ring hover:shadow-matte-md active:scale-[0.97] transition-all duration-300 cursor-pointer"
            >
              Proceed To Checkout
            </Button>
          </Link>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 justify-center py-1 bg-secondary/50 rounded-lg">
              <AnimatedLock size={12} className="text-ring" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center py-1 bg-secondary/50 rounded-lg">
              <span>Made in India • Premium Apparel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!user && !userLoading) {
      e.preventDefault()
      setShowAuthModal(true)
    }
  }

  const {
    items,
    appliedCoupon,
    discountAmount,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [savedForLater, setSavedForLater] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [showSummary, setShowSummary] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      showToast('Please enter a coupon code', 'error')
      return
    }

    setIsApplying(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput,
          cartTotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        applyCoupon(data.coupon)
        showToast(`Coupon "${data.coupon.code}" applied`, 'success')
        setCouponCodeInput('')
      } else {
        showToast(data.error || 'Invalid coupon', 'error')
      }
    } catch {
      showToast('Failed to validate coupon', 'error')
    } finally {
      setIsApplying(false)
    }
  }

  const toggleSavedForLater = (itemId: string) => {
    setSavedForLater((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    )
  }

  const toggleExpandItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    )
  }

  // ─── Noise / grain texture ──────────────────────────────────────────────────
  const noiseBg = useMemo(
    () =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    [],
  )

  const shipping = useMemo(() => {
    const total = items.reduce(
      (s, i) => (savedForLater.includes(i.id) ? s : s + i.price * i.quantity),
      0,
    )
    return total >= FREE_SHIPPING_THRESHOLD ? 0 : 49
  }, [items, savedForLater])

  // Empty state
  if (items.length === 0) {
    return (
      <main className="flex min-h-[75vh] flex-col items-center justify-center bg-background px-4 py-16 text-center select-none">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md flex flex-col items-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-white shadow-matte-md">
            <AnimatedCart size={40} className="text-ring" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl text-balance mb-3">
            Your Bag is Empty
          </h1>
          <p className="mx-auto max-w-xs text-xs font-medium leading-relaxed text-muted-foreground mb-8">
            Discover our exclusive streetwear collections and find a custom piece designed for you.
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="h-12 rounded-full bg-primary px-8 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-matte-sm hover:bg-ring hover:shadow-matte-md active:scale-[0.97] transition-all duration-300 cursor-pointer"
            >
              Explore Collection
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  const activeItems = items.filter((item) => !savedForLater.includes(item.id))
  const savedItems = items.filter((item) => savedForLater.includes(item.id))
  const activeTotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const mobileTotal = Math.max(0, activeTotal + shipping - discountAmount)

  return (
    <main className="min-h-screen bg-background pb-28 pt-6 text-primary lg:pb-16 select-none">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Breadcrumb */}
          <motion.nav
            variants={itemVariants}
            className="mb-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground/60"
          >
            <Link href="/" className="transition-colors hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/shop" className="transition-colors hover:text-primary">Shop</Link>
            <span>/</span>
            <span className="text-primary font-bold">Shopping Bag</span>
          </motion.nav>

          {/* Header */}
          <motion.header
            variants={itemVariants}
            className="mb-8 flex items-end justify-between gap-4 border-b border-border/60 pb-6"
          >
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-ring">Atelier Selection</span>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance text-primary">Shopping Bag</h1>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground tabular-nums bg-secondary/80 px-3 py-1.5 rounded-full border border-border/50">
              {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'}
            </span>
          </motion.header>

          {/* Free shipping rail */}
          {activeTotal < FREE_SHIPPING_THRESHOLD && (
            <motion.div variants={itemVariants}>
              <FreeShippingRail activeTotal={activeTotal} />
            </motion.div>
          )}

          {/* Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-10 lg:grid-cols-12"
          >
            {/* Items */}
            <section className="space-y-5 lg:col-span-7">
              <AnimatePresence mode="popLayout">
                {activeItems.map((item) => {
                  const isExpanded = expandedItems.includes(item.id)
                  const isSaved = savedForLater.includes(item.id)
                  return (
                    <motion.article
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative rounded-2xl border border-border/60 bg-white p-4 shadow-matte-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-matte-md active:scale-[0.99] sm:p-5
                        before:pointer-events-none before:absolute before:inset-x-[1px] before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-white/60 before:via-white/90 before:to-white/60"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <Link
                          href={`/shop/${item.productId}`}
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-28 sm:w-24"
                        >
                          <Image
                            src={item.designImage || item.productImage}
                            alt={item.productName}
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-[15px] font-semibold text-[#1A1A1A]">
                                <Link
                                  href={`/shop/${item.productId}`}
                                  className="transition-colors hover:text-[#B8763C]"
                                >
                                  {item.productName}
                                </Link>
                              </h3>
                              <div className="mt-1 flex items-center gap-2 text-[12px] text-neutral-500">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-border"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                  {item.color}
                                </span>
                                <span className="text-border">/</span>
                                <span>Size {item.size}</span>
                              </div>

                              {/* Toggle details */}
                              <button
                                onClick={() => toggleExpandItem(item.id)}
                                className="mt-1.5 flex cursor-pointer items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#B8763C] transition-colors hover:text-[#9A5E24] active:scale-[0.97]"
                              >
                                {isExpanded ? 'Hide' : 'Show'} details
                                <MorphingIcon
                                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                  size={10}
                                  color="currentColor"
                                />
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 space-y-0.5 border-t border-secondary pt-2 text-[11px] text-neutral-400">
                                      {item.designName && <p>Design: {item.designName}</p>}
                                      <p>Variant ID: {item.variantId}</p>
                                      <p>Price: <AnimatedNumber value={item.price} format={format} /> each</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Price */}
                            <div className="shrink-0 text-right">
                              <p className="text-[16px] font-semibold tabular-nums text-[#1A1A1A]">
                                <AnimatedNumber value={item.price * item.quantity} format={format} />
                              </p>
                              {item.quantity > 1 && (
                                <p className="mt-0.5 text-[11px] tabular-nums text-neutral-400">
                                  <AnimatedNumber value={item.price} format={format} /> each
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="mt-4 flex items-center justify-between border-t border-secondary pt-3">
                            <div className="flex h-9 w-24 items-center rounded-full border border-border bg-white px-1">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                disabled={item.quantity <= 1}
                                onClick={() => {
                                  if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1)
                                }}
                                aria-label="Decrease quantity"
                                className="flex h-full w-7 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-[#B8763C] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-neutral-500"
                              >
                                <MorphingIcon name="minus" size={12} color="currentColor" />
                              </motion.button>
                              <motion.span
                                key={item.quantity}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="flex-1 text-center text-[13px] font-semibold tabular-nums text-[#1A1A1A]"
                              >
                                {item.quantity}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="flex h-full w-7 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-[#B8763C]"
                              >
                                <MorphingIcon name="plus" size={12} color="currentColor" />
                              </motion.button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleSavedForLater(item.id)}
                                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-neutral-500 transition-colors hover:bg-secondary hover:text-[#B8763C] transition-all duration-200 active:scale-[0.97]"
                              >
                                <AnimatedHeart
                                  size={15}
                                  filled={isSaved}
                                  className={isSaved ? 'text-[#B8763C]' : 'text-neutral-400'}
                                />
                                {isSaved ? 'Saved' : 'Save'}
                              </button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  removeItem(item.id)
                                  showToast('Removed from cart', 'success')
                                }}
                                aria-label="Remove item"
                                className="cursor-pointer rounded-full p-2 text-[#8C8375] transition-colors hover:bg-red-50 hover:text-red-500"
                              >
                                <AnimatedTrash size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>

              {/* Saved for later */}
              {savedItems.length > 0 && (
                <div className="mt-10">
                  <h3 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-neutral-700">
                    <AnimatedHeart size={16} filled className="text-[#B8763C]" />
                    Saved for later ({savedItems.length})
                  </h3>
                  <div className="space-y-3">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-xl border border-border/50 bg-white/70 p-3 transition-all duration-200"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <Image
                            src={item.designImage || item.productImage}
                            alt={item.productName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-neutral-800">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {item.color} &middot; {item.size}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[13px] font-semibold tabular-nums text-neutral-800">
                            {format(item.price)}
                          </p>
                          <button
                            onClick={() => toggleSavedForLater(item.id)}
                            className="cursor-pointer text-[10px] font-semibold text-[#B8763C] transition-colors hover:text-[#9A5E24] transition-all duration-200 active:scale-[0.97]"
                          >
                            Move to cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <motion.div whileHover={{ gap: '0.75rem' }}>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-[13px] text-neutral-500 transition-all hover:text-[#B8763C]"
                >
                  <AnimatedArrowLeft size={16} />
                  Continue shopping
                </Link>
              </motion.div>
            </section>

            {/* Desktop summary */}
            <aside className="hidden lg:col-span-5 lg:block">
              <div className="sticky top-24 rounded-3xl border border-border/60 bg-white p-6 shadow-matte-sm transition-all duration-200">
                <OrderSummary
                  activeTotal={activeTotal}
                  shipping={shipping}
                  appliedCoupon={appliedCoupon}
                  discountAmount={discountAmount}
                  couponCodeInput={couponCodeInput}
                  setCouponCodeInput={setCouponCodeInput}
                  isApplying={isApplying}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCoupon}
                  showCheckout
                  onCheckoutClick={handleCheckoutClick}
                />
              </div>
            </aside>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile bottom sheet trigger */}
      <div className="lg:hidden">
        <div className="mx-auto w-full max-w-6xl px-4">
          <button
            onClick={() => setShowSummary((v) => !v)}
            className="mt-6 flex w-full items-center justify-between rounded-2xl border border-border/60 bg-white px-5 py-4 text-[13px] font-semibold text-neutral-700 shadow-matte-sm active:scale-[0.97]"
          >
            <span>Order summary</span>
            <span className="flex items-center gap-2 text-neutral-400">
              <AnimatedNumber value={mobileTotal} format={format} />
              <MorphingIcon
                name={showSummary ? 'chevron-down' : 'chevron-up'}
                size={12}
                color="currentColor"
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {showSummary && (
          <>
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setShowSummary(false)}
            />
            <motion.div
              key="sheet-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-white p-6 shadow-matte-xl lg:hidden pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
              <OrderSummary
                activeTotal={activeTotal}
                shipping={shipping}
                appliedCoupon={appliedCoupon}
                discountAmount={discountAmount}
                couponCodeInput={couponCodeInput}
                setCouponCodeInput={setCouponCodeInput}
                isApplying={isApplying}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={removeCoupon}
                showCheckout={false}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-border bg-white/95 dark:bg-[#09090b]/95 px-4 py-3 backdrop-blur-xl lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-neutral-400">Total</p>
            <p className="text-[16px] font-semibold tabular-nums text-[#1A1A1A]">
              <AnimatedNumber value={mobileTotal} format={format} />
            </p>
          </div>
          <Link href="/checkout" onClick={handleCheckoutClick}>
            <Button
              size="lg"
              className="h-11 rounded-full bg-[#B8763C] px-6 text-[14px] font-semibold text-white shadow-matte-sm hover:bg-[#9A5E24] active:scale-[0.97]"
            >
              Checkout
            </Button>
          </Link>
        </div>
      </div>

      {/* Auth Required Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative w-full max-w-sm rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-2xl text-center select-none z-10"
            >
              {/* Header Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#B8763C]/30 bg-[#FAF7F4] text-[#B8763C] shadow-inner">
                <AnimatedLock size={28} className="text-[#B8763C]" />
              </div>

              <h3 className="mb-1.5 font-display text-xl font-bold text-[#1A1A1A] tracking-tight">
                Sign In Required to Checkout
              </h3>
              <p className="mb-6 text-xs text-neutral-500 font-medium leading-relaxed">
                Please log in or create an account to proceed with your order securely, track shipment status, and earn reward perks.
              </p>

              <div className="space-y-2.5">
                <Link
                  href="/auth/login?redirectTo=/checkout"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] text-xs font-bold uppercase tracking-[0.15em] text-white shadow-matte-sm transition-all hover:bg-[#B8763C] active:scale-[0.98]"
                >
                  <User size={15} />
                  <span>Sign In to Continue</span>
                </Link>

                <Link
                  href="/auth/signup?redirectTo=/checkout"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-[#FAF7F4] text-xs font-bold uppercase tracking-[0.15em] text-[#1A1A1A] transition-all hover:bg-[#F5F1EC] active:scale-[0.98]"
                >
                  <UserPlus size={15} />
                  <span>Create New Account</span>
                </Link>

                <div className="pt-2 border-t border-border/50">
                  <Link
                    href="/checkout"
                    onClick={() => setShowAuthModal(false)}
                    className="text-[11px] font-bold text-neutral-400 hover:text-[#B8763C] tracking-wide uppercase transition-colors inline-flex items-center gap-1"
                  >
                    <span>Or Continue as Guest</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
