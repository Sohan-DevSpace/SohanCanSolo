'use client'

import { useState, useMemo } from 'react'
import { CURRENCY_SYMBOL } from '@/constants/config'
import Link from 'next/link'
import { 
  Users, Search, Mail, Phone, Calendar, Download, Crown, 
  TrendingUp, ShoppingBag, ArrowUpDown, ChevronRight, Copy, Check,
  ExternalLink, Sparkles, DollarSign, Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface CustomersClientProps {
  customers: any[]
}

export function CustomersClient({ customers: initialCustomers }: CustomersClientProps) {
  const [customers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'all' | 'vip' | 'repeat' | 'new'>('all')
  const [sortBy, setSortBy] = useState<'spent-desc' | 'orders-desc' | 'date-desc' | 'name-asc'>('spent-desc')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Quick Copy Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Summary Metrics
  const stats = useMemo(() => {
    const totalCount = customers.length
    const totalRevenue = customers.reduce((acc, c) => acc + (Number(c.total_spent) || 0), 0)
    const vipCount = customers.filter(c => Number(c.total_spent || 0) >= 5000 || Number(c.order_count || 0) >= 3).length
    const avgLifetimeValue = totalCount > 0 ? totalRevenue / totalCount : 0

    return { totalCount, totalRevenue, vipCount, avgLifetimeValue }
  }, [customers])

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    const list = customers.filter(c => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = (
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      )

      if (!matchesSearch) return false

      if (selectedTab === 'vip') {
        return Number(c.total_spent || 0) >= 5000 || Number(c.order_count || 0) >= 3
      }
      if (selectedTab === 'repeat') {
        return Number(c.order_count || 0) >= 2
      }
      if (selectedTab === 'new') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return new Date(c.created_at || 0) >= thirtyDaysAgo
      }

      return true
    })

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'spent-desc':
          return (Number(b.total_spent) || 0) - (Number(a.total_spent) || 0)
        case 'orders-desc':
          return (Number(b.order_count) || 0) - (Number(a.order_count) || 0)
        case 'date-desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case 'name-asc':
          return (a.full_name || '').localeCompare(b.full_name || '')
        default:
          return 0
      }
    })
  }, [customers, searchQuery, selectedTab, sortBy])

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.error('No customer data to export.')
      return
    }

    const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'Role', 'Order Count', 'Total Spent (INR)', 'Joined Date']
    const rows = filteredAndSorted.map(c => [
      c.id,
      `"${c.full_name || 'Anonymous'}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      c.role || 'customer',
      c.order_count || 0,
      c.total_spent || 0,
      new Date(c.created_at).toISOString().split('T')[0]
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `alpona_customers_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Customer CSV downloaded successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">
            Customer Directory
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Analyze customer lifetime value, segment VIP purchasers, and view order histories.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] rounded-xl text-xs font-semibold px-4 py-2.5 h-auto transition-all active:scale-[0.97]"
        >
          <Download className="w-3.5 h-3.5 mr-2 text-[#B8763C]" />
          Export Customer CSV
        </Button>
      </div>

      {/* Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Customers',
            value: stats.totalCount.toLocaleString('en-IN'),
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10 border-blue-500/20'
          },
          {
            label: 'Customer Revenue',
            value: `${CURRENCY_SYMBOL}${Math.round(stats.totalRevenue).toLocaleString('en-IN')}`,
            icon: DollarSign,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'VIP Tier Buyers',
            value: stats.vipCount.toLocaleString('en-IN'),
            icon: Crown,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10 border-amber-500/20'
          },
          {
            label: 'Avg Lifetime Value',
            value: `${CURRENCY_SYMBOL}${Math.round(stats.avgLifetimeValue).toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10 border-purple-500/20'
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-5 hover:border-white/[0.08] transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-display font-semibold text-white tracking-tight tabular-nums">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Control Panel */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Customers', count: customers.length },
              { id: 'vip', label: 'VIP Buyers', count: stats.vipCount, icon: Crown },
              { id: 'repeat', label: 'Repeat Buyers', count: customers.filter(c => Number(c.order_count || 0) >= 2).length },
              { id: 'new', label: 'Joined <30 Days', count: customers.filter(c => new Date(c.created_at || 0) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer ${
                  selectedTab === tab.id
                    ? 'bg-[#B8763C] text-white shadow-md shadow-[#B8763C]/20'
                    : 'bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#09090b]/80 border border-white/[0.06] text-white text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-[#B8763C]"
            >
              <option value="spent-desc" className="bg-[#121214]">Highest Total Spent</option>
              <option value="orders-desc" className="bg-[#121214]">Most Orders</option>
              <option value="date-desc" className="bg-[#121214]">Newest Joined</option>
              <option value="name-asc" className="bg-[#121214]">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search customer by name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#09090b]/60 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden">
        {filteredAndSorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/[0.01] text-zinc-500 border-b border-white/[0.04]">
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Customer</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Contact Info</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Orders</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Total Spent</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Joined</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredAndSorted.map((c: any) => {
                  const isVip = Number(c.total_spent || 0) >= 5000 || Number(c.order_count || 0) >= 3

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-[#B8763C]/10 ring-1 ring-inset ring-[#B8763C]/20 flex items-center justify-center text-sm font-bold text-[#B8763C] shrink-0 group-hover:bg-[#B8763C]/20 group-hover:ring-[#B8763C]/30 transition-all shadow-sm">
                            {(c.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-100 text-[13px] group-hover:text-white transition-colors">
                                {c.full_name || 'Anonymous User'}
                              </span>
                              {isVip && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 shadow-sm">
                                  <Crown className="w-2.5 h-2.5" /> VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 capitalize mt-0.5">
                              {c.role || 'Customer'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-[12px] text-zinc-300 flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{c.email || 'No email attached'}</span>
                        </div>
                        {c.phone && (
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1">
                            <Phone className="w-3.5 h-3.5 opacity-70" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-zinc-200 bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-lg tabular-nums">
                          {c.order_count || 0} orders
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-white text-[13px] tabular-nums">
                        {CURRENCY_SYMBOL}{Number(c.total_spent || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 text-[12px] text-zinc-400 font-medium">
                        {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center text-xs font-semibold text-[#B8763C] opacity-80 group-hover:opacity-100 transition-opacity">
                          <span>View Profile</span>
                          <ChevronRight className="w-4 h-4 ml-0.5" />
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
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-white tracking-tight">No customers match filter</h3>
              <p className="text-zinc-500 text-sm mt-1">Try resetting your search query or tab filter.</p>
            </div>
          </div>
        )}
      </div>

      {/* Rich Customer Detail Drawer / Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-xl !rounded-2xl max-h-[85vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 pb-2 border-b border-white/[0.06]">
                  <div className="w-12 h-12 rounded-full bg-[#B8763C]/10 ring-1 ring-inset ring-[#B8763C]/30 flex items-center justify-center text-lg font-bold text-[#B8763C] shadow-sm shrink-0">
                    {(selectedCustomer.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                      {selectedCustomer.full_name || 'Customer Overview'}
                      {(Number(selectedCustomer.total_spent || 0) >= 5000 || Number(selectedCustomer.order_count || 0) >= 3) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20">
                          <Crown className="w-3 h-3" /> VIP Buyer
                        </span>
                      )}
                    </DialogTitle>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Customer ID: <code className="font-mono text-zinc-500">{selectedCustomer.id.slice(0, 12)}...</code>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-3 bg-[#09090b]/60 border border-white/[0.04] p-4 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Orders</span>
                    <span className="text-lg font-semibold text-white font-mono mt-0.5 block">{selectedCustomer.order_count || 0}</span>
                  </div>
                  <div className="border-x border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Total Spent</span>
                    <span className="text-lg font-semibold text-emerald-400 font-mono mt-0.5 block">
                      {CURRENCY_SYMBOL}{Number(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Role</span>
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mt-1 block">
                      {selectedCustomer.role || 'Customer'}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">Contact & Information</h4>
                  <div className="bg-[#09090b]/40 border border-white/[0.04] rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" /> Email:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-200 font-medium">{selectedCustomer.email || '—'}</span>
                        {selectedCustomer.email && (
                          <button
                            onClick={() => handleCopy(selectedCustomer.email, 'Email')}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                            title="Copy email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" /> Phone:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-200 font-medium">{selectedCustomer.phone || '—'}</span>
                        {selectedCustomer.phone && (
                          <button
                            onClick={() => handleCopy(selectedCustomer.phone, 'Phone')}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                            title="Copy phone"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Account Created:
                      </span>
                      <span className="text-zinc-300 font-medium">
                        {new Date(selectedCustomer.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Recent Orders List */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Recent Order History</span>
                    <span className="text-zinc-500 font-normal">({selectedCustomer.orders?.length || 0} orders found)</span>
                  </h4>

                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedCustomer.orders.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-[#09090b]/50 border border-white/[0.04] text-xs hover:border-white/[0.08] transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">{o.order_number}</span>
                              <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-medium capitalize">
                                {o.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 mt-0.5 block">
                              {new Date(o.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-white text-xs">
                              {CURRENCY_SYMBOL}{Number(o.total || 0).toLocaleString('en-IN')}
                            </span>
                            <Link
                              href="/admin/orders"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#B8763C] text-zinc-400 hover:text-white transition-all"
                              title="View in Orders Admin"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-[#09090b]/40 border border-white/[0.04] rounded-xl text-zinc-500 text-xs">
                      No order history recorded for this customer yet.
                    </div>
                  )}
                </div>

                {/* Quick Action Footer */}
                <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.06]">
                  {selectedCustomer.email && (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="px-4 py-2 rounded-xl bg-[#B8763C] hover:bg-[#a66833] text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.97]"
                    >
                      <Mail className="w-3.5 h-3.5" /> Send Email
                    </a>
                  )}
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
