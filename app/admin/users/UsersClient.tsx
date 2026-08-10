'use client'

import { useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Users, Search, Shield, UserCog, Loader2, Mail, Calendar, 
  Download, UserCheck, ShieldCheck, Copy, Check, ArrowUpDown, Eye,
  AlertTriangle, ShoppingBag
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

import { updateUserRole } from './actions'

interface UsersClientProps {
  users: any[]
}

export function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleTab, setSelectedRoleTab] = useState<'all' | 'admin' | 'seller' | 'customer'>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'name-asc' | 'role-desc'>('date-desc')
  const [roleDialog, setRoleDialog] = useState<any>(null)
  const [newRole, setNewRole] = useState('customer')
  const [updatingRole, setUpdatingRole] = useState(false)
  const [viewUserDetail, setViewUserDetail] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Summary Metrics
  const stats = useMemo(() => {
    const totalCount = users.length
    const adminCount = users.filter(u => u.role === 'admin').length
    const sellerCount = users.filter(u => u.role === 'seller').length
    const customerCount = users.filter(u => u.role !== 'admin' && u.role !== 'seller').length
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newThisMonth = users.filter(u => new Date(u.created_at || 0) >= thirtyDaysAgo).length

    return { totalCount, adminCount, sellerCount, customerCount, newThisMonth }
  }, [users])

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    const list = users.filter(u => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      )

      if (!matchesSearch) return false

      if (selectedRoleTab === 'admin') return u.role === 'admin'
      if (selectedRoleTab === 'seller') return u.role === 'seller'
      if (selectedRoleTab === 'customer') return u.role !== 'admin' && u.role !== 'seller'

      return true
    })

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case 'name-asc':
          return (a.full_name || '').localeCompare(b.full_name || '')
        case 'role-desc':
          return (b.role || '').localeCompare(a.role || '')
        default:
          return 0
      }
    })
  }, [users, searchQuery, selectedRoleTab, sortBy])

  // Handle Role Change in Database
  const handleRoleChange = async () => {
    if (!roleDialog) return
    setUpdatingRole(true)
    const res = await updateUserRole(roleDialog.id, newRole)
    setUpdatingRole(false)
    if (!res.success) { 
      toast.error(res.error || 'Failed to update role')
      return 
    }
    setUsers(users.map(u => u.id === roleDialog.id ? { ...u, role: newRole } : u))
    toast.success(`Role updated to ${newRole.toUpperCase()} for ${roleDialog.full_name || 'User'}`)
    setRoleDialog(null)
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.error('No user data to export.')
      return
    }

    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Orders Count', 'Joined Date']
    const rows = filteredAndSorted.map(u => [
      u.id,
      `"${u.full_name || 'Anonymous'}"`,
      `"${u.email || ''}"`,
      u.role || 'customer',
      u.order_count || 0,
      new Date(u.created_at).toISOString().split('T')[0]
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `alpona_users_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('User directory CSV downloaded!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">
            User Management
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage registered accounts, grant administrative access, and review user profiles.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] rounded-xl text-xs font-semibold px-4 py-2.5 h-auto transition-all active:scale-[0.97]"
        >
          <Download className="w-3.5 h-3.5 mr-2 text-[#B8763C]" />
          Export Users CSV
        </Button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Registered Users',
            value: stats.totalCount.toLocaleString('en-IN'),
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10 border-blue-500/20'
          },
          {
            label: 'Administrators',
            value: stats.adminCount.toLocaleString('en-IN'),
            icon: ShieldCheck,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10 border-amber-500/20'
          },
          {
            label: 'Customers',
            value: stats.customerCount.toLocaleString('en-IN'),
            icon: UserCheck,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Joined This Month',
            value: stats.newThisMonth.toLocaleString('en-IN'),
            icon: Calendar,
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

      {/* Control Panel */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Users', count: users.length },
              { id: 'admin', label: 'Admins', count: stats.adminCount, icon: ShieldCheck },
              { id: 'seller', label: 'Sellers', count: stats.sellerCount, icon: UserCog },
              { id: 'customer', label: 'Customers', count: stats.customerCount, icon: UserCheck },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRoleTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer ${
                  selectedRoleTab === tab.id
                    ? 'bg-[#B8763C] text-white shadow-md shadow-[#B8763C]/20'
                    : 'bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRoleTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-zinc-400'
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
              <option value="date-desc" className="bg-[#121214]">Newest Joined</option>
              <option value="name-asc" className="bg-[#121214]">Alphabetical (A-Z)</option>
              <option value="role-desc" className="bg-[#121214]">Role Priority</option>
            </select>
          </div>

        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search by user name, email address, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#09090b]/60 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden">
        {filteredAndSorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/[0.01] text-zinc-500 border-b border-white/[0.04]">
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">User Profile</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Email Address</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Role</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Orders</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Joined Date</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Role Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredAndSorted.map((u: any) => {
                  const isAdmin = u.role === 'admin'

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white shadow-inner shrink-0 group-hover:border-[#B8763C]/30 group-hover:text-[#B8763C] transition-colors">
                            {(u.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors">
                              {u.full_name || 'Anonymous User'}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {u.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-[13px]">{u.email || '—'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${
                          isAdmin 
                            ? 'text-[#B8763C] bg-[#B8763C]/10 ring-1 ring-inset ring-[#B8763C]/20 shadow-sm' 
                            : u.role === 'seller'
                            ? 'text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 shadow-sm'
                            : 'text-zinc-400 bg-zinc-500/10 ring-1 ring-inset ring-zinc-500/20'
                        }`}>
                          <Shield className="w-3 h-3 opacity-70" />
                          {u.role || 'customer'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-zinc-300">
                        {u.order_count || 0} orders
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-zinc-500 text-[13px] font-medium">
                          <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setRoleDialog(u); setNewRole(u.role || 'customer') }}
                          className="text-zinc-400 hover:text-white hover:bg-white/[0.06] h-8 px-3 rounded-lg active:scale-[0.95] transition-all"
                        >
                          <UserCog className="w-4 h-4 mr-1.5 text-[#B8763C]" /> Change Role
                        </Button>
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
              <h3 className="text-base font-display font-semibold text-white tracking-tight">No users found</h3>
              <p className="text-zinc-500 text-sm mt-1">Try broadening your search query or filter options.</p>
            </div>
          </div>
        )}
      </div>

      {/* Change Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-[420px] !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 flex items-center justify-center text-[#B8763C] shadow-sm shrink-0">
                <UserCog className="w-5 h-5" />
              </div>
              Modify User Role Access
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm pl-13 mt-1">
              Select target permission level for <strong className="text-zinc-200">{roleDialog?.full_name || 'this user'}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">System Role</label>
            <Select value={newRole} onValueChange={(val) => setNewRole(val || 'customer')}>
              <SelectTrigger className="h-11 bg-white/[0.02] border-white/[0.06] focus:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#121214] border-white/[0.08] shadow-2xl text-white rounded-xl">
                <SelectItem value="customer">Customer (Standard Access)</SelectItem>
                <SelectItem value="seller">Seller (Product Upload Access)</SelectItem>
                <SelectItem value="admin">Admin (Full Control Access)</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-[11px] text-zinc-500 bg-[#09090b]/50 p-3 rounded-xl border border-white/[0.04]">
              {newRole === 'admin' 
                ? <span className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" /> Admin access grants full permissions to manage products, orders, coupons, and store settings.</span>
                : newRole === 'seller'
                ? <span className="flex items-start gap-2"><ShoppingBag className="w-3.5 h-3.5 text-[#B8763C] shrink-0 mt-0.5" aria-hidden="true" /> Seller role grants access to the Seller Portal to upload and manage products.</span>
                : 'Customer role grants standard storefront shopping access.'}
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => setRoleDialog(null)} className="text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl active:scale-[0.97] transition-all">
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={updatingRole} className="bg-[#B8763C] hover:bg-[#a66833] active:scale-[0.97] text-white border-none rounded-xl font-semibold shadow-md shadow-[#B8763C]/20 transition-all">
              {updatingRole && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Role Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}