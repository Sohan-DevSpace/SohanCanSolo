'use client'

import { useState, useEffect } from 'react'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { updateOrderStatus, syncOrderToQikink, updateQikinkOrderDetails } from './actions'
import {
  Package, Search, Download, Calendar, CreditCard,
  Loader2, RefreshCw, Eye, MapPin, User, Tag, Activity, CheckCircle2,
  AlertTriangle, ShieldCheck, Cpu, PackageCheck, Truck, Copy, ExternalLink, ChevronDown, FileDown, Link as LinkIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface OrdersClientProps {
  initialOrders: any[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20',
  confirmed: 'bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/20',
  processing: 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20',
  printed: 'bg-cyan-500/10 text-cyan-400 ring-1 ring-inset ring-cyan-500/20',
  packed: 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20',
  refunded: 'bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20',
  processing_error: 'bg-rose-500/15 text-rose-400 ring-1 ring-inset ring-rose-500/30',
}

const paymentColors: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20',
  paid: 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20',
  failed: 'text-rose-400 bg-rose-500/10 ring-1 ring-inset ring-rose-500/20',
  refunded: 'text-purple-400 bg-purple-500/10 ring-1 ring-inset ring-purple-500/20',
}

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'printed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']

const statusTabs = [
  { id: 'all', name: 'All' },
  { id: 'pending', name: 'Pending' },
  { id: 'confirmed', name: 'Confirmed' },
  { id: 'processing', name: 'Processing' },
  { id: 'shipped', name: 'Shipped' },
  { id: 'delivered', name: 'Delivered' },
  { id: 'cancelled', name: 'Cancelled' },
]

const typeTabs = [
  { id: 'all', name: 'All Types' },
  { id: 'pod', name: 'Qikink (POD)' },
  { id: 'manual', name: 'Manual' },
]

function isPodOrder(order: any): boolean {
  return order.fulfillment_type === 'qikink' || (order.fulfillment_type == null && (!!order.qikink_order_id || order.order_items?.some((item: any) => item.products?.qikink_product_id)))
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  useEffect(() => { setOrders(initialOrders) }, [initialOrders])

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [activeType, setActiveType] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)

  const filteredOrders = orders.filter(order => {
    const sa = order.shipping_address || {}
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sa.name && sa.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sa.city && sa.city.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = activeTab === 'all' || order.status === activeTab
    const pod = isPodOrder(order)
    const matchesType = activeType === 'all' || (activeType === 'pod' && pod) || (activeType === 'manual' && !pod)
    return matchesSearch && matchesTab && matchesType
  })

  const counts: Record<string, number> = { all: orders.length }
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })

  const handleExportCSV = () => {
    const headers = ['Order #', 'Date', 'Customer', 'City', 'Total', 'Payment', 'Status', 'Type']
    const rows = filteredOrders.map(order => {
      const sa = order.shipping_address || {}
      return [
        `"${order.order_number}"`,
        `"${new Date(order.created_at).toLocaleDateString()}"`,
        `"${(sa.name || 'Guest').replace(/"/g, '""')}"`,
        `"${(sa.city || '').replace(/"/g, '""')}"`,
        order.total,
        `"${order.payment_status}"`,
        `"${order.status}"`,
        `"${isPodOrder(order) ? 'POD' : 'Manual'}"`
      ]
    })
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `alpona_orders_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSync = async (orderId: string) => {
    setIsSyncing(orderId)
    const result = await syncOrderToQikink(orderId)
    setIsSyncing(null)
    if (result.success) {
      toast.success('Order synced to Qikink!')
    } else {
      toast.error(result.error || 'Sync failed')
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    setIsUpdatingStatus(null)
    if (result.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Status → ${newStatus}`)
    } else {
      toast.error(result.error || 'Update failed')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white">Orders</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage and track all fulfillment orders.</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="border-white/[0.08] hover:bg-white/[0.04] text-white text-xs font-semibold active:scale-[0.97] rounded-xl h-10 px-4 transition-all">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search by order number, customer, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#09090b]/50 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {statusTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                {tab.name}
                {counts[tab.id] ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                    activeTab === tab.id ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800/50 text-zinc-500'
                  }`}>{counts[tab.id]}</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {typeTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeType === tab.id
                    ? 'bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/20 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-transparent text-zinc-500 border-b border-white/[0.04]">
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Order</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Customer</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Total</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Payment</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Type</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredOrders.map((order: any) => {
                  const sa = order.shipping_address || {}
                  const pod = isPodOrder(order)

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <button onClick={() => setSelectedOrder(order)} className="text-left group/link flex flex-col items-start">
                          <div className="font-semibold text-[#B8763C] text-[13px] group-hover/link:underline">{order.order_number}</div>
                          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-zinc-200 text-[13px]">{sa.name || order.profiles?.full_name || 'Guest'}</div>
                        <div className="text-[11px] text-zinc-500 mt-1">{sa.city || '—'}, {sa.state || '—'}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-white font-mono tabular-nums text-[13px]">
                        {CURRENCY_SYMBOL}{Number(order.total).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-all ${paymentColors[order.payment_status] || paymentColors.pending}`}>
                          <CreditCard className="w-3 h-3 opacity-70" /> {order.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                          pod ? 'text-blue-400 bg-blue-500/10 ring-1 ring-inset ring-blue-500/20' : 'text-orange-400 bg-orange-500/10 ring-1 ring-inset ring-orange-500/20'
                        }`}>
                          {pod ? <><Cpu className="w-3 h-3 mr-1.5 opacity-70" /> POD</> : <><Package className="w-3 h-3 mr-1.5 opacity-70" /> Manual</>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative inline-flex group/status">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={isUpdatingStatus === order.id}
                            className={`appearance-none cursor-pointer rounded-md px-3 py-1.5 pr-8 text-[11px] font-semibold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-[#B8763C]/50 disabled:opacity-50 ${statusColors[order.status] || statusColors.pending}`}
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s} className="bg-[#09090b] text-zinc-300">{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                            ))}
                          </select>
                          {isUpdatingStatus === order.id ? (
                            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-current opacity-70 pointer-events-none" />
                          ) : (
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current opacity-50 pointer-events-none group-hover/status:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pod && !order.qikink_order_id && order.status === 'processing_error' && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleSync(order.id)}
                              disabled={isSyncing === order.id}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 text-amber-400 active:scale-[0.95]"
                              title="Sync with Qikink"
                            >
                              {isSyncing === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                            className="w-8 h-8 rounded-lg bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] text-zinc-400 hover:text-white active:scale-[0.95]"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-600 shadow-inner">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-white tracking-tight">No orders found</h3>
              <p className="text-zinc-500 text-sm mt-1">
                {searchQuery || activeTab !== 'all' ? 'Try adjusting your filters.' : 'No orders have been placed yet.'}
              </p>
            </div>
            {(searchQuery || activeTab !== 'all') && (
              <Button onClick={() => { setSearchQuery(''); setActiveTab('all'); setActiveType('all') }} className="mt-2 bg-[#B8763C]/10 hover:bg-[#B8763C]/20 text-[#B8763C] border-none font-semibold text-sm h-10 px-5 rounded-xl active:scale-[0.97]">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white !max-w-[720px] !w-[95vw] !max-h-[90vh] !overflow-y-auto !p-0 !gap-0 !rounded-2xl">
          {selectedOrder && (
            <OrderDetailContent
              order={selectedOrder}
              onUpdate={(updatedFields: any) => {
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...updatedFields } : o))
                setSelectedOrder((prev: any) => prev ? { ...prev, ...updatedFields } : null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ─── Order Detail Dialog ─── */
function OrderDetailContent({ order, onUpdate }: { order: any; onUpdate: (updatedFields: any) => void }) {
  const sa = order.shipping_address || {}
  const pod = isPodOrder(order)
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '')
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [localStatus, setLocalStatus] = useState(order.status)

  const handleStatusChange = async (newStatus: string) => {
    setLocalStatus(newStatus)
    setIsUpdatingStatus(true)
    const res = await updateOrderStatus(order.id, newStatus, trackingUrl || undefined)
    setIsUpdatingStatus(false)
    if (res.success) {
      onUpdate({ status: newStatus })
      toast.success(`Status → ${newStatus}`)
    } else {
      setLocalStatus(order.status)
      toast.error('Failed to update status')
    }
  }

  const handleSaveTracking = async () => {
    setIsUpdatingTracking(true)
    const res = await updateOrderStatus(order.id, localStatus, trackingUrl)
    setIsUpdatingTracking(false)
    if (res.success) {
      onUpdate({ tracking_url: trackingUrl })
      toast.success('Tracking URL saved')
    } else {
      toast.error('Failed to save tracking URL')
    }
  }

  const [qikinkOrderIdInput, setQikinkOrderIdInput] = useState(order.qikink_order_id || '')
  const [trackingNumberInput, setTrackingNumberInput] = useState(order.tracking_number || '')
  const [courierNameInput, setCourierNameInput] = useState(order.courier_name || 'Express Courier')
  const [isSavingQikinkDetails, setIsSavingQikinkDetails] = useState(false)

  const handleSaveQikinkDetails = async () => {
    setIsSavingQikinkDetails(true)
    const res = await updateQikinkOrderDetails(order.id, qikinkOrderIdInput, trackingNumberInput, courierNameInput)
    setIsSavingQikinkDetails(false)
    if (res.success) {
      onUpdate({
        qikink_order_id: qikinkOrderIdInput,
        tracking_number: trackingNumberInput,
        courier_name: courierNameInput
      })
      toast.success('Qikink & Tracking details saved!')
    } else {
      toast.error('Failed to save Qikink details')
    }
  }

  const handleDownloadImage = (url: string, filename: string) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
        toast.success(`Downloaded asset`)
      })
      .catch(() => {
        window.open(url, '_blank')
      })
  }

  const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const steps = [
    { label: 'Checkout', done: order.payment_status === 'paid' || order.status !== 'pending' },
    { label: 'Confirmed', done: ['confirmed', 'processing', 'printed', 'packed', 'shipped', 'delivered'].includes(order.status) },
    { label: 'Processing', done: ['processing', 'printed', 'packed', 'shipped', 'delivered'].includes(order.status) },
    { label: 'Shipped', done: ['shipped', 'delivered'].includes(order.status) },
    { label: 'Delivered', done: order.status === 'delivered' },
  ]

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/[0.04]">
        <div className="flex items-start justify-between gap-4 pr-6">
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">Order Detail</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-mono font-bold tracking-wider text-white">{order.order_number}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold shrink-0 ${
                pod ? 'text-blue-400 bg-blue-500/10 ring-1 ring-inset ring-blue-500/20' : 'text-orange-400 bg-orange-500/10 ring-1 ring-inset ring-orange-500/20'
              }`}>
                {pod ? 'POD' : 'Manual'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize shrink-0 ${
                order.payment_status === 'paid' ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20' : 'text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20'
              }`}>
                <CreditCard className="w-3 h-3 opacity-70" /> {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Fulfillment Timeline */}
        <div className="bg-[#09090b]/40 border border-white/[0.04] rounded-xl p-5 overflow-hidden">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#B8763C] shrink-0" /> Timeline
          </p>
          <div className="flex items-center overflow-x-auto no-scrollbar pb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center flex-1 min-w-[80px]">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    s.done ? 'bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/30 shadow-[0_0_10px_rgba(184,118,60,0.2)]' : 'bg-zinc-900 ring-1 ring-inset ring-zinc-800 text-zinc-600'
                  }`}>
                    {s.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <p className={`text-[10px] font-medium mt-2 text-center leading-tight transition-colors ${s.done ? 'text-zinc-200' : 'text-zinc-600'}`}>{s.label}</p>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 transition-colors ${s.done ? 'bg-[#B8763C]/30' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Status & Tracking */}
        <div className="bg-[#09090b]/40 border border-white/[0.04] rounded-xl p-5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <PackageCheck className="w-3.5 h-3.5 text-[#B8763C] shrink-0" /> Manage Order
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Status</label>
              <div className="relative">
                <select
                  value={localStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="w-full appearance-none bg-white/[0.02] border border-white/[0.04] text-zinc-200 text-xs font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#B8763C]/50 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s} className="bg-[#09090b] text-zinc-300">{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                  ))}
                </select>
                {isUpdatingStatus ? (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#B8763C]" />
                ) : (
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Tracking URL</label>
              <div className="flex gap-2">
                <Input
                  value={trackingUrl}
                  onChange={e => setTrackingUrl(e.target.value)}
                  placeholder="https://track.courier.com/..."
                  className="h-[42px] text-xs bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white placeholder-zinc-600 min-w-0 rounded-xl"
                />
                <Button
                  onClick={handleSaveTracking}
                  disabled={isUpdatingTracking || trackingUrl === (order.tracking_url || '')}
                  className="h-[42px] px-4 bg-white/10 hover:bg-white/20 text-white border-none rounded-xl active:scale-[0.97] shrink-0 font-semibold transition-all"
                >
                  {isUpdatingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          </div>

          {pod && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-zinc-400">
                <span><strong className="text-zinc-500 font-sans uppercase tracking-wider text-[10px] mr-2">Qikink ID:</strong> {order.qikink_order_id || <span className="text-zinc-600">Not synced</span>}</span>
                {order.tracking_url && (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[#B8763C] hover:text-[#a66833] inline-flex items-center gap-1.5 transition-colors font-sans font-semibold">
                    <ExternalLink className="w-3.5 h-3.5" /> Track Shipment
                  </a>
                )}
              </div>
              {order.admin_notes && (
                <div className="mt-3 p-3 bg-rose-500/10 ring-1 ring-inset ring-rose-500/20 text-rose-400 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="leading-relaxed">{order.admin_notes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer + Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#09090b]/40 border border-white/[0.04] rounded-xl p-5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#B8763C] shrink-0" /> Customer
            </p>
            <p className="text-[13px] font-semibold text-zinc-100">{sa.name || 'Guest'}</p>
            {sa.phone && (
              <button onClick={() => copyToClipboard(sa.phone)} className="text-[12px] text-zinc-400 mt-1 hover:text-white inline-flex items-center gap-1.5 transition-colors">
                {sa.phone} <Copy className="w-3 h-3 opacity-70" />
              </button>
            )}
            {sa.email && <p className="text-[12px] text-zinc-500 mt-1 truncate">{sa.email}</p>}
          </div>
          <div className="bg-[#09090b]/40 border border-white/[0.04] rounded-xl p-5 min-w-0">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#B8763C] shrink-0" /> Shipping Address
            </p>
            <p className="text-[12px] text-zinc-300 leading-relaxed break-words">
              {sa.address1 || sa.addressLine1 || '—'}
              {(sa.address2 || sa.addressLine2) && <><br />{sa.address2 || sa.addressLine2}</>}
            </p>
            <p className="text-[12px] text-zinc-100 font-medium mt-1.5 break-words">
              {sa.city || sa.City || sa.city_name || '—'}, {sa.state || sa.State || '—'} — {sa.pincode || sa.zip || '—'}
            </p>
          </div>
        </div>

        {/* Qikink Manual Order Sheet & Asset Manager */}
        <div className="bg-[#09090b]/80 border border-[#B8763C]/30 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#B8763C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Qikink Manual Order & Asset Sheet</h4>
                <p className="text-[11px] text-zinc-400">Copy address fields & download high-res print assets for manual portal entry</p>
              </div>
            </div>

            <Button
              onClick={() => {
                const fullAddr = `${sa.name || sa.fullName || ''}\n${sa.phone || ''}\n${sa.address1 || sa.addressLine1 || ''}, ${sa.address2 || sa.addressLine2 || ''}\n${sa.city || ''}, ${sa.state || ''} - ${sa.pincode || ''}`
                copyToClipboard(fullAddr)
              }}
              variant="outline"
              className="h-8 px-3 text-[11px] bg-[#B8763C]/10 hover:bg-[#B8763C]/20 border-[#B8763C]/30 text-[#B8763C] font-semibold rounded-lg shrink-0 cursor-pointer"
            >
              <Copy className="w-3 h-3 mr-1.5" /> Copy Full Address
            </Button>
          </div>

          {/* Address Field Copiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            <div className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Recipient Name</span>
                <span className="text-xs font-semibold text-white truncate block">{sa.name || sa.fullName || '—'}</span>
              </div>
              <button onClick={() => copyToClipboard(sa.name || sa.fullName || '')} className="text-zinc-400 hover:text-white p-1 shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Phone</span>
                <span className="text-xs font-mono font-semibold text-white truncate block">{sa.phone || '—'}</span>
              </div>
              <button onClick={() => copyToClipboard(sa.phone || '')} className="text-zinc-400 hover:text-white p-1 shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Pincode</span>
                <span className="text-xs font-mono font-semibold text-[#B8763C] truncate block">{sa.pincode || sa.zip || '—'}</span>
              </div>
              <button onClick={() => copyToClipboard(sa.pincode || sa.zip || '')} className="text-zinc-400 hover:text-white p-1 shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between col-span-2 sm:col-span-3">
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Street Address</span>
                <span className="text-xs font-medium text-white truncate block">
                  {sa.address1 || sa.addressLine1} {sa.address2 || sa.addressLine2 ? `, ${sa.address2 || sa.addressLine2}` : ''}, {sa.city}, {sa.state}
                </span>
              </div>
              <button onClick={() => copyToClipboard(`${sa.address1 || sa.addressLine1 || ''} ${sa.address2 || sa.addressLine2 || ''}, ${sa.city || ''}, ${sa.state || ''}`)} className="text-zinc-400 hover:text-white p-1 shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* High-Res Print Asset Download & Image Link Copier Section */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Print Design Assets & Garment Images</span>
            
            <div className="space-y-2">
              {order.order_items?.map((item: any, idx: number) => {
                const designImg = item.designs?.image_url || item.designs?.thumbnail_url || item.products?.images?.[0]
                const designName = item.design_name || item.designs?.name || item.product_name

                return (
                  <div key={item.id || idx} className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg bg-black border border-white/[0.08] overflow-hidden shrink-0">
                        <img src={designImg || '/images/designer_1.png'} alt={designName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-white truncate">{designName}</p>
                        <p className="text-[11px] text-zinc-400">
                          Size: <strong className="text-white">{item.size || 'M'}</strong> • Color: <strong className="text-white">{item.color || 'Black'}</strong> • Qty: <strong className="text-white">{item.quantity}</strong>
                        </p>
                        {item.products?.qikink_product_id && (
                          <span className="text-[9px] font-mono text-[#B8763C] bg-[#B8763C]/10 px-1.5 py-0.2 rounded border border-[#B8763C]/20 inline-block">
                            Qikink Code: {item.products.qikink_product_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {designImg && (
                        <>
                          <button
                            onClick={() => copyToClipboard(designImg)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Copy className="w-3 h-3" /> Image Link
                          </button>
                          <button
                            onClick={() => handleDownloadImage(designImg, `design_${item.design_id || idx}.png`)}
                            className="px-3 py-1.5 rounded-lg bg-[#B8763C] hover:bg-[#B8763C]/90 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Asset
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Manual Qikink Order & Tracking Details Input Form */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Save Qikink Order ID & Courier Tracking AWB</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Input
                value={qikinkOrderIdInput}
                onChange={e => setQikinkOrderIdInput(e.target.value)}
                placeholder="Qikink Order ID (e.g. QIK-99210)"
                className="h-10 text-xs bg-white/[0.02] border-white/[0.06] text-white placeholder-zinc-500 rounded-xl"
              />
              <Input
                value={trackingNumberInput}
                onChange={e => setTrackingNumberInput(e.target.value)}
                placeholder="Tracking AWB (e.g. BD882910IN)"
                className="h-10 text-xs bg-white/[0.02] border-white/[0.06] text-white placeholder-zinc-500 rounded-xl"
              />
              <Input
                value={courierNameInput}
                onChange={e => setCourierNameInput(e.target.value)}
                placeholder="Courier (e.g. BlueDart)"
                className="h-10 text-xs bg-white/[0.02] border-white/[0.06] text-white placeholder-zinc-500 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                onClick={handleSaveQikinkDetails}
                disabled={isSavingQikinkDetails}
                className="h-9 px-4 bg-[#B8763C] hover:bg-[#B8763C]/90 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                {isSavingQikinkDetails ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Qikink Order Info'}
              </Button>
            </div>
          </div>
        </div>

        {/* System Metadata */}
        <div className="bg-[#09090b]/40 border border-white/[0.04] rounded-xl p-5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B8763C] shrink-0" /> System Metadata
          </p>
          <div className="space-y-2 text-[11px] font-mono text-zinc-400">
            <div className="flex gap-3">
              <strong className="text-zinc-600 font-sans uppercase tracking-widest text-[9px] shrink-0 w-24">Razorpay Order:</strong>
              <span className="text-zinc-300 truncate">{order.razorpay_order_id || 'N/A'}</span>
            </div>
            <div className="flex gap-3">
              <strong className="text-zinc-600 font-sans uppercase tracking-widest text-[9px] shrink-0 w-24">Razorpay Pymt:</strong>
              <span className="text-zinc-300 truncate">{order.razorpay_payment_id || 'N/A'}</span>
            </div>
            <div className="flex gap-3">
              <strong className="text-zinc-600 font-sans uppercase tracking-widest text-[9px] shrink-0 w-24">Created At:</strong>
              <span className="text-zinc-300">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
              <strong className="text-zinc-600 font-sans uppercase tracking-widest text-[9px] shrink-0 w-24">Order ID:</strong>
              <button onClick={() => copyToClipboard(order.id)} className="text-zinc-300 truncate hover:text-white inline-flex items-center gap-1.5 transition-colors min-w-0">
                <span className="truncate">{order.id}</span> <Copy className="w-3 h-3 shrink-0 opacity-70" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
