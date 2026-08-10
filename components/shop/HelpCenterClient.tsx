'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { SmartAssistant } from '@/components/help/SmartAssistant'
import { 
  MessageCircle, Mail, HelpCircle, ArrowRight, ShieldCheck, 
  Send, Sparkles, MapPin, Phone, Palette, Truck, CreditCard, 
  Award, Paperclip, CheckCircle2, Zap, FileText, RefreshCw, 
  Package, Clock, X, Ruler
} from 'lucide-react'

export function HelpCenterClient() {
  const [activeHelpTab, setActiveHelpTab] = useState<'ai' | 'form'>('ai')

  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactOrderNum, setContactOrderNum] = useState('')
  const [contactTopic, setContactTopic] = useState('Order & Tracking')
  const [priority, setPriority] = useState<'Standard' | 'Urgent' | 'VIP'>('Standard')
  const [contactMessage, setContactMessage] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  const topicOptions = [
    { id: 'Order & Tracking', label: 'Order & Tracking', icon: Truck, badge: 'Live Order' },
    { id: 'Sizing & Fit', label: 'Sizing & Fit Advice', icon: Award, badge: '240 GSM' },
    { id: 'Return or Exchange', label: 'Return or Exchange', icon: RefreshCw, badge: '7-Day Policy' },
    { id: 'Custom Studio Drop', label: 'Custom Design Workbench', icon: Palette, badge: 'DTG Print' },
    { id: 'Bulk Brand Collab', label: 'Bulk Drops & Collabs', icon: Package, badge: 'Special Rate' },
    { id: 'Billing & Refund', label: 'Billing & Refunds', icon: CreditCard, badge: '100% Safe' }
  ]

  const priorityOptions = [
    { id: 'Standard', label: 'Standard', sla: '< 4 Hours Reply', icon: Clock, color: 'text-neutral-700 bg-[#FAF7F4] border-[#E8E2DB]' },
    { id: 'Urgent', label: 'High Priority', sla: '< 1 Hour Reply', icon: Zap, color: 'text-amber-700 bg-amber-500/10 border-amber-500/30' },
    { id: 'VIP', label: 'VIP Concierge', sla: 'Immediate Handling', icon: Sparkles, color: 'text-[#B8763C] bg-[#B8763C]/10 border-[#B8763C]/30' }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.')
        return
      }
      setAttachedFile(file)
      toast.success(`Attached: ${file.name}`)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error('Please complete all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          orderNum: contactOrderNum,
          topic: contactTopic,
          priority: priority,
          message: contactMessage,
          fileUrl: attachedFile ? attachedFile.name : null
        })
      })

      const json = await res.json()
      setIsSubmitting(false)

      if (json.success) {
        setSubmittedSuccess(true)
        toast.success('Message dispatched to Alpona Admin Support! Check your inbox for updates.')
      } else {
        toast.error(json.error || 'Failed to dispatch ticket. Please try again.')
      }
    } catch (err) {
      setIsSubmitting(false)
      toast.error('Network error. Please check your connection.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans space-y-12 lg:space-y-16">

      {/* ─── 1. ALPONA BRAND MOTIVE & GUARANTEES BANNER ─── */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="w-12 h-12 rounded-xl bg-[#B8763C]/20 border border-[#B8763C]/40 text-[#B8763C] flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">240 GSM Heavyweight</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">100% Combed Organic Cotton</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">OEKO-TEX® DTG Inks</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">100% Vegan & Non-Toxic Prints</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">3-5 Days India Express</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Free Express Shipping &gt; ₹999</p>
            </div>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#B8763C]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ─── 2. HIGH-TOUCH CONCIERGE SUPPORT CHANNELS ─── */}
      <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8763C]">Human Concierge</span>
          <h3 className="text-2xl font-serif font-extrabold text-[#1A1A1A]">
            Direct Support Channels
          </h3>
          <p className="text-xs text-neutral-500 font-medium">
            Connect directly with our studio support concierge via WhatsApp, phone, or email.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="https://wa.me/918100412401?text=Hi%20Alpona%20Concierge%2C%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-white border border-[#E8E2DB] hover:border-[#25D366] transition-all flex items-center gap-3.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-[#1A1A1A] group-hover:text-[#25D366] transition-colors">WhatsApp Live</h5>
              <p className="text-[11px] text-neutral-500 font-medium">+91 81004 12401</p>
            </div>
          </a>

          <a
            href="tel:+918100412401"
            className="p-5 rounded-2xl bg-white border border-[#E8E2DB] hover:border-[#B8763C] transition-all flex items-center gap-3.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors">VIP Call Line</h5>
              <p className="text-[11px] text-neutral-500 font-medium">Mon-Sat (10am-7pm)</p>
            </div>
          </a>

          <a
            href="mailto:support@alpona.in"
            className="p-5 rounded-2xl bg-white border border-[#E8E2DB] hover:border-amber-600 transition-all flex items-center gap-3.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Mail size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-[#1A1A1A] group-hover:text-amber-600 transition-colors">Email Desk</h5>
              <p className="text-[11px] text-neutral-500 font-medium">support@alpona.in</p>
            </div>
          </a>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E2DB] flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-[#E8E2DB] text-[#1A1A1A] flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-[#1A1A1A]">Studio HQ</h5>
              <p className="text-[11px] text-neutral-500 font-medium">Kolkata, West Bengal</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB SWITCHER (AI ASSISTANT vs DIRECT CONCIERGE FORM) ─── */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Animated Segmented Tab Switcher */}
        <div className="flex items-center justify-center p-1.5 bg-white border border-[#E8E2DB] rounded-2xl max-w-md mx-auto shadow-xs relative">
          <button
            type="button"
            onClick={() => setActiveHelpTab('ai')}
            className={`relative flex-1 py-3 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors duration-200 z-10 flex items-center justify-center gap-2 cursor-pointer ${
              activeHelpTab === 'ai' ? 'text-[#1A1A1A]' : 'text-neutral-400 hover:text-[#1A1A1A]'
            }`}
          >
            {activeHelpTab === 'ai' && (
              <motion.div
                layoutId="activeHelpTabBg"
                className="absolute inset-0 bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl shadow-2xs -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Sparkles size={14} className={activeHelpTab === 'ai' ? 'text-[#B8763C]' : 'text-neutral-400'} />
            <span>AI Assistant (Fast)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHelpTab('form')}
            className={`relative flex-1 py-3 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors duration-200 z-10 flex items-center justify-center gap-2 cursor-pointer ${
              activeHelpTab === 'form' ? 'text-[#1A1A1A]' : 'text-neutral-400 hover:text-[#1A1A1A]'
            }`}
          >
            {activeHelpTab === 'form' && (
              <motion.div
                layoutId="activeHelpTabBg"
                className="absolute inset-0 bg-[#FAF7F4] border border-[#E8E2DB] rounded-xl shadow-2xs -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Send size={14} className={activeHelpTab === 'form' ? 'text-[#B8763C]' : 'text-neutral-400'} />
            <span>Direct Message Form</span>
          </button>
        </div>

        {/* Tab Content Animated Container */}
        <AnimatePresence mode="wait">
          {activeHelpTab === 'ai' ? (
            <motion.div
              key="ai-tab"
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h4 className="text-xl font-serif font-extrabold text-[#1A1A1A]">
                  24/7 AI Customer Assistant
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  Instant replies regarding order status, 240 GSM size advice, custom studio prints, and shipping.
                </p>
              </div>
              <SmartAssistant />
            </motion.div>
          ) : (
            <motion.div
              key="form-tab"
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white border border-[#E8E2DB] rounded-3xl p-6 sm:p-10 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.06)] space-y-8"
            >
              {/* Form Header & SLA Guarantee Pill */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E8E2DB] pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
                    <Sparkles size={12} /> Priority Support Suite
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1A1A1A]">
                    Direct Concierge Communication
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    Submit your inquiry with topic routing, order attachment, and urgency SLA tracking.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#FAF7F4] border border-[#E8E2DB] px-4 py-2.5 rounded-2xl shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-[#1A1A1A]">Studio Active (10 AM - 7 PM)</span>
                </div>
              </div>

              {submittedSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-serif font-extrabold text-[#1A1A1A]">Concierge Request Dispatched!</h4>
                  <p className="text-xs text-neutral-600 font-medium max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold text-[#1A1A1A]">{contactName}</span>! Your inquiry regarding <span className="font-bold text-[#B8763C]">{contactTopic}</span> has been logged under priority <span className="font-bold text-[#1A1A1A]">{priority}</span>. Our concierge team will reach out to <span className="font-bold text-[#1A1A1A]">{contactEmail}</span>.
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#B8763C] transition-all cursor-pointer"
                  >
                    Submit Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  
                  {/* Step 1: Topic Selector Pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider block">
                      1. Select Inquiry Topic *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {topicOptions.map(t => {
                        const IconComp = t.icon
                        const isSelected = contactTopic === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setContactTopic(t.id)}
                            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-[#B8763C]/10 border-[#B8763C] text-[#1A1A1A] shadow-xs scale-[1.01]' 
                                : 'bg-[#FAF7F4] border-[#E8E2DB] text-neutral-600 hover:border-neutral-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <IconComp size={16} className={isSelected ? 'text-[#B8763C]' : 'text-neutral-400'} />
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#B8763C] text-white' : 'bg-neutral-200/60 text-neutral-600'}`}>
                                {t.badge}
                              </span>
                            </div>
                            <span className="text-xs font-extrabold truncate">{t.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2: Contact Details */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider block">
                      2. Contact Information *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-600">Full Name *</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Sohan Mandal"
                          className="w-full px-4 py-3.5 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-600">Email Address *</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3.5 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-600">WhatsApp / Phone Number (Optional)</label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3.5 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-600">Order ID (Optional)</label>
                        <input
                          type="text"
                          value={contactOrderNum}
                          onChange={(e) => setContactOrderNum(e.target.value)}
                          placeholder="e.g. ALP-104"
                          className="w-full px-4 py-3.5 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Urgency Priority Level */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider block">
                      3. Response Urgency SLA
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {priorityOptions.map(p => {
                        const isSelected = priority === p.id
                        const IconComp = p.icon
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPriority(p.id as any)}
                            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected 
                                ? `${p.color} border-current font-extrabold scale-[1.01]` 
                                : 'bg-[#FAF7F4] border-[#E8E2DB] text-neutral-600 hover:border-neutral-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <IconComp size={15} />
                              <div>
                                <p className="text-xs font-bold">{p.label}</p>
                                <p className="text-[10px] opacity-80">{p.sla}</p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 size={15} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 4: Message & Attachment */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider block">
                      4. Message & Photo Evidence *
                    </label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={4}
                      placeholder="Describe your inquiry in detail..."
                      className="w-full px-4 py-3.5 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all resize-none"
                      required
                    />

                    {/* File Upload Zone */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 bg-[#FAF7F4] hover:bg-[#E8E2DB]/60 border border-[#E8E2DB] text-[#1A1A1A] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 shadow-2xs">
                        <Paperclip size={14} className="text-[#B8763C]" />
                        <span>{attachedFile ? 'Change Attachment' : 'Attach Photo/Screenshot'}</span>
                        <input type="file" onChange={handleFileChange} accept="image/*,.pdf" className="hidden" />
                      </label>

                      {attachedFile && (
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                          <FileText size={13} />
                          <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="text-emerald-700 hover:text-emerald-900 ml-1"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 bg-[#1A1A1A] hover:bg-[#B8763C] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Dispatching Message...' : 'Submit Concierge Ticket'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ─── 4. QUICK PORTAL SHORTCUTS FOOTER BAR ─── */}
      <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="text-center sm:text-left space-y-0.5">
          <h4 className="text-sm font-extrabold text-[#1A1A1A]">Looking for specific studio pages?</h4>
          <p className="text-xs text-neutral-500 font-medium">Quick links to order tracking, size guide, and FAQs.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2DB] text-xs font-bold text-[#1A1A1A] hover:border-[#B8763C] hover:text-[#B8763C] transition-all shadow-2xs"
          >
            <Truck size={13} /> Track Order
          </Link>

          <Link
            href="/returns"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2DB] text-xs font-bold text-[#1A1A1A] hover:border-[#B8763C] hover:text-[#B8763C] transition-all shadow-2xs"
          >
            <RefreshCw size={13} /> Return Portal
          </Link>

          <Link
            href="/faq"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2DB] text-xs font-bold text-[#1A1A1A] hover:border-[#B8763C] hover:text-[#B8763C] transition-all shadow-2xs"
          >
            <HelpCircle size={13} /> FAQ Directory
          </Link>

          <Link
            href="/size-guide"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2DB] text-xs font-bold text-[#1A1A1A] hover:border-[#B8763C] hover:text-[#B8763C] transition-all shadow-2xs"
          >
            <Ruler size={13} /> Size Guide
          </Link>
        </div>
      </div>

    </div>
  )
}

