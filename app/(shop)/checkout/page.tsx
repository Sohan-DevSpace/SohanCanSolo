'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { useUser } from '@/hooks/useUser'
import { CURRENCY_SYMBOL } from '@/constants/config'
import toast from 'react-hot-toast'
import axios from 'axios'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import {
  AnimatedLock,
  AnimatedCheck,
  AnimatedArrowLeft,
  AnimatedMail,
  AnimatedHome,
  AnimatedPlus,
  AnimatedTag
} from '@/components/shared/AnimatedIcons'
import {
  Briefcase,
  Truck,
  Zap,
  ShieldCheck,
  RotateCcw,
  Printer,
  Heart,
  X,
  Gift,
  PackageCheck,
  CreditCard,
  Banknote,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShoppingBag,
  Lock,
  Plus,
  Tag,
  Sparkles
} from 'lucide-react'

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
]

interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  pincode: string
  is_default: boolean
}

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { items, total, discountAmount, appliedCoupon, applyCoupon, removeCoupon, finalTotal, clearCart } = useCartStore()
  const { user, profile, loading: userLoading } = useUser()

  const [hydrated, setHydrated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  // Mobile Summary Accordion State
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  // Shipping & Payment Selections
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid')

  // Add-on Selections
  const [giftWrap, setGiftWrap] = useState(false)
  const [boxPacking, setBoxPacking] = useState(false)

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'West Bengal',
    pincode: '',
    is_default: false,
  })

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  // Smart Coupon Auto-Suggestion State
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])
  const [bestCoupon, setBestCoupon] = useState<any>(null)
  const [showCouponDrawer, setShowCouponDrawer] = useState(false)

  // Fetch Available Coupons & Calculate Best Coupon Recommendation
  useEffect(() => {
    if (total > 0) {
      fetch(`/api/coupons/available?cartTotal=${total}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailableCoupons(data.coupons || [])
            setBestCoupon(data.bestCoupon || null)
          }
        })
        .catch(err => console.error('Error fetching available coupons:', err))
    }
  }, [total])

  // Edit Email State
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [contactEmail, setContactEmail] = useState('')

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (user?.email) {
      setContactEmail(user.email)
    }
  }, [user])

  // Handle Escape key dismiss for Address Form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddressForm) {
        setShowAddressForm(false)
        setEditingAddress(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAddressForm])

  // Handle Gift Wrap Toggle
  const handleGiftWrapToggle = (checked: boolean) => {
    setGiftWrap(checked)
  }

  // Fetch Saved Addresses
  const fetchAddresses = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return
    }

    if (data && data.length > 0) {
      setAddresses(data)
      const defaultAddr = data.find(a => a.is_default) || data[0]
      setSelectedAddressId(defaultAddr.id)
    } else {
      setAddresses([])
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user, fetchAddresses])

  // Redirect to cart if empty
  useEffect(() => {
    if (hydrated && items.length === 0 && !isProcessing) {
      router.push('/cart')
    }
  }, [items, router, isProcessing, hydrated])

  // Precise Cost Calculations
  const rushOrder = shippingMethod === 'express'
  const shippingCost = shippingMethod === 'express' ? 100 : 0
  const prepaidDiscount = paymentMethod === 'prepaid' ? 50 : 0
  const codFee = paymentMethod === 'cod' ? 49 : 0
  const giftWrapCost = giftWrap ? 59 : 0
  const boxPackingCost = boxPacking ? 29 : 0

  const amountToPay = Math.max(
    0,
    finalTotal + shippingCost - prepaidDiscount + codFee + giftWrapCost + boxPackingCost
  )

  // Dynamic Estimated Delivery Date Calculation
  const estimatedDeliveryDate = useMemo(() => {
    const today = new Date()
    const daysToAdd = shippingMethod === 'express' ? 2 : 6
    const delivery = new Date(today.setDate(today.getDate() + daysToAdd))
    return delivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }, [shippingMethod])

  // Address & Contact Form Validation Status
  const selectedAddr = useMemo(() => addresses.find(a => a.id === selectedAddressId), [addresses, selectedAddressId])
  const isAddressValid = Boolean(selectedAddr || (addresses.length === 0 && showAddressForm && addressForm.full_name && addressForm.phone && addressForm.address_line1 && addressForm.city && addressForm.pincode))
  const isContactValid = Boolean(contactEmail && contactEmail.includes('@'))

  const formatPrice = (val: number) => `${CURRENCY_SYMBOL}${val.toLocaleString('en-IN')}`

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Handle Save Address Form
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!addressForm.full_name || !addressForm.phone || !addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill in all required address fields.')
      return
    }

    if (!/^\d{10}$/.test(addressForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number.')
      return
    }

    if (!/^\d{6}$/.test(addressForm.pincode)) {
      toast.error('Please enter a valid 6-digit pincode.')
      return
    }

    try {
      if (addressForm.is_default || addresses.length === 0) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      }

      const payload = {
        user_id: user.id,
        full_name: addressForm.full_name,
        phone: addressForm.phone,
        address_line1: addressForm.address_line1,
        address_line2: addressForm.address_line2 || null,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        is_default: addressForm.is_default || addresses.length === 0,
      }

      if (editingAddress) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', editingAddress.id)
        if (error) throw error
        toast.success('Address updated successfully')
      } else {
        const { data, error } = await supabase.from('addresses').insert(payload).select().single()
        if (error) throw error
        if (data) setSelectedAddressId(data.id)
        toast.success('New address added')
      }

      await fetchAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address')
    }
  }

  const handleEditClick = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    })
    setShowAddressForm(true)
  }

  const handleApplyCouponCode = async () => {
    if (!couponCodeInput.trim()) return
    setCouponError('')
    setIsApplyingCoupon(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput.trim().toUpperCase(), cartTotal: total })
      })
      const data = await res.json()
      if (res.ok && data.coupon) {
        applyCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue
        })
        toast.success('Coupon applied successfully!')
        setCouponCodeInput('')
        setCouponError('')
      } else {
        const errMsg = data.error || 'Invalid or expired coupon code'
        setCouponError(errMsg)
        toast.error(errMsg)
      }
    } catch (err) {
      setCouponError('Failed to apply coupon. Please try again.')
      toast.error('Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleApplySpecificCoupon = async (codeToApply: string) => {
    setCouponCodeInput(codeToApply)
    setCouponError('')
    setIsApplyingCoupon(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToApply.toUpperCase(), cartTotal: total })
      })
      const data = await res.json()
      if (res.ok && data.coupon) {
        applyCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue
        })
        toast.success(`Promo code "${data.coupon.code}" applied!`)
        setCouponCodeInput('')
        setCouponError('')
      } else {
        const errMsg = data.error || 'Failed to apply coupon'
        setCouponError(errMsg)
        toast.error(errMsg)
      }
    } catch (err) {
      setCouponError('Failed to apply coupon')
      toast.error('Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  // Handle Submit Order
  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error('You must be logged in to checkout.')
      router.push('/auth/login?returnUrl=/checkout')
      return
    }

    const currentSelectedAddr = addresses.find(a => a.id === selectedAddressId)
    if (!currentSelectedAddr && addresses.length > 0) {
      toast.error('Please select a shipping address.')
      return
    }

    if (addresses.length === 0 && !showAddressForm) {
      setShowAddressForm(true)
      toast.error('Please add a shipping address to proceed.')
      return
    }

    const shippingAddressPayload = currentSelectedAddr ? {
      name: currentSelectedAddr.full_name,
      address: `${currentSelectedAddr.address_line1} ${currentSelectedAddr.address_line2 || ''}`,
      city: currentSelectedAddr.city,
      state: currentSelectedAddr.state,
      pincode: currentSelectedAddr.pincode,
      phone: currentSelectedAddr.phone,
    } : {
      name: addressForm.full_name,
      address: `${addressForm.address_line1} ${addressForm.address_line2 || ''}`,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      phone: addressForm.phone,
    }

    setIsProcessing(true)

    // CASH ON DELIVERY FLOW
    if (paymentMethod === 'cod') {
      try {
        const res = await axios.post('/api/orders/create-cod', {
          cartItems: items,
          shippingAddress: shippingAddressPayload,
          userId: user.id,
          couponCode: appliedCoupon?.code,
          discountAmount,
          giftWrap,
          boxPacking,
          rushOrder,
          shippingCost,
        })

        if (res.data.success) {
          clearCart()
          toast.success('COD Order Placed Successfully!')
          router.push(`/order/success?orderId=${res.data.orderId}`)
        }
      } catch (err: any) {
        console.error('COD Order Error:', err)
        toast.error(err.response?.data?.error || 'Failed to place COD order. Please try again.')
        setIsProcessing(false)
      }
      return
    }

    // PAY ONLINE PREPAID FLOW (RAZORPAY)
    try {
      const res = await axios.post('/api/razorpay/create-order', {
        amount: Math.round(amountToPay * 100),
      })

      const orderPayload = res.data?.data || res.data
      const orderId = orderPayload.orderId
      const amount = orderPayload.amount
      const currency = orderPayload.currency || 'INR'
      const keyId = orderPayload.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TOOEkheg0OiebM'

      if (!keyId) {
        toast.error('Razorpay API Key missing. Please check settings.')
        setIsProcessing(false)
        return
      }

      const resScript = await loadRazorpayScript()
      if (!resScript) {
        toast.error('Razorpay SDK failed to load. Are you online?')
        setIsProcessing(false)
        return
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Alpona',
        description: 'Custom Apparel Order',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post('/api/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems: items,
              shippingAddress: shippingAddressPayload,
              userId: user.id,
              couponCode: appliedCoupon?.code,
              discountAmount,
              giftWrap,
              boxPacking,
              rushOrder,
              prepaidDiscount,
              shippingCost,
            })

            if (verifyRes.data.success) {
              clearCart()
              toast.success('Payment successful!')
              router.push(`/order/success?orderId=${verifyRes.data.orderId}`)
            }
          } catch (error: any) {
            console.error('Payment verification failed:', error)
            toast.error('Payment verification failed. Please contact support.')
            setIsProcessing(false)
          }
        },
        prefill: {
          name: shippingAddressPayload.name || profile?.full_name || 'Customer',
          email: contactEmail || user.email,
          contact: shippingAddressPayload.phone || profile?.phone || '',
        },
        theme: {
          color: '#B8763C',
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed')
        setIsProcessing(false)
      })
      paymentObject.open()

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.response?.data?.error || 'We could not complete your checkout. Please verify payment details or connection.')
      setIsProcessing(false)
    }
  }

  if (userLoading || !hydrated) {
    return (
      <div className="min-h-[75vh] bg-background flex flex-col items-center justify-center select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="w-14 h-14 border-2 border-border border-t-ring rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-4 h-4 text-ring" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Preparing Secure Checkout</p>
            <p className="text-[11px] text-muted-foreground font-medium">Encrypting your session...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-primary pt-4 pb-28 lg:pb-16 font-sans select-none relative">
      {/* Subtle branded background texture */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(184,118,60,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-ring/3 rounded-full blur-[150px]" />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 relative z-10">
        
        {/* Top Breadcrumb & Return Action */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between border-b border-border/60 pb-4"
        >
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
            <AnimatedArrowLeft size={16} className="text-ring group-hover:-translate-x-1 transition-transform" />
            <span>Return to Shopping Bag</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60">
            <Lock className="w-3 h-3 text-ring" />
            <span className="text-primary font-bold">Secure Checkout</span>
            <ChevronRight className="w-3 h-3" />
            <span>Confirmation</span>
          </div>
        </motion.div>

        {/* MOBILE TOP ORDER SUMMARY ACCORDION */}
        <div className="lg:hidden mb-6">
          <div 
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="bg-primary text-white p-4 rounded-2xl flex items-center justify-between cursor-pointer shadow-matte-md relative overflow-hidden">
            {/* Subtle shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ring/60 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-ring" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ring text-white text-[8px] font-bold flex items-center justify-center">{items.length}</span>
              </div>
              <span className="text-xs font-bold tracking-wide">
                {showMobileSummary ? 'Hide Order Summary' : 'Show Order Summary'}
              </span>
              <ChevronDown className={`w-4 h-4 text-ring transition-transform duration-300 ${showMobileSummary ? 'rotate-180' : ''}`} />
            </div>
            <span className="font-mono text-sm font-bold text-white tabular-nums">
              {formatPrice(amountToPay)}
            </span>
          </div>

          <AnimatePresence>
            {showMobileSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border border-border/80 border-t-0 rounded-b-2xl p-4 space-y-3 shadow-matte-md overflow-hidden"
              >
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs border-b border-secondary pb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-secondary rounded-xl overflow-hidden shrink-0 border border-border/60">
                          <Image src={item.designImage || item.productImage} alt={item.productName} fill className="object-cover" sizes="48px" />
                        </div>
                        <div>
                          <p className="font-bold text-primary truncate max-w-[160px]">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground">Qty: {item.quantity} • {item.size} • {item.color}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-primary tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/60 flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground">Total Due:</span>
                  <span className="text-primary font-mono text-base">{formatPrice(amountToPay)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Header & Stepper */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/80">
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-ring">Express Atelier Fulfillment</span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">Delivery & Payment</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Review your delivery address, shipping preferences, and payment method.</p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center gap-1.5 sm:gap-3 self-start md:self-auto bg-white border border-border/80 rounded-2xl px-4 py-2.5 shadow-matte-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-ring text-white flex items-center justify-center shadow-matte-xs">
                  <AnimatedCheck size={14} />
                </div>
                <span className="text-xs font-bold text-primary hidden sm:inline">Bag</span>
              </div>

              <div className="w-8 h-[2px] bg-ring rounded-full" />

              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-7 h-7 rounded-full bg-ring text-white flex items-center justify-center shadow-matte-sm ring-2 ring-ring/20"
                >
                  2
                </motion.div>
                <span className="text-xs font-bold text-ring">Fulfillment</span>
              </div>

              <div className="w-8 h-[2px] bg-border rounded-full" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary border border-border text-muted-foreground flex items-center justify-center text-[10px] font-bold">
                  3
                </div>
                <span className="text-xs font-bold text-muted-foreground hidden sm:inline">Complete</span>
              </div>
            </div>
          </motion.div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

            {/* LEFT COLUMN: Checkout Form Steps */}
            <div className="lg:col-span-7 space-y-8">

              {/* SECTION 1: Contact Information */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-matte-xs transition-colors duration-300 ${isContactValid ? 'bg-ring text-white' : 'bg-primary text-white'}`}>
                    {isContactValid ? <AnimatedCheck size={14} /> : '1'}
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-primary tracking-tight">Contact Information</h2>
                </div>

                <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-matte-sm transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary border border-border/60 flex items-center justify-center text-ring shrink-0">
                        <AnimatedMail size={20} />
                      </div>
                      {isEditingEmail ? (
                        <div className="flex-1 max-w-sm space-y-1">
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-3 py-2 bg-secondary/40 border border-ring rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                            autoFocus
                          />
                          <p className="text-[10px] text-muted-foreground">Order confirmation and tracking will be sent here</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-xs font-bold text-primary block truncate">{contactEmail || user?.email || 'Guest User'}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground block truncate">Order confirmation and live tracking updates will be sent here</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="px-4 py-2 rounded-xl border border-border hover:bg-secondary hover:border-ring/40 text-xs font-bold text-primary transition-all shrink-0 cursor-pointer active:scale-95 min-h-[38px]"
                    >
                      {isEditingEmail ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* SECTION 2: Shipping Address */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-matte-xs transition-colors duration-300 ${isAddressValid ? 'bg-ring text-white' : 'bg-primary text-white'}`}>
                      {isAddressValid ? <AnimatedCheck size={14} /> : '2'}
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-primary tracking-tight">Shipping Address</h2>
                  </div>
                  {addresses.length > 0 && !showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddress(null)
                        setAddressForm({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                          address_line1: '',
                          address_line2: '',
                          city: '',
                          state: 'West Bengal',
                          pincode: '',
                          is_default: addresses.length === 0,
                        })
                        setShowAddressForm(true)
                      }}
                      className="text-xs font-bold text-ring hover:underline flex items-center gap-1 cursor-pointer min-h-[44px] px-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  )}
                </div>

                {/* Compact Space-Efficient Saved Address Grid */}
                {addresses.length > 0 && !showAddressForm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {addresses.map((addr, idx) => {
                      const isSelected = selectedAddressId === addr.id
                      const isHome = idx % 2 === 0

                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative active:scale-[0.98] ${
                            isSelected
                              ? 'bg-secondary/80 border-ring shadow-matte-sm ring-1 ring-ring/30'
                              : 'bg-white border-border/80 hover:bg-secondary/30 hover:border-border'
                          }`}
                        >
                          <div>
                            {/* Card Header: Icon, Type & Radio Indicator */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white border border-border/60 flex items-center justify-center text-ring shrink-0 shadow-matte-xs">
                                  {isHome ? <AnimatedHome size={16} /> : <Briefcase className="w-3.5 h-3.5 text-ring" />}
                                </div>
                                <span className="text-xs font-bold text-primary">{isHome ? 'Home' : 'Work'}</span>
                                {addr.is_default && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-ring bg-ring/10 border border-ring/20 px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>

                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected ? 'border-ring bg-ring' : 'border-border bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            {/* Recipient Details & Address */}
                            <div className="space-y-0.5 my-1">
                              <p className="text-xs font-bold text-primary truncate">{addr.full_name}</p>
                              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                                {addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                          </div>

                          {/* Footer: Phone & Inline Edit Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-3">
                            <span className="text-[11px] font-semibold text-muted-foreground font-mono">+91 {addr.phone}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClick(addr)
                              }}
                              className="text-xs font-bold text-ring hover:underline px-1.5 py-0.5 cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Empty State / Add Address Button */}
                {addresses.length === 0 && !showAddressForm && (
                  <button
                    onClick={() => {
                      setEditingAddress(null)
                      setAddressForm({
                        full_name: profile?.full_name || '',
                        phone: profile?.phone || '',
                        address_line1: '',
                        address_line2: '',
                        city: '',
                        state: 'West Bengal',
                        pincode: '',
                        is_default: true,
                      })
                      setShowAddressForm(true)
                    }}
                    className="w-full py-5 px-5 rounded-2xl border-2 border-dashed border-border hover:border-ring bg-white hover:bg-secondary/40 text-xs font-bold text-primary hover:text-ring flex items-center justify-center gap-2 transition-all cursor-pointer shadow-matte-xs active:scale-[0.99] min-h-[52px]"
                  >
                    <AnimatedPlus size={18} /> Add Your Delivery Address
                  </button>
                )}

                {/* Inline Address Form */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSaveAddress}
                      className="bg-white border border-border/80 rounded-2xl p-6 space-y-4 shadow-matte-md"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-border/60">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                          {editingAddress ? 'Edit Delivery Address' : 'Add New Shipping Address'}
                        </h3>
                        <div className="flex items-center">
                          <span className="hidden sm:inline text-[10px] text-muted-foreground/80 mr-2 font-mono">Press Esc to close</span>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.full_name}
                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                            placeholder="Sohan Das"
                            className="w-full px-3.5 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all min-h-[44px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">Phone Number *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="9876543210"
                            className="w-full px-3.5 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all font-mono min-h-[44px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Address Line 1 *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.address_line1}
                          onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                          placeholder="House / Flat No, Street, Building"
                          className="w-full px-3.5 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all min-h-[44px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.address_line2}
                          onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                          placeholder="Landmark, Apartment Name"
                          className="w-full px-3.5 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all min-h-[44px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">City *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder="Kolkata"
                            className="w-full px-3.5 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all min-h-[44px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">Pincode *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            placeholder="700089"
                            className="w-full px-3.5 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all font-mono min-h-[44px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground">State *</label>
                          <select
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-3 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all min-h-[44px]"
                          >
                            {INDIAN_STATES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="is_default_check"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                          className="w-4 h-4 rounded border-border text-ring focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="is_default_check" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                          Set as default delivery address
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary min-h-[44px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-ring text-white text-xs font-bold transition-all shadow-matte-xs cursor-pointer active:scale-95 min-h-[44px]"
                        >
                          Save Address
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* SECTION 3: Shipping Method with Dynamic Estimate */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-ring text-white flex items-center justify-center text-xs font-bold shadow-matte-xs">
                      3
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-primary tracking-tight">Shipping Option</h2>
                  </div>
                  <div className="bg-ring/10 border border-ring/20 rounded-xl px-3 py-1.5">
                    <span className="text-[11px] font-bold text-ring">Est. Delivery: {estimatedDeliveryDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard Shipping */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShippingMethod('standard')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 min-h-[100px] ${
                      shippingMethod === 'standard'
                        ? 'bg-secondary/70 border-ring shadow-matte-sm ring-1 ring-ring/30'
                        : 'bg-white border-border/80 hover:bg-secondary/30 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          shippingMethod === 'standard' ? 'border-ring bg-ring' : 'border-border bg-white'
                        }`}>
                          {shippingMethod === 'standard' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white border border-border/60 flex items-center justify-center text-primary shadow-matte-xs">
                          <Truck className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ring bg-ring/10 border border-ring/20 px-2 py-0.5 rounded-md">
                        FREE
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-primary">Standard Delivery</h4>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">5-7 business days across India</p>
                    </div>
                  </motion.div>

                  {/* Express Shipping / Priority */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShippingMethod('express')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 min-h-[100px] ${
                      shippingMethod === 'express'
                        ? 'bg-secondary/70 border-ring shadow-matte-sm ring-1 ring-ring/30'
                        : 'bg-white border-border/80 hover:bg-secondary/30 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          shippingMethod === 'express' ? 'border-ring bg-ring' : 'border-border bg-white'
                        }`}>
                          {shippingMethod === 'express' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-matte-xs">
                          <Zap className="w-4 h-4 text-ring" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary font-mono tabular-nums">+₹100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-primary">Express Priority Dispatch</h4>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded uppercase">
                          24h Dispatch
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Dispatched in 24 hours (2-3 business days)</p>
                    </div>
                  </motion.div>
                </div>

                {/* Compact Estimated Delivery Timeline */}
                <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-matte-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-ring">
                      <PackageCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Order</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-ring via-ring/40 to-border rounded-full" />
                    <div className="flex items-center gap-2 text-ring">
                      <Printer className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Production</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-border to-border rounded-full" />
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Truck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{estimatedDeliveryDate}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* SECTION 4: Payment Method */}
              <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-ring text-white flex items-center justify-center text-xs font-bold shadow-matte-xs">
                      4
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-primary tracking-tight">Payment Method</h2>
                  </div>

                <div className="space-y-3">
                  {/* Pay Online (Recommended) */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('prepaid')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      paymentMethod === 'prepaid'
                        ? 'bg-secondary/70 border-ring shadow-matte-sm ring-1 ring-ring/30'
                        : 'bg-white border-border/80 hover:bg-secondary/30 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'prepaid' ? 'border-ring bg-ring' : 'border-border bg-white'
                        }`}>
                          {paymentMethod === 'prepaid' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-ring/10 border border-ring/20 flex items-center justify-center text-ring shrink-0 shadow-matte-xs">
                        <CreditCard className="w-5 h-5" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-primary">Pay Online (UPI / Cards / NetBanking)</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-ring bg-ring/10 px-2 py-0.5 rounded-md border border-ring/30">
                            Recommended
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px] font-medium text-muted-foreground">
                          <p className="flex items-center gap-1.5 font-bold text-ring">
                            <CheckCircle2 className="w-3.5 h-3.5 text-ring" /> Prepaid Instant Savings: Save ₹50
                          </p>
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Encrypted Payment via Razorpay
                          </p>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-ring bg-ring/10 px-2 py-0.5 rounded-lg border border-ring/30 shrink-0 hidden sm:block">
                      SAVE ₹50
                    </span>
                  </motion.div>

                  {/* Cash on Delivery (COD) */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      paymentMethod === 'cod'
                        ? 'bg-secondary/70 border-ring shadow-matte-sm ring-1 ring-ring/30'
                        : 'bg-white border-border/80 hover:bg-secondary/30 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-ring bg-ring' : 'border-border bg-white'
                        }`}>
                          {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-white border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 shadow-matte-xs">
                        <Banknote className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-primary">Cash on Delivery (COD)</h4>
                        <p className="text-[11px] font-medium text-muted-foreground">Pay cash at your doorstep upon delivery</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-muted-foreground font-mono tabular-nums shrink-0">
                      +₹49 Fee
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* SECTION 5: Add-on Services with Visual Thumbnails */}
              <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-ring text-white flex items-center justify-center text-xs font-bold shadow-matte-xs">
                      5
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-primary tracking-tight">Atelier Add-on Services</h2>
                  </div>

                <div className="bg-white border border-border/80 rounded-2xl p-5 space-y-3.5 shadow-matte-sm">

                  {/* Gift Wrap Toggle with Visual Preview Thumbnail */}
                  <div
                    onClick={() => setGiftWrap(!giftWrap)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden ${
                      giftWrap ? 'bg-ring/5 border-ring shadow-matte-sm' : 'border-border/60 hover:bg-secondary/30'
                    }`}
                  >
                    {/* Premium gradient accent */}
                    {giftWrap && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-ring via-amber-400 to-ring" />}
                    <div className="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        checked={giftWrap}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-border text-ring focus:ring-0 cursor-pointer"
                      />
                      
                      {/* Visual 40x40 Icon Preview */}
                      <div className="w-10 h-10 rounded-xl border border-pink-200 shrink-0 bg-pink-50 flex items-center justify-center text-pink-600 shadow-matte-xs">
                        <Gift className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-primary">Gift Wrapping & Custom Card</h4>
                          <span className="text-[9px] font-bold text-ring bg-ring/10 px-1.5 py-0.5 rounded border border-ring/20">
                            Includes Box
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground">Silk ribbon presentation wrap + personalized greeting card</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-primary font-mono tabular-nums shrink-0">+₹59</span>
                  </div>

                  {/* Box Packing Toggle with Visual Preview Badge */}
                  <div
                    onClick={() => setBoxPacking(!boxPacking)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      boxPacking ? 'bg-amber-500/10 border-amber-500/60 shadow-matte-sm' : 'border-border/60 hover:bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        checked={boxPacking}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setBoxPacking(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-border text-ring focus:ring-0 cursor-pointer"
                      />
                      
                      {/* Visual 40x40 Icon Preview */}
                      <div className="w-10 h-10 rounded-xl border border-amber-200 shrink-0 bg-amber-50 flex items-center justify-center text-amber-700 shadow-matte-xs">
                        <Briefcase className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-primary">Luxury Rigid Presentation Box</h4>
                        <p className="text-[11px] font-medium text-muted-foreground">Protective heavy-cardboard keepsake box</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-primary font-mono tabular-nums shrink-0">+₹29</span>
                  </div>

                </div>
              </motion.div>

            </div>


            {/* RIGHT COLUMN: Luxury Order Summary Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">

                {/* Main Summary Container */}
                <div className="rounded-3xl overflow-hidden shadow-matte-md border border-border/80 bg-white">
                  {/* Dark Card Header */}
                  <div className="bg-primary text-white p-6 relative overflow-hidden border-b border-ring/30">
                    {/* Radial glow effect */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-ring/15 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-ring/10 rounded-full blur-[40px] pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ring">
                          Atelier Selection
                        </span>
                        <h3 className="font-display text-2xl font-bold tracking-tight text-white mt-0.5">Order Summary</h3>
                      </div>
                      <Link href="/cart">
                        <button className="px-3.5 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer active:scale-95">
                          Edit Bag
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Summary Content Body */}
                  <div className="p-6 space-y-6">

                    {/* Product Items List */}
                    <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-secondary last:border-0">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-14 h-14 bg-secondary border border-border/60 rounded-xl overflow-hidden shrink-0">
                              <Image
                                src={item.designImage || item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ring text-white text-[10px] font-bold flex items-center justify-center shadow-matte-xs font-mono">
                                {item.quantity}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-primary line-clamp-1">{item.productName}</h4>
                              <p className="text-[11px] font-medium text-muted-foreground">Color: {item.color} • Size: {item.size}</p>
                              <p className="text-[11px] font-medium text-muted-foreground">
                                Print: {item.designNameBack ? 'Front & Back' : item.designName ? 'Front' : 'Standard'}
                              </p>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-primary font-mono tabular-nums shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Itemized Pricing Breakdown */}
                    <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs font-medium text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Bag Subtotal</span>
                        <span className="font-bold text-primary font-mono tabular-nums">{formatPrice(total)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Shipping Option</span>
                        <span className={`font-bold font-mono ${shippingCost === 0 ? 'text-ring uppercase tracking-wider' : 'text-primary tabular-nums'}`}>
                          {shippingMethod === 'standard' ? 'FREE' : `${CURRENCY_SYMBOL}100 (Express)`}
                        </span>
                      </div>

                      {paymentMethod === 'prepaid' && (
                        <div className="flex justify-between items-center text-ring font-semibold">
                          <span>Prepaid Instant Savings</span>
                          <span className="font-mono tabular-nums">-₹50</span>
                        </div>
                      )}

                      {paymentMethod === 'cod' && (
                        <div className="flex justify-between items-center text-primary font-semibold">
                          <span>COD Handling Fee</span>
                          <span className="font-mono tabular-nums">+₹49</span>
                        </div>
                      )}

                      {giftWrap && (
                        <div className="flex justify-between items-center text-primary">
                          <span>Gift Wrapping Package</span>
                          <span className="font-mono tabular-nums">+₹59</span>
                        </div>
                      )}

                      {boxPacking && (
                        <div className="flex justify-between items-center text-primary">
                          <span>Luxury Box Packing</span>
                          <span className="font-mono tabular-nums">+₹29</span>
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-ring font-semibold">
                          <span className="flex items-center gap-1.5">
                            Promo Discount ({appliedCoupon.code})
                            <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                          <span className="font-mono tabular-nums">-{formatPrice(discountAmount)}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border/80 flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-primary font-display">Total Amount</span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">(Incl. of all taxes)</span>
                        </div>
                        <span className="text-2xl font-bold text-primary font-mono tabular-nums tracking-tight">
                          <AnimatedNumber value={amountToPay} format={formatPrice} />
                        </span>
                      </div>
                    </div>

                    {/* PROMO CODE & SMART COUPON SUGGESTIONS SECTION */}
                    <div className="space-y-3 pt-1">
                      {/* 1. Best Coupon Auto-Recommendation Card */}
                      {bestCoupon && !appliedCoupon && (
                        <div className="bg-gradient-to-r from-amber-500/10 via-ring/10 to-amber-500/10 border border-ring/30 rounded-xl p-3 flex items-center justify-between gap-2 shadow-matte-xs animate-in fade-in duration-300">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-ring text-white flex items-center justify-center shrink-0 shadow-matte-xs">
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-ring bg-ring/10 px-1.5 py-0.2 rounded border border-ring/20">
                                  Best Offer
                                </span>
                                <span className="text-xs font-bold text-primary font-mono">{bestCoupon.code}</span>
                              </div>
                              <p className="text-[11px] font-bold text-ring truncate mt-0.5">
                                Save {formatPrice(bestCoupon.calculatedDiscount)} on this order!
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleApplySpecificCoupon(bestCoupon.code)}
                            className="px-3 py-1.5 rounded-lg bg-ring hover:bg-ring/90 text-white text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer active:scale-95 shadow-matte-xs"
                          >
                            Auto-Apply
                          </button>
                        </div>
                      )}

                      {/* 2. Promo Input or Applied Badge */}
                      {appliedCoupon ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-emerald-800">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Coupon &quot;{appliedCoupon.code}&quot; Applied (-{formatPrice(discountAmount)})</span>
                          </div>
                          <button onClick={removeCoupon} className="text-emerald-700 hover:text-red-600 transition-colors p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={couponCodeInput}
                                onChange={(e) => {
                                  setCouponCodeInput(e.target.value)
                                  if (couponError) setCouponError('')
                                }}
                                placeholder="ENTER PROMO CODE"
                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-border/80 rounded-xl text-xs font-bold uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal text-primary focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 shadow-matte-xs"
                              />
                            </div>
                            <button
                              onClick={handleApplyCouponCode}
                              disabled={isApplyingCoupon || !couponCodeInput.trim()}
                              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-ring text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shrink-0 cursor-pointer active:scale-95 shadow-matte-xs"
                            >
                              {isApplyingCoupon ? '...' : 'Apply'}
                            </button>
                          </div>

                          {couponError && (
                            <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {couponError}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 3. Available Coupon Suggestions Accordion Drawer */}
                      {availableCoupons.length > 0 && !appliedCoupon && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowCouponDrawer(!showCouponDrawer)}
                            className="text-[11px] font-bold text-ring hover:underline flex items-center justify-between w-full py-1 cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              <span>View Available Offers ({availableCoupons.length})</span>
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCouponDrawer ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {showCouponDrawer && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 pt-2 overflow-hidden"
                              >
                                {availableCoupons.map((coupon) => (
                                  <div
                                    key={coupon.code}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                                      coupon.applicable
                                        ? 'bg-white border-border/80 hover:border-ring/50 shadow-matte-xs'
                                        : 'bg-secondary/40 border-border/40 opacity-75'
                                    }`}
                                  >
                                    <div className="min-w-0 space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-primary bg-secondary px-1.5 py-0.5 rounded border border-border text-[11px]">
                                          {coupon.code}
                                        </span>
                                        {coupon.applicable ? (
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                            Save {formatPrice(coupon.calculatedDiscount)}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-medium text-muted-foreground">
                                            Add {formatPrice(coupon.shortfall)} more
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-muted-foreground truncate">{coupon.description}</p>
                                    </div>

                                    {coupon.applicable ? (
                                      <button
                                        onClick={() => handleApplySpecificCoupon(coupon.code)}
                                        className="px-2.5 py-1 rounded-lg border border-ring/40 text-ring hover:bg-ring hover:text-white text-[11px] font-bold transition-all shrink-0 cursor-pointer active:scale-95"
                                      >
                                        Apply
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-bold text-muted-foreground/60 shrink-0">
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Pre-submit Inline Address & Contact Validation Notice */}
                    {(!isAddressValid || !isContactValid) && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-800 flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {!isAddressValid ? 'Please select or add a delivery address.' : 'Please enter a valid email address.'}
                        </span>
                      </motion.div>
                    )}

                    {/* Security Notice */}
                    <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-muted-foreground">
                      <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 shadow-matte-xs">
                        <AnimatedLock size={18} />
                      </div>
                      <div>
                        <h5 className="font-bold text-emerald-800 text-[11px]">256-Bit SSL Encrypted Checkout</h5>
                        <p className="text-[11px] leading-relaxed mt-0.5 font-medium text-emerald-700/70">Your personal details and payment information are completely safe.</p>
                      </div>
                    </div>

                    {/* Desktop Submit Order Button */}
                    <div className="space-y-2.5 pt-1 hidden lg:block">
                      <button
                        onClick={handleSubmitOrder}
                        disabled={isProcessing || !isAddressValid || !isContactValid}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary via-primary to-ring/90 hover:from-ring hover:via-ring hover:to-primary text-white text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 transition-all duration-500 shadow-matte-md hover:shadow-matte-lg active:scale-[0.98] disabled:opacity-50 cursor-pointer min-h-[52px] relative overflow-hidden group"
                      >
                        {/* Shimmer sweep */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing Securely...
                          </>
                        ) : paymentMethod === 'cod' ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Place COD Order ({formatPrice(amountToPay)})</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Pay Securely ({formatPrice(amountToPay)})</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {paymentMethod === 'cod' ? 'Pay cash upon doorstep delivery' : 'Protected by Razorpay 256-bit SSL Payment Gateway'}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>

          </div>

          {/* SIMPLIFIED CONDENSED TRUST BADGES FOOTER */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-border/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left"
          >
            {/* Badge 1 */}
            <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white border border-border/80 flex items-center justify-center text-ring shrink-0 shadow-matte-xs group-hover:border-ring/40 group-hover:shadow-matte-sm transition-all">
                <RotateCcw className="w-5 h-5 text-ring" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary">Easy 7-Day Exchange</h4>
                <p className="text-[11px] font-medium text-muted-foreground">Hassle-free size replacement</p>
              </div>
            </motion.div>

            {/* Badge 2 */}
            <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white border border-border/80 flex items-center justify-center text-ring shrink-0 shadow-matte-xs group-hover:border-ring/40 group-hover:shadow-matte-sm transition-all">
                <Printer className="w-5 h-5 text-ring" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary">Custom Print on Demand</h4>
                <p className="text-[11px] font-medium text-muted-foreground">Crafted especially for you</p>
              </div>
            </motion.div>

            {/* Badge 3 */}
            <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white border border-border/80 flex items-center justify-center text-ring shrink-0 shadow-matte-xs group-hover:border-ring/40 group-hover:shadow-matte-sm transition-all">
                <Heart className="w-5 h-5 text-ring" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary">Proudly Made in India</h4>
                <p className="text-[11px] font-medium text-muted-foreground">Ethical local atelier production</p>
              </div>
            </motion.div>

            {/* Badge 4 */}
            <motion.div variants={itemVariants} className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white border border-border/80 flex items-center justify-center text-ring shrink-0 shadow-matte-xs group-hover:border-ring/40 group-hover:shadow-matte-sm transition-all">
                <ShieldCheck className="w-5 h-5 text-ring" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary">100% Quality Assurance</h4>
                <p className="text-[11px] font-medium text-muted-foreground">Inspected before dispatch</p>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* MOBILE STICKY BOTTOM PAY BAR (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-12px_40px_rgba(0,0,0,0.10)] pb-safe">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ring/50 to-transparent" />
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Amount</span>
              <span className="font-mono text-xl font-bold text-primary tabular-nums">{formatPrice(amountToPay)}</span>
            </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isProcessing || !isAddressValid || !isContactValid}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-primary to-ring/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-matte-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer min-h-[48px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : paymentMethod === 'cod' ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Place COD Order</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay Securely</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </main>
  )
}
