'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import Link from 'next/link'

import {
  AnimatedUser,
  AnimatedMail,
  AnimatedPhone,
  AnimatedUpload,
  AnimatedCheck,
  AnimatedSparkles,
  AnimatedPenTool,
  AnimatedArrowRight,
  AnimatedLock,
  AnimatedShieldAlert,
  AnimatedLogOut,
  AnimatedChevronDown,
  AnimatedCalendar,
} from '@/components/shared/AnimatedIcons'
import { containerVariants, itemVariants, SPRING_GENTLE, EASE_OUT_CUBIC } from '@/components/shared/authVariants'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileData {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
}

// ─── PROFILE COMPLETION CALCULATOR ───
function calculateCompletion(profile: ProfileData | null, user: any): number {
  if (!profile || !user) return 0
  let score = 0
  if (profile.avatar_url) score += 25
  if (profile.full_name && profile.full_name.length > 0) score += 25
  if (profile.phone && profile.phone.length > 0) score += 25
  if (user.email) score += 25
  return score
}

// ─── CIRCULAR PROGRESS RING ───
function CompletionRing({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8E2DB"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#B8763C"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: EASE_OUT_CUBIC, delay: 0.3 }}
          strokeLinecap={percentage > 0 ? 'round' : 'butt'}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#B8763C]">{percentage}%</span>
      </div>
    </div>
  )
}

// ─── COLLAPSIBLE SECTION WRAPPER ───
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  danger = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  danger?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-[28px] border border-[#E8E2DB] overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer group hover:bg-[#FAF7F4]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-[#FAF7F4]'}`}>
            {icon}
          </div>
          <h3 className={`text-[14px] font-bold uppercase tracking-widest ${danger ? 'text-red-600' : 'text-[#1A1A1A]'}`}>
            {title}
          </h3>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <AnimatedChevronDown size={16} className={danger ? 'text-red-400' : 'text-[#C6B6A5]'} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_CUBIC }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── DRAG & DROP AVATAR ZONE ───
function AvatarUploadZone({
  avatarUrl,
  previewUrl,
  isUploading,
  uploadProgress,
  onFileSelect,
  onRemove,
}: {
  avatarUrl: string | null
  previewUrl: string | null
  isUploading: boolean
  uploadProgress: number
  onFileSelect: (file: File) => void
  onRemove: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative w-32 h-32 rounded-full cursor-pointer group transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Bronze gradient ring */}
        <div className={`absolute inset-0 rounded-full p-[3px] bg-gradient-to-br from-[#B8763C] via-[#D4A574] to-[#C87533] shadow-md transition-all duration-300 ${isDragging ? 'scale-110 shadow-lg' : ''} group-hover:shadow-lg`}>
          <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
            {(previewUrl || avatarUrl) ? (
              <Image src={(previewUrl || avatarUrl) as string} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#FAF7F4]">
                <AnimatedUser size={40} className="text-[#C6B6A5]" />
              </div>
            )}
          </div>
        </div>

        {/* Upload overlay */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {isUploading ? (
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <AnimatedUpload size={24} className="text-white" />
              </motion.div>
              {uploadProgress > 0 && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white">
                  {uploadProgress}%
                </div>
              )}
            </div>
          ) : (
            <AnimatedUpload size={24} className="text-white" />
          )}
        </div>

        {/* Edit badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-[#E8E2DB] shadow-md rounded-full flex items-center justify-center text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors z-10">
          <AnimatedPenTool size={14} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileSelect(file)
          }}
          disabled={isUploading}
        />
      </div>

      {/* Remove button */}
      {avatarUrl && !isUploading && (
        <motion.button
          type="button"
          onClick={onRemove}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#8C8375] hover:text-red-500 transition-colors cursor-pointer"
        >
          Remove Photo
        </motion.button>
      )}

      {/* Drag hint */}
      <p className="mt-3 text-[11px] text-[#8C8375] font-medium text-center">
        {isDragging ? 'Drop to upload' : 'Click or drag photo here'}
      </p>
      <p className="text-[10px] text-[#A09485] font-medium text-center mt-0.5">
        JPEG, PNG up to 2MB
      </p>
    </div>
  )
}

// ─── MAIN PAGE ───
export default function EditProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addressCount, setAddressCount] = useState(0)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  })

  // Load data
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setAvatarUrl(data.avatar_url)
        reset({
          fullName: data.full_name || '',
          phone: data.phone || '',
        })
      }

      // Fetch address count for completion
      const { count } = await supabase.from('addresses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setAddressCount(count || 0)

      setIsLoading(false)
    }
    loadData()
  }, [reset])

  // Avatar file handler
  const handleFileSelect = useCallback(async (file: File) => {
    if (!user) return
    if (file.size > 2 * 1024 * 1024) return

    setPreviewUrl(URL.createObjectURL(file))
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 30, 90))
      }, 200)

      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file)
      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      setUploadProgress(100)

      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }, [user])

  // Remove avatar
  const handleRemoveAvatar = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createClient()
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
      setAvatarUrl(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error('Error removing avatar:', error)
    }
  }, [user])

  // Form submit
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return
    setIsSaving(true)
    setShowSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const completion = calculateCompletion(profile, user)
  // Bonus for having addresses
  const effectiveCompletion = Math.min(completion + (addressCount > 0 ? 10 : 0), 100)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <AnimatedSparkles size={32} className="text-[#B8763C]" />
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-6">
      {/* ═══ PERSONAL INFORMATION ─── */}
      <CollapsibleSection
        title="Personal Information"
        icon={<AnimatedUser size={16} className="text-[#B8763C]" />}
        defaultOpen
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <AvatarUploadZone
            avatarUrl={avatarUrl}
            previewUrl={previewUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveAvatar}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 group/input">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8375] ml-1">
                Full Name <span className="text-[#B8763C]">*</span>
              </label>
              <div className="relative">
                <AnimatedUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C6B6A5] group-focus-within/input:text-[#B8763C] transition-colors" size={16} />
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full h-12 py-3 leading-normal bg-[#FAF7F4] hover:bg-white border border-[#E8E2DB]/60 hover:border-[#E8E2DB] rounded-xl pl-11 pr-4 text-[#1A1A1A] text-sm font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C]/40 focus:shadow-[0_0_0_4px_rgba(184,118,60,0.08)] transition-all duration-300 placeholder:text-[#A09485]"
                  placeholder="e.g. John Doe"
                />
              </div>
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-red-500 font-bold pl-1"
                >
                  {errors.fullName.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8375] ml-1">
                Phone Number
              </label>
              <div className="relative">
                <AnimatedPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C6B6A5] group-focus-within/input:text-[#B8763C] transition-colors" size={16} />
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full h-12 py-3 leading-normal bg-[#FAF7F4] hover:bg-white border border-[#E8E2DB]/60 hover:border-[#E8E2DB] rounded-xl pl-11 pr-4 text-[#1A1A1A] text-sm font-semibold focus:bg-white focus:outline-none focus:border-[#B8763C]/40 focus:shadow-[0_0_0_4px_rgba(184,118,60,0.08)] transition-all duration-300 placeholder:text-[#A09485]"
                  placeholder="Mobile number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 group/input">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8375] ml-1">
              Email Address
            </label>
            <div className="relative">
              <AnimatedMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C6B6A5]" size={16} />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full h-12 py-3 leading-normal bg-[#F5F2ED] border border-transparent rounded-xl pl-11 pr-24 text-[#5C534A] text-sm font-semibold cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#E8E2DB] text-[#5C534A] text-[9px] font-bold uppercase tracking-wider rounded-md">
                Verified
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <AnimatePresence>
              <div className="h-6">
                {showSuccess && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[#34A853] text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#34A853]/10 flex items-center justify-center">
                      <AnimatedCheck size={10} />
                    </div>
                    Saved Successfully
                  </motion.span>
                )}
              </div>
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-black text-white px-8 h-12 rounded-xl font-bold tracking-widest uppercase text-[11px] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group active:scale-[0.97]"
            >
              {isSaving ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <AnimatedUpload size={16} />
                </motion.span>
              ) : (
                <>Save Changes <AnimatedArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </CollapsibleSection>

      {/* ═══ SECURITY & PRIVACY ─── */}
      <div className="mt-6 space-y-6">
        <CollapsibleSection
          title="Security & Privacy"
          icon={<AnimatedShieldAlert size={16} className="text-[#B8763C]" />}
        >
          <div className="space-y-3">
            {/* Change Password */}
            <Link
              href="/account/password"
              className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F4] border border-[#E8E2DB] hover:border-[#B8763C]/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center">
                  <AnimatedLock size={14} className="text-[#B8763C]" />
                </div>
                <div>
                  <span className="block text-[13px] font-bold text-[#1A1A1A]">Change Password</span>
                  <span className="block text-[10px] text-[#8C8375] font-medium">Update your login credentials</span>
                </div>
              </div>
              <AnimatedChevronDown size={16} className="text-[#C6B6A5] -rotate-90 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Manage Devices */}
            <Link
              href="/account/devices"
              className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F4] border border-[#E8E2DB] hover:border-[#B8763C]/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center">
                  <AnimatedShieldAlert size={14} className="text-[#B8763C]" />
                </div>
                <div>
                  <span className="block text-[13px] font-bold text-[#1A1A1A]">Manage Devices</span>
                  <span className="block text-[10px] text-[#8C8375] font-medium">Active sessions and trusted devices</span>
                </div>
              </div>
              <AnimatedChevronDown size={16} className="text-[#C6B6A5] -rotate-90 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Privacy Settings */}
            <Link
              href="/account/privacy"
              className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F4] border border-[#E8E2DB] hover:border-[#B8763C]/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E8E2DB] flex items-center justify-center">
                  <AnimatedShieldAlert size={14} className="text-[#B8763C]" />
                </div>
                <div>
                  <span className="block text-[13px] font-bold text-[#1A1A1A]">Privacy Settings</span>
                  <span className="block text-[10px] text-[#8C8375] font-medium">Control your data and visibility</span>
                </div>
              </div>
              <AnimatedChevronDown size={16} className="text-[#C6B6A5] -rotate-90 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CollapsibleSection>

        {/* ═══ DANGER ZONE ─── */}
        <CollapsibleSection
          title="Danger Zone"
          icon={<AnimatedLogOut size={16} className="text-red-500" />}
          danger
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
            <div>
              <h4 className="text-[13px] font-bold text-red-800">Delete Your Account</h4>
              <p className="text-[11px] text-red-600/80 mt-1 font-medium max-w-[280px]">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </CollapsibleSection>
      </div>
    </motion.div>
  )
}
