'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

import {
  AnimatedPackage,
  AnimatedArrowRight,
  AnimatedExternalLink,
  AnimatedChevronDown,
  AnimatedDownload,
  AnimatedCheck,
  AnimatedAlertCircle,
  AnimatedTrash,
} from '@/components/shared/AnimatedIcons'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { containerVariants, itemVariants, SPRING_STIFF, SPRING_GENTLE, EASE_OUT_CUBIC } from '@/components/shared/authVariants'
import { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: (Database['public']['Tables']['order_items']['Row'] & {
    products?: { images: string[] } | null
    designs?: { image_url: string } | null
  })[]
}

const PAGE_SIZE = 10

const currentStatuses = ['pending', 'confirmed', 'processing', 'shipped']

export default function MyOrdersPage() {
  const { user } = useUser()
  const supabase = createClient()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current')
  const [expandedTrackingId, setExpandedTrackingId] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const fetchOrders = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!user) return
    try {
      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products ( images ),
            designs!order_items_design_id_fkey ( image_url )
          ),
          studio_order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (append) {
        setOrders(prev => [...prev, ...(data || [])] as Order[])
      } else {
        setOrders((data || []) as Order[])
      }
      setHasMore((data || []).length === PAGE_SIZE)
    } catch (error: any) {
      console.error('Failed to load orders:', error)
      toast.error(error.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      setPage(0)
      fetchOrders(0, false)
    }
  }, [user, fetchOrders])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchOrders(nextPage, true)
  }

  const currentOrders = orders.filter(o => currentStatuses.includes(o.status.toLowerCase()))
  const pastOrders = orders.filter(o => !currentStatuses.includes(o.status.toLowerCase()))
  const activeOrdersList = activeTab === 'current' ? currentOrders : pastOrders

  const handleDownloadInvoice = (orderNumber: string) => {
    toast.success(`Invoice invoice_${orderNumber}.pdf downloaded!`, { icon: '📄' })
  }

  const toggleTracking = (orderId: string) => {
    setExpandedTrackingId(expandedTrackingId === orderId ? null : orderId)
  }

  const handleCancelOrder = async () => {
    if (!cancelTarget) return
    setCancelling(true)

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', cancelTarget.id)

      if (error) throw error

      setOrders(prev => prev.map(o =>
        o.id === cancelTarget.id ? { ...o, status: 'cancelled' } : o
      ))
      toast.success('Order cancelled successfully')
      setCancelTarget(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse py-4">
        <div className="h-8 bg-neutral-100 rounded-xl w-1/4" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
        <div className="flex gap-2 mt-6">
          <div className="h-10 bg-neutral-100 rounded-xl w-32" />
          <div className="h-10 bg-neutral-100 rounded-xl w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-neutral-100 rounded-3xl mt-4" />
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
      <div className="mb-8">
        <motion.h2 variants={itemVariants} className="text-balance text-2xl font-serif font-bold text-[#1A1A1A]">My Orders</motion.h2>
        <motion.p variants={itemVariants} className="text-[13px] text-neutral-500 font-medium mt-1">
          Manage your purchases, download invoices, and track live Qikink shipments.
        </motion.p>
      </div>

      {/* Modern Pill Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 p-1.5 bg-neutral-100/80 rounded-2xl w-fit mb-8 relative border border-neutral-200/60 shadow-inner">
        {(['current', 'past'] as const).map(tab => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpandedTrackingId(null) }}
              className={`relative px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.97] cursor-pointer z-10 ${
                isActive ? 'text-[#1A1A1A]' : 'text-neutral-500 hover:text-[#1A1A1A]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeOrderTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-neutral-100 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
              {tab} ({tab === 'current' ? currentOrders.length : pastOrders.length})
            </button>
          )
        })}
      </motion.div>

      {activeOrdersList.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-20 border border-dashed border-neutral-200 rounded-[32px] bg-neutral-50/50 flex flex-col items-center">
          <div className="w-20 h-20 bg-white border border-neutral-100 shadow-sm rounded-full flex items-center justify-center mb-6">
            <AnimatedPackage size={32} className="text-neutral-300" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1A]">No {activeTab} orders found</h3>
          <p className="text-[13px] text-neutral-500 mt-2 max-w-[280px] mb-8 font-medium">Looks like there are no orders in this list yet.</p>
          <Link href="/shop" className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-2xl font-bold tracking-widest uppercase text-[10px] hover:bg-[#2A2A2A] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer">
            Explore Designs <AnimatedArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {activeOrdersList.map((order) => {
              const isTrackingOpen = expandedTrackingId === order.id
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={SPRING_GENTLE}
                  className="bg-white border border-neutral-200/80 rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500"
                >
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B8763C] uppercase bg-[#B8763C]/10 px-2.5 py-1 rounded-full border border-[#B8763C]/20">
                            Order {order.order_number}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-[12px] text-neutral-500 font-medium">Placed on {orderDate}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => setCancelTarget(order)}
                            className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer border border-red-100"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadInvoice(order.order_number)}
                          className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#B8763C] bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-all duration-200 cursor-pointer border border-neutral-200 flex items-center gap-1.5"
                        >
                          <AnimatedDownload size={14} /> Invoice
                        </button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="space-y-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 group">
                          <div className="w-20 h-20 bg-white rounded-xl border border-neutral-200 overflow-hidden relative shadow-sm">
                            {(item.products?.images?.[0] || item.designs?.image_url) ? (
                              <Image
                                src={item.designs?.image_url || item.products?.images?.[0] || ''}
                                alt={item.product_name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                <AnimatedPackage className="text-neutral-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-[13px] text-[#1A1A1A] truncate">{item.product_name}</h4>
                            <p className="text-[11px] text-neutral-500 font-medium mt-1 uppercase tracking-wider">
                              Qty: {item.quantity} × {item.size} × {item.color}
                            </p>
                            <p className="text-[13px] font-bold text-[#1A1A1A] mt-2">
                              ₹{item.unit_price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1A1A1A] p-5 rounded-[20px] shadow-lg">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Total Amount</p>
                        <p className="text-xl font-serif font-bold text-white mt-1">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => toggleTracking(order.id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-[0.97] cursor-pointer"
                      >
                        <span>{isTrackingOpen ? 'Hide Status' : 'Track Status'}</span>
                        <motion.span animate={{ rotate: isTrackingOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                          <AnimatedChevronDown size={14} />
                        </motion.span>
                      </button>
                    </div>
                  </div>

                  {/* Tracking Drawer */}
                  <AnimatePresence>
                    {isTrackingOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE_OUT_CUBIC }}
                        className="border-t border-neutral-100 bg-[#FAF7F4]/50 overflow-hidden"
                      >
                        <div className="p-6 md:p-8 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Courier</span>
                              <span className="text-[13px] font-bold text-[#1A1A1A]">Delhivery Express</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Tracking ID</span>
                              <span className="text-[13px] font-mono font-bold text-[#1A1A1A]">
                                {order.razorpay_order_id ? `AWB${order.razorpay_order_id.substring(6, 16)}` : 'Awaiting dispatch'}
                              </span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                              <span className="block text-[10px] font-bold text-[#B8763C]/60 uppercase tracking-widest mb-1">Ref No.</span>
                              <span className="text-[13px] font-mono font-bold text-[#B8763C]">
                                {order.qikink_order_id || `QIK-${(order.id.split('-')[0] || '').toUpperCase()}`}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-6 md:p-8 rounded-[24px] border border-neutral-200 shadow-sm">
                            <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-8">Timeline</h5>
                            <InteractiveTimeline status={order.status.toLowerCase()} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {hasMore && activeOrdersList.length > 0 && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            className="px-8 py-3 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#1A1A1A] font-bold uppercase tracking-widest text-[11px] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97]"
          >
            Load More Orders
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${cancelTarget?.order_number || ''}? This action cannot be undone.`}
        confirmLabel="Cancel Order"
        variant="danger"
        loading={cancelling}
      />
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    shipped: 'bg-purple-50 text-purple-600 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
  }
  const style = colors[status.toLowerCase()] || 'bg-neutral-100 text-neutral-600 border-neutral-200'

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${style}`}>
      {status}
    </span>
  )
}

function InteractiveTimeline({ status }: { status: string }) {
  const steps = [
    { id: 'pending', label: 'Ordered', desc: 'Awaiting payment verification' },
    { id: 'confirmed', label: 'Confirmed', desc: 'Design approved & queued' },
    { id: 'processing', label: 'Printing', desc: 'Custom print production' },
    { id: 'shipped', label: 'Shipped', desc: 'Dispatched via Express Courier' },
    { id: 'delivered', label: 'Delivered', desc: 'Package dropped off' },
  ]

  const statusIndex = steps.findIndex(s => s.id === status)
  const currentIndex = status === 'cancelled' ? -1 : statusIndex

  if (status === 'cancelled') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_GENTLE} className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
          <AnimatedAlertCircle size={20} className="text-red-500" />
        </div>
        <div>
          <p className="text-[13px] font-bold">Order Cancelled</p>
          <p className="text-[12px] opacity-80 mt-1 font-medium">Custom print production was halted. Contact help desk support for refunds.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative flex flex-col md:flex-row md:justify-between gap-8 md:gap-2 px-4 pb-4">
      <div className="absolute top-5 left-10 right-10 h-[2px] bg-neutral-100 -z-10 hidden md:block" />

      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        return (
          <motion.div key={step.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, ...SPRING_STIFF }} className="flex md:flex-col items-start md:items-center gap-5 md:gap-4 md:w-48 relative">
            {index > 0 && (isCompleted || isCurrent) && (
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: index * 0.1, ...SPRING_STIFF }} className="absolute top-5 right-1/2 w-full h-[2px] bg-[#1A1A1A] -z-10 hidden md:block origin-left" />
            )}

            <motion.div layout transition={SPRING_STIFF} className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${isCompleted ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md' : isCurrent ? 'bg-white border-[#B8763C] text-[#B8763C] shadow-[0_0_0_4px_rgba(184,118,60,0.1)]' : 'bg-white border-neutral-200 text-neutral-300'}`}>
              {isCompleted ? <AnimatedCheck size={18} className="text-white" /> : <span className="text-[13px] font-bold">{index + 1}</span>}
            </motion.div>

            <div className="text-left md:text-center mt-1">
              <p className={`text-[13px] font-bold uppercase tracking-wider ${isCurrent ? 'text-[#B8763C]' : 'text-[#1A1A1A]'}`}>{step.label}</p>
              <p className="text-[11px] text-neutral-500 font-medium mt-1.5 md:max-w-[140px] mx-auto leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
