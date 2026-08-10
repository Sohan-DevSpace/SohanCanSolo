'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Truck, Loader2, Save, Globe, IndianRupee } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [domesticEnabled, setDomesticEnabled] = useState(true)
  const [domesticBaseRate, setDomesticBaseRate] = useState('49')
  const [domesticPerItem, setDomesticPerItem] = useState('0')
  const [domesticFreeThreshold, setDomesticFreeThreshold] = useState('499')
  const [internationalEnabled, setInternationalEnabled] = useState(false)
  const [internationalBaseRate, setInternationalBaseRate] = useState('499')
  const [internationalPerItem, setInternationalPerItem] = useState('100')
  const [estimatedDaysMin, setEstimatedDaysMin] = useState('3')
  const [estimatedDaysMax, setEstimatedDaysMax] = useState('7')
  const [codEnabled, setCodEnabled] = useState(true)
  const [codCharge, setCodCharge] = useState('29')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 'shipping').single()
      if (data) {
        setDomesticEnabled(data.domestic_enabled ?? true)
        setDomesticBaseRate(data.domestic_base_rate?.toString() || '49')
        setDomesticPerItem(data.domestic_per_item?.toString() || '0')
        setDomesticFreeThreshold(data.domestic_free_threshold?.toString() || '499')
        setInternationalEnabled(data.international_enabled ?? false)
        setInternationalBaseRate(data.international_base_rate?.toString() || '499')
        setInternationalPerItem(data.international_per_item?.toString() || '100')
        setEstimatedDaysMin(data.estimated_days_min?.toString() || '3')
        setEstimatedDaysMax(data.estimated_days_max?.toString() || '7')
        setCodEnabled(data.cod_enabled ?? true)
        setCodCharge(data.cod_charge?.toString() || '29')
      }
      setLoading(false)
    }
    fetch()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('store_settings').upsert({
      id: 'shipping',
      domestic_enabled: domesticEnabled,
      domestic_base_rate: parseFloat(domesticBaseRate || '0'),
      domestic_per_item: parseFloat(domesticPerItem || '0'),
      domestic_free_threshold: domesticFreeThreshold ? parseFloat(domesticFreeThreshold) : null,
      international_enabled: internationalEnabled,
      international_base_rate: parseFloat(internationalBaseRate || '0'),
      international_per_item: parseFloat(internationalPerItem || '0'),
      estimated_days_min: parseInt(estimatedDaysMin || '3'),
      estimated_days_max: parseInt(estimatedDaysMax || '7'),
      cod_enabled: codEnabled,
      cod_charge: parseFloat(codCharge || '0'),
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Shipping settings saved!')
  }

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
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Shipping</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure shipping zones, rates, and delivery estimates.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#B8763C] hover:bg-[#a66833] active:scale-[0.97] text-white text-xs font-semibold h-10 px-5 rounded-xl transition-all shadow-md shadow-[#B8763C]/20 shrink-0">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      {/* Domestic Shipping */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 text-balance">
            <Truck className="w-3.5 h-3.5 text-[#B8763C]" /> Domestic Shipping
          </h2>
          <button
            type="button"
            onClick={() => setDomesticEnabled(!domesticEnabled)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] ${domesticEnabled ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 shadow-sm' : 'text-zinc-500 bg-white/[0.02] ring-1 ring-inset ring-white/[0.04]'}`}
          >
            {domesticEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Base Rate (₹)</label>
            <Input type="number" value={domesticBaseRate} onChange={(e) => setDomesticBaseRate(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Per Item (₹)</label>
            <Input type="number" value={domesticPerItem} onChange={(e) => setDomesticPerItem(e.target.value)} placeholder="0" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Free Shipping Threshold (₹)</label>
            <Input type="number" value={domesticFreeThreshold} onChange={(e) => setDomesticFreeThreshold(e.target.value)} placeholder="499" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
        </div>
      </div>

      {/* International Shipping */}
      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 text-balance">
            <Globe className="w-3.5 h-3.5 text-[#B8763C]" /> International Shipping
          </h2>
          <button
            type="button"
            onClick={() => setInternationalEnabled(!internationalEnabled)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] ${internationalEnabled ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 shadow-sm' : 'text-zinc-500 bg-white/[0.02] ring-1 ring-inset ring-white/[0.04]'}`}
          >
            {internationalEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Base Rate (₹)</label>
            <Input type="number" value={internationalBaseRate} onChange={(e) => setInternationalBaseRate(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Per Item (₹)</label>
            <Input type="number" value={internationalPerItem} onChange={(e) => setInternationalPerItem(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
        </div>
      </div>

      {/* Delivery Estimate & COD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-5">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-balance">Delivery Estimate (Days)</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Min</label>
              <Input type="number" value={estimatedDaysMin} onChange={(e) => setEstimatedDaysMin(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Max</label>
              <Input type="number" value={estimatedDaysMax} onChange={(e) => setEstimatedDaysMax(e.target.value)} className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 text-balance">
              <IndianRupee className="w-3.5 h-3.5 text-[#B8763C]" /> Cash on Delivery
            </h2>
            <button
              type="button"
              onClick={() => setCodEnabled(!codEnabled)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] ${codEnabled ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 shadow-sm' : 'text-zinc-500 bg-white/[0.02] ring-1 ring-inset ring-white/[0.04]'}`}
            >
              {codEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">COD Charge (₹)</label>
            <Input type="number" value={codCharge} onChange={(e) => setCodCharge(e.target.value)} placeholder="29" className="h-11 bg-white/[0.02] border-white/[0.04] focus-visible:ring-[#B8763C]/50 text-white text-sm rounded-xl transition-all" />
          </div>
        </div>
      </div>
    </div>
  )
}
