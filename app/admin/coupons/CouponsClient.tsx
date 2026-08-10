'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { Ticket, Plus, Loader2, Trash2, Search, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

interface CouponsClientProps {
  coupons: any[]
}

export function CouponsClient({ coupons: initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ id: string } | null>(null)

  // Create form state
  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState('')
  const [minPurchase, setMinPurchase] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [expiryDays, setExpiryDays] = useState('30')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { toast.error('Code is required'); return }
    setLoading(true)

    const expiry = new Date()
    expiry.setDate(expiry.getDate() + parseInt(expiryDays || '30'))

    const { data, error } = await supabase.from('coupons').insert([{
      code: code.toUpperCase(),
      type,
      value: parseFloat(value || '0'),
      min_purchase_amount: parseFloat(minPurchase || '0'),
      is_active: true,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      usage_count: 0,
      expiry_date: expiry.toISOString(),
    }] as any).select().single()

    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Coupon created!')
    if (data) setCoupons([data, ...coupons])
    setCreateOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setCode(''); setValue(''); setMinPurchase(''); setUsageLimit(''); setExpiryDays('30'); setType('percentage')
  }

  const openEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setCode(coupon.code || '')
    setType(coupon.type || 'percentage')
    setValue(coupon.value?.toString() || '')
    setMinPurchase(coupon.min_purchase_amount?.toString() || '')
    setUsageLimit(coupon.usage_limit?.toString() || '')
    setExpiryDays('30')
    setEditOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return
    if (!code.trim()) { toast.error('Code is required'); return }
    setLoading(true)

    const { error } = await supabase.from('coupons').update({
      code: code.toUpperCase(),
      type,
      value: parseFloat(value || '0'),
      min_purchase_amount: parseFloat(minPurchase || '0'),
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
    } as any).eq('id', editingCoupon.id)

    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Coupon updated!')
    setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...c, code: code.toUpperCase(), type, value: parseFloat(value || '0'), min_purchase_amount: parseFloat(minPurchase || '0'), usage_limit: usageLimit ? parseInt(usageLimit) : null } : c))
    setEditOpen(false)
    setEditingCoupon(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setDeleteDialog({ id })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return
    const { error } = await supabase.from('coupons').delete().eq('id', deleteDialog.id)
    if (error) { toast.error(error.message); setDeleteDialog(null); return }
    setCoupons(coupons.filter(c => c.id !== deleteDialog.id))
    toast.success('Coupon deleted')
    setDeleteDialog(null)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('coupons').update({ is_active: !currentStatus } as any).eq('id', id)
    if (error) { toast.error(error.message); return }
    setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
    toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Coupons</h1>
          <p className="text-zinc-400 text-sm mt-1">Create and manage discount codes.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={
            <Button className="bg-[#B8763C]/10 text-[#B8763C] ring-1 ring-inset ring-[#B8763C]/20 hover:bg-[#B8763C]/20 hover:ring-[#B8763C]/30 text-xs font-bold active:scale-[0.97] h-10 px-5 rounded-xl transition-all shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" /> Create Coupon
            </Button>
          } />
          <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-md !rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B8763C]/10 ring-1 ring-inset ring-[#B8763C]/20 flex items-center justify-center text-[#B8763C] shadow-sm shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                Create Coupon
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <CouponFormFields code={code} setCode={setCode} type={type} setType={setType} value={value} setValue={setValue} minPurchase={minPurchase} setMinPurchase={setMinPurchase} usageLimit={usageLimit} setUsageLimit={setUsageLimit} expiryDays={expiryDays} setExpiryDays={setExpiryDays} />
              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[#B8763C] hover:bg-[#a66833] text-white text-sm font-semibold active:scale-[0.97] transition-all shadow-md shadow-[#B8763C]/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search by code or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#09090b]/50 border-white/[0.04] focus-visible:ring-[#B8763C]/50 h-11 text-white placeholder-zinc-500 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden">
        {filteredCoupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-transparent text-zinc-500 border-b border-white/[0.04]">
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Code</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Type</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Value</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Min Purchase</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Usage</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Expiry</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredCoupons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 font-bold text-[#B8763C] font-mono text-[13px] group-hover:text-[#a66833] transition-colors tracking-tight">{c.code}</td>
                    <td className="px-5 py-4 text-zinc-300 capitalize text-[13px] font-medium">{c.type?.replace('_', ' ')}</td>
                    <td className="px-5 py-4 text-white font-mono text-[13px] font-semibold">
                      {c.type === 'percentage' ? `${c.value}%` : c.type === 'free_shipping' ? '—' : `${CURRENCY_SYMBOL}${c.value}`}
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-mono text-[13px]">{CURRENCY_SYMBOL}{c.min_purchase_amount}</td>
                    <td className="px-5 py-4 text-[12px] font-medium text-zinc-400">
                      <span className="text-white">{c.usage_count}</span>
                      {c.usage_limit ? <span className="text-zinc-600"> / {c.usage_limit}</span> : ''}
                    </td>
                    <td className="px-5 py-4 text-[12px] font-medium text-zinc-400">
                      {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(c.id, c.is_active)} className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] ${
                        c.is_active ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 shadow-sm' : 'text-zinc-400 bg-zinc-500/10 ring-1 ring-inset ring-zinc-500/20'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.95]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-[0.95]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-600 shadow-inner">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-white tracking-tight">No coupons found</h3>
              <p className="text-zinc-500 text-sm mt-1">{searchQuery ? 'No coupons match your search.' : 'Create your first discount code.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Coupon Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-md !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-400 shadow-sm shrink-0">
                <Pencil className="w-4 h-4" />
              </div>
              Edit Coupon
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <CouponFormFields code={code} setCode={setCode} type={type} setType={setType} value={value} setValue={setValue} minPurchase={minPurchase} setMinPurchase={setMinPurchase} usageLimit={usageLimit} setUsageLimit={setUsageLimit} />
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white border-none text-sm font-semibold active:scale-[0.97] transition-all">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="!bg-[#121214]/95 !backdrop-blur-3xl !border !border-white/[0.08] !shadow-2xl !text-white sm:max-w-[420px] !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2.5 font-display text-lg tracking-tight">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </div>
              Delete Coupon
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-3 leading-relaxed pl-10">
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialog(null)} className="text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl active:scale-[0.97]">Cancel</Button>
            <Button onClick={handleDeleteConfirm} className="bg-rose-500 hover:bg-rose-600 text-white border-none rounded-xl active:scale-[0.97] shadow-sm font-semibold">
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CouponFormFields({ code, setCode, type, setType, value, setValue, minPurchase, setMinPurchase, usageLimit, setUsageLimit, expiryDays, setExpiryDays }: {
  code: string; setCode: (v: string) => void
  type: string; setType: (v: string) => void
  value: string; setValue: (v: string) => void
  minPurchase: string; setMinPurchase: (v: string) => void
  usageLimit: string; setUsageLimit: (v: string) => void
  expiryDays?: string; setExpiryDays?: (v: string) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Code *</label>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER25" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm uppercase rounded-xl transition-all" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Type</label>
          <Select value={type} onValueChange={(val) => setType(val || 'percentage')}>
            <SelectTrigger className="h-11 bg-white/[0.02] border-white/[0.04] focus:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#121214] border-white/[0.08] shadow-2xl text-white rounded-xl">
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_discount">Fixed Discount</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Value</label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="15" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Min Purchase (₹)</label>
          <Input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} placeholder="499" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Usage Limit</label>
          <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="100" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
        </div>
      </div>
      {setExpiryDays && (
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Expires in (days)</label>
          <Input type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
        </div>
      )}
    </>
  )
}