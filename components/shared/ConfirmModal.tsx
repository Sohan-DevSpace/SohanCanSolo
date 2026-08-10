'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AnimatedAlertCircle } from '@/components/shared/AnimatedIcons'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94, y: shouldReduceMotion ? 0 : 12 }}
            transition={shouldReduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-matte-xl border border-[#E8E2DB]/60"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  variant === 'danger'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-[#B8763C]/10 text-[#B8763C]'
                }`}
              >
                <AnimatedAlertCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-snug">
                  {title}
                </h3>
                <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#E8E2DB]/50">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-[13px] font-semibold text-neutral-500 hover:text-[#1A1A1A] rounded-xl hover:bg-[#FAF7F4] transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-[13px] font-bold cursor-pointer transition-all duration-200 disabled:opacity-50 ${
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-[#B8763C] hover:bg-[#B06024] text-white'
                }`}
              >
                {loading ? 'Processing…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
