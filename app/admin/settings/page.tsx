'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Settings as SettingsIcon, Database, Cpu, ShieldCheck, Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [taxPercentage, setTaxPercentage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 'global').single()
      if (data) {
        setStoreName(data.store_name || '')
        setContactEmail(data.contact_email || '')
        setContactPhone(data.contact_phone || '')
        setTaxPercentage(data.tax_percentage?.toString() || '18')
      }
      setLoading(false)
    }
    fetch()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('store_settings').upsert({
      id: 'global',
      store_name: storeName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      tax_percentage: parseFloat(taxPercentage || '18'),
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Settings saved!')
  }

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const isQikinkConfigured = !!process.env.NEXT_PUBLIC_QIKINK_CLIENT_ID || !!process.env.QIKINK_CLIENT_ID
  const isRazorpayConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#B8763C]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Store configuration and integration status.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#B8763C] hover:bg-[#a66833] active:scale-[0.97] text-white text-xs font-semibold h-10 px-5 rounded-xl transition-all shadow-md shadow-[#B8763C]/20 shrink-0">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      {/* Store Info */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-5">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 text-balance">
          <SettingsIcon className="w-3.5 h-3.5 text-[#B8763C]" /> Store Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Store Name</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Contact Email</label>
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Contact Phone</label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tax (%)</label>
            <Input type="number" value={taxPercentage} onChange={(e) => setTaxPercentage(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-5">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-balance">Integrations</h2>
        <div className="space-y-3">
          {[
            { name: 'Supabase', desc: 'Database & Authentication', icon: Database, ok: isSupabaseConfigured },
            { name: 'Qikink', desc: 'Print-on-Demand Fulfillment', icon: Cpu, ok: isQikinkConfigured },
            { name: 'Razorpay', desc: 'Payment Gateway', icon: ShieldCheck, ok: isRazorpayConfigured },
          ].map(g => (
            <div key={g.name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/[0.08] transition-colors shadow-inner shrink-0">
                  <g.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">{g.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{g.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.02] px-2.5 py-1 rounded-md border border-white/[0.04]">
                <span className={`w-1.5 h-1.5 rounded-full ${g.ok ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${g.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {g.ok ? 'Connected' : 'Missing'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-4">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-balance">Environment</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest font-bold">Node</span>
            <span className="text-zinc-300 font-medium">v20+</span>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest font-bold">Framework</span>
            <span className="text-zinc-300 font-medium">Next.js 15</span>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest font-bold">Database</span>
            <span className="text-zinc-300 font-medium">Supabase</span>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest font-bold">Hosting</span>
            <span className="text-zinc-300 font-medium">Vercel</span>
          </div>
        </div>
      </div>
    </div>
  )
}
