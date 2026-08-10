'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Database } from '@/lib/types/database'

import {
  AnimatedPlus,
  AnimatedTrash,
  AnimatedMapPin,
  AnimatedPhone,
  AnimatedUser,
  AnimatedHome,
  AnimatedArrowLeft,
  AnimatedEdit,
} from '@/components/shared/AnimatedIcons'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { containerVariants, itemVariants, SPRING_STIFF, SPRING_GENTLE, EASE_OUT_CUBIC } from '@/components/shared/authVariants'

type Address = Database['public']['Tables']['addresses']['Row']

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Lakshadweep', 'Puducherry',
]

const emptyForm = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  is_default: false,
  label: '' as 'home' | 'work' | '',
}

export default function AddressesPage() {
  const { user } = useUser()
  const supabase = createClient()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null)

  const fetchAddresses = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAddresses(data || [])
    } catch (error) {
      toast.error('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) fetchAddresses()
  }, [user, fetchAddresses])

  const openAddForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (address: Address) => {
    setEditingId(address.id)
    setFormData({
      full_name: address.full_name || '',
      phone: address.phone || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      is_default: address.is_default || false,
      label: (address as any).label || '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }

    setIsSaving(true)
    try {
      if (formData.is_default || addresses.length === 0) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      }

      const payload = {
        user_id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        is_default: formData.is_default || addresses.length === 0,
      }

      if (editingId) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success('Address updated')
      } else {
        const { error } = await supabase.from('addresses').insert(payload)
        if (error) throw error
        toast.success('Address added')
      }

      await fetchAddresses()
      closeForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', deleteTarget.id)
      if (error) throw error
      
      setAddresses(prev => prev.filter(a => a.id !== deleteTarget.id))
      toast.success('Address deleted')
      setDeleteTarget(null)

      if (deleteTarget.is_default && addresses.length > 1) {
        const nextAddress = addresses.find(a => a.id !== deleteTarget.id)
        if (nextAddress) {
          await supabase.from('addresses').update({ is_default: true }).eq('id', nextAddress.id)
          await fetchAddresses()
        }
      }
    } catch (error: any) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user?.id)
      await supabase.from('addresses').update({ is_default: true }).eq('id', id)
      await fetchAddresses()
      toast.success('Default address updated')
    } catch (error) {
      toast.error('Failed to update default address')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse py-4 w-full">
        <div className="h-8 bg-neutral-100 rounded-xl w-1/4" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-neutral-100 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <motion.div variants={itemVariants}>
          <h2 className="text-balance text-2xl font-serif font-bold text-[#1A1A1A] mb-1">Saved Addresses</h2>
          <p className="text-[13px] text-neutral-500 font-medium">Manage your delivery locations for faster checkout.</p>
        </motion.div>
        
        <AnimatePresence>
          {!showForm && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={SPRING_GENTLE}>
              <button
                onClick={openAddForm}
                className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97] flex items-center gap-2 cursor-pointer"
              >
                <AnimatedPlus size={16} /> Add New Address
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: EASE_OUT_CUBIC }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[32px] border border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
                  {editingId ? <AnimatedEdit size={20} className="text-[#B8763C]" /> : <AnimatedPlus size={20} className="text-[#B8763C]" />}
                  {editingId ? 'Edit Address' : 'New Delivery Address'}
                </h3>
                <button type="button" onClick={closeForm} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all duration-200 cursor-pointer">
                  <AnimatedPlus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Full Name</label>
                  <div className="relative">
                    <AnimatedUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors" />
                    <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl pl-11 pr-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 placeholder:text-neutral-300 shadow-sm"
                      placeholder="e.g. John Doe" />
                  </div>
                </div>
                
                <div className="space-y-1.5 group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <AnimatedPhone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors" />
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0,10)})}
                      className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl pl-11 pr-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 placeholder:text-neutral-300 shadow-sm"
                      placeholder="10-digit mobile number" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 group/input">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Address Line 1</label>
                <div className="relative">
                  <AnimatedMapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors" />
                  <input type="text" required value={formData.address_line1} onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl pl-11 pr-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 placeholder:text-neutral-300 shadow-sm"
                    placeholder="Enter street address" />
                </div>
              </div>

              <div className="space-y-1.5 group/input">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Address Line 2 (Optional)</label>
                <div className="relative">
                  <AnimatedMapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors opacity-50" />
                  <input type="text" value={formData.address_line2} onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl pl-11 pr-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 placeholder:text-neutral-300 shadow-sm"
                    placeholder="Apartment, suite, unit, etc." />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="space-y-1.5 md:col-span-1 group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">City</label>
                  <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 placeholder:text-neutral-300 shadow-sm"
                    placeholder="City / Town" />
                </div>
                
                <div className="space-y-1.5 md:col-span-1 group/input relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">State</label>
                  <select required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 shadow-sm appearance-none cursor-pointer">
                    <option value="" disabled className="text-neutral-300">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5 md:col-span-1 group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Pincode</label>
                  <input type="text" required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').slice(0,6)})}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 placeholder:text-neutral-300 shadow-sm"
                    placeholder="6-digit PIN" />
                </div>
                
                <div className="space-y-1.5 md:col-span-1 group/input relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Label</label>
                  <select value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value as any})}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3.5 text-[#1A1A1A] text-[13px] font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all duration-300 shadow-sm appearance-none cursor-pointer">
                    <option value="">None</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="is_default" checked={formData.is_default} onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                  className="w-5 h-5 rounded-[6px] border border-neutral-200 text-[#B8763C] focus:ring-[#B8763C] cursor-pointer" />
                <label htmlFor="is_default" className="text-[13px] font-bold text-neutral-700 cursor-pointer">Set as default shipping address</label>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-neutral-100">
                <button type="button" onClick={closeForm} className="px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {isSaving && <AnimatedEdit size={14} />}
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {addresses.length === 0 && !showForm ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center border border-dashed border-neutral-200 rounded-[32px] bg-neutral-50/50 flex flex-col items-center">
            <div className="w-20 h-20 bg-white border border-neutral-100 shadow-sm rounded-full flex items-center justify-center mb-6">
              <AnimatedMapPin size={32} className="text-neutral-300" />
            </div>
            <p className="text-base font-bold text-[#1A1A1A]">No addresses saved</p>
            <p className="text-[13px] text-neutral-500 mt-2 max-w-[280px] font-medium mb-6">Add a delivery location to experience faster and smoother checkouts.</p>
            <button
              onClick={openAddForm}
              className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97] flex items-center gap-2 cursor-pointer"
            >
              <AnimatedPlus size={16} /> Add New Address
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The dashed "Add New" card shown when there are addresses but form isn't open */}
            {!showForm && addresses.length > 0 && (
              <motion.button
                layout
                onClick={openAddForm}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="p-8 rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50/30 hover:bg-neutral-50 hover:border-[#B8763C]/30 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer min-h-[220px] group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-neutral-100 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#B8763C] group-hover:border-[#B8763C] transition-all duration-300">
                  <AnimatedPlus size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-[14px] text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors">Add New Address</h4>
              </motion.button>
            )}

            {addresses.map((address) => (
              <motion.div
                key={address.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`p-6 md:p-8 rounded-[32px] border flex flex-col justify-between transition-all duration-300 ${
                  address.is_default
                    ? 'border-[#B8763C]/30 bg-orange-50/30 shadow-[0_4px_24px_rgba(184,118,60,0.06)]'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-md shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-[15px] text-[#1A1A1A] mr-2">{address.full_name}</h4>
                      {address.is_default && (
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-[#B8763C] text-white px-2.5 py-1 rounded-md shadow-sm">Default</span>
                      )}
                      {(address as any).label && (
                        <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                          (address as any).label === 'home'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {(address as any).label === 'home' ? <AnimatedHome size={10} /> : <AnimatedMapPin size={10} />}
                          {(address as any).label}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-neutral-500 text-[13px] leading-relaxed space-y-1 font-medium bg-white/50 rounded-2xl">
                    <p className="text-neutral-700">{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} &mdash; {address.pincode}</p>
                    
                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                        <AnimatedPhone size={14} className="text-neutral-400" />
                      </div>
                      <span className="font-bold text-neutral-700">{address.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-neutral-100">
                  <button onClick={() => openEditForm(address)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-[11px] font-bold uppercase tracking-widest text-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                    <AnimatedEdit size={14} /> Edit
                  </button>
                  {!address.is_default && (
                    <button onClick={() => handleSetDefault(address.id)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-[#B8763C]/5 hover:border-[#B8763C]/30 text-[11px] font-bold uppercase tracking-widest text-[#B8763C] transition-all cursor-pointer shadow-sm">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(address)} className="w-11 h-11 rounded-xl bg-white border border-neutral-200 hover:border-red-200 text-[#8C8375] hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0" aria-label="Delete address">
                    <AnimatedTrash size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        message={`Are you sure you want to delete the address for "${deleteTarget?.full_name || 'this recipient'}"? This cannot be undone.`}
        confirmLabel="Delete Address"
        variant="danger"
      />
    </motion.div>
  )
}
