'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

import {
  AnimatedKey,
  AnimatedBell,
  AnimatedShieldAlert,
  AnimatedLogOut,
  AnimatedCheck,
  AnimatedEye,
  AnimatedEyeOff,
  AnimatedMail,
  AnimatedChevronDown
} from '@/components/shared/AnimatedIcons'
import { AnimatedToggle } from '@/components/shared/AnimatedToggle'
import { containerVariants, itemVariants, SPRING_GENTLE, EASE_OUT_CUBIC } from '@/components/shared/authVariants'

export default function SettingsPage() {
  const { user } = useUser()
  const supabase = createClient()

  // Password
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false)

  // Notification prefs
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [orderTracking, setOrderTracking] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [prefsLoading, setPrefsLoading] = useState(true)

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [emailSectionOpen, setEmailSectionOpen] = useState(false)

  // Fetch current notification prefs
  useEffect(() => {
    async function loadPrefs() {
      if (!user) return
      try {
        const { data } = await supabase
          .from('user_notification_prefs')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setEmailAlerts(data.email_alerts)
          setOrderTracking(data.order_tracking)
          setMarketing(data.marketing)
        }
      } catch {
        // Table might not exist yet
      } finally {
        setPrefsLoading(false)
      }
    }
    loadPrefs()
  }, [user, supabase])

  // Password handlers
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated!')
      setPassword('')
      setConfirmPassword('')
      setPasswordSectionOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  // Notification prefs handler
  async function handleSavePrefs() {
    if (!user) return
    setIsSavingPrefs(true)
    try {
      const { error } = await supabase
        .from('user_notification_prefs')
        .upsert({
          user_id: user.id,
          email_alerts: emailAlerts,
          order_tracking: orderTracking,
          marketing: marketing,
        }, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Notification preferences saved!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences')
    } finally {
      setIsSavingPrefs(false)
    }
  }

  // Email change handler
  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail) return
    setIsSavingEmail(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      toast.success('Verification email sent to new address. Please check both inboxes.')
      setNewEmail('')
      setEmailSectionOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email')
    } finally {
      setIsSavingEmail(false)
    }
  }

  if (prefsLoading) {
    return (
      <div className="space-y-4 animate-pulse py-4 w-full">
        <div className="h-8 bg-neutral-100 rounded-xl w-1/4" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="h-64 bg-neutral-100 rounded-3xl" />
          <div className="h-64 bg-neutral-100 rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
      <div className="mb-10">
        <motion.h2 variants={itemVariants} className="text-balance text-2xl font-serif font-bold text-[#1A1A1A] mb-1">Account Settings</motion.h2>
        <motion.p variants={itemVariants} className="text-[13px] text-neutral-500 font-medium">Manage your account security, notifications, and email preferences.</motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Security & Account */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-[32px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-5">
              <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                <AnimatedShieldAlert size={18} className="text-[#B8763C]" />
              </div>
              <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#1A1A1A]">Security & Login</h3>
            </div>

            {/* Email Update */}
            <div className="pt-2">
              <button
                onClick={() => setEmailSectionOpen(!emailSectionOpen)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 border border-neutral-100 hover:border-neutral-200 active:scale-[0.97] cursor-pointer group"
              >
                <div className="flex items-center gap-3 text-left">
                  <AnimatedMail size={16} className="text-neutral-400 group-hover:text-[#B8763C] transition-colors" />
                  <div>
                    <span className="block text-[12px] font-bold text-[#1A1A1A]">Primary Email Address</span>
                    <span className="block text-[11px] text-neutral-500 font-medium mt-0.5">{user?.email}</span>
                  </div>
                </div>
                <motion.span animate={{ rotate: emailSectionOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <AnimatedChevronDown size={16} className="text-neutral-400 group-hover:text-[#B8763C]" />
                </motion.span>
              </button>

              <AnimatePresence>
                {emailSectionOpen && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
                    onSubmit={handleEmailChange}
                    className="overflow-hidden pt-4 space-y-4 px-2"
                  >
                    <div className="space-y-1.5 group/input">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">New Email Address</label>
                      <div className="relative">
                        <AnimatedMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors" />
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl pl-11 pr-4 py-3 text-[#1A1A1A] text-[13px] font-semibold focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all placeholder:text-neutral-300"
                          placeholder="Enter new email"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingEmail || !newEmail}
                      className="w-full bg-[#1A1A1A] text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#2A2A2A] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.97]"
                    >
                      {isSavingEmail ? <AnimatedMail size={14} /> : <AnimatedCheck size={14} />}
                      Request Email Change
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Password Update */}
            <div>
              <button
                onClick={() => setPasswordSectionOpen(!passwordSectionOpen)}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 border border-neutral-100 hover:border-neutral-200 active:scale-[0.97] cursor-pointer group"
              >
                <div className="flex items-center gap-3 text-left">
                  <AnimatedKey size={16} className="text-neutral-400 group-hover:text-[#B8763C] transition-colors" />
                  <div>
                    <span className="block text-[12px] font-bold text-[#1A1A1A]">Account Password</span>
                    <span className="block text-[11px] text-neutral-500 font-medium mt-0.5">Last changed 3 months ago</span>
                  </div>
                </div>
                <motion.span animate={{ rotate: passwordSectionOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <AnimatedChevronDown size={16} className="text-neutral-400 group-hover:text-[#B8763C]" />
                </motion.span>
              </button>

              <AnimatePresence>
                {passwordSectionOpen && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
                    onSubmit={handlePasswordSubmit}
                    className="overflow-hidden pt-4 space-y-4 px-2"
                  >
                    <div className="space-y-1.5 group/input">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">New Password</label>
                      <div className="relative">
                        <AnimatedKey className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors" size={16} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl pl-11 pr-11 py-3 text-[#1A1A1A] text-[13px] font-semibold focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all placeholder:text-neutral-300"
                          placeholder="At least 8 characters"
                          required
                          minLength={8}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer active:scale-[0.97]">
                          {showPassword ? <AnimatedEyeOff size={16} /> : <AnimatedEye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 group/input">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Confirm Password</label>
                      <div className="relative">
                        <AnimatedKey className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within/input:text-[#B8763C] transition-colors" size={16} />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl pl-11 pr-11 py-3 text-[#1A1A1A] text-[13px] font-semibold focus:outline-none focus:border-[#B8763C] focus:ring-[3px] focus:ring-[#B8763C]/10 transition-all placeholder:text-neutral-300"
                          placeholder="Confirm new password"
                          required
                          minLength={8}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer active:scale-[0.97]">
                          {showConfirm ? <AnimatedEyeOff size={16} /> : <AnimatedEye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingPassword || !password || !confirmPassword}
                      className="w-full bg-[#1A1A1A] text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#2A2A2A] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.97]"
                    >
                      {isSavingPassword ? <AnimatedKey size={14} /> : <AnimatedCheck size={14} />}
                      Update Password
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Notifications & Danger Zone */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-[32px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-5">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <AnimatedBell size={18} className="text-blue-500" />
              </div>
              <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#1A1A1A]">Notifications</h3>
            </div>

            <div className="space-y-6 pt-2">
              {[
                { label: 'Transactional Email Alerts', desc: 'Order receipts, security alerts, profile updates', value: emailAlerts, set: setEmailAlerts },
                { label: 'Qikink Shipping Alerts', desc: 'Live courier dispatch coordinates & status changes', value: orderTracking, set: setOrderTracking },
                { label: 'Marketing Newsletters', desc: 'Occasional studio catalog collections updates', value: marketing, set: setMarketing },
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
                  <div>
                    <label className="text-[12px] font-bold text-[#1A1A1A] block">{item.label}</label>
                    <span className="text-[11px] text-neutral-500 font-medium mt-0.5 block leading-relaxed pr-4">{item.desc}</span>
                  </div>
                  <AnimatedToggle checked={item.value} onChange={item.set} />
                </div>
              ))}

              <button
                onClick={handleSavePrefs}
                disabled={isSavingPrefs}
                className="w-full bg-[#1A1A1A] text-white px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#2A2A2A] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 active:scale-[0.97]"
              >
                {isSavingPrefs ? <AnimatedCheck size={14} /> : <AnimatedCheck size={14} />}
                Save Preferences
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-red-50/50 p-6 md:p-8 rounded-[32px] border border-red-100 shadow-[0_4px_20px_rgba(255,0,0,0.02)] space-y-6">
            <div className="flex items-center gap-3 border-b border-red-100/50 pb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AnimatedLogOut size={18} className="text-red-500" />
              </div>
              <h3 className="text-[14px] font-bold uppercase tracking-widest text-red-600">Session Actions</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
              <div>
                <h4 className="text-[13px] font-bold text-red-800">Close Account Session</h4>
                <p className="text-[11px] text-red-600/80 mt-1 font-medium max-w-[200px]">Sign out from the dashboard on this device browser window.</p>
              </div>
              <form action="/auth/signout" method="post">
                <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-200 hover:bg-red-100 bg-white text-red-600 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-sm w-full sm:w-auto">
                  <AnimatedLogOut size={14} /> Sign Out
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
