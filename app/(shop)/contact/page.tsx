'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMail, IconPhone, IconMapPin, IconSend } from '@/components/shared/PremiumIcons'
import { MorphingIcon } from '@/components/shared/MorphingIcon'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Fetch authenticated user if logged in
      const { data: { user } } = await supabase.auth.getUser()

      // Insert support ticket into database
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id || null,
          subject: orderNumber ? `Contact Form Message (Order #${orderNumber})` : `Contact Form Message - ${name}`,
          message: message,
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Insert matching dialogue thread message
      const { error: msgError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user?.id || null,
          sender_role: 'customer',
          message: message
        })

      if (msgError) throw msgError

      setIsSuccess(true)
      toast.success('Message sent! We\'ll get back to you shortly.')
      setName('')
      setEmail('')
      setOrderNumber('')
      setMessage('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Get in Touch
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Contact Us
        </h1>
        <p className="text-[#666666] text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
          Have questions about shipping, custom prints, or bulk orders? Drop us a message.
        </p>
      </div>

      {/* Grid container */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[1200px] mt-12 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column - Contact Coordinates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-balance text-2xl md:text-3xl font-bold font-serif tracking-tight">
                Let\'s Start a Conversation
              </h2>
              <p className="text-[#555555] text-sm leading-relaxed">
                Whether you are looking for design partnerships, bulk corporate merchandise prints, or have questions about a pending package, we are here to assist.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E2DB] text-[#B8763C] shrink-0">
                  <IconMail size={20} color="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">Email Support</h4>
                  <p className="text-xs text-[#555555]">support@alpona.com</p>
                  <p className="text-[10px] text-[#888888]">We respond within 24 business hours</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E2DB] text-[#B8763C] shrink-0">
                  <IconPhone size={20} color="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">Business Helpline</h4>
                  <p className="text-xs text-[#555555]">+91 98765 43210</p>
                  <p className="text-[10px] text-[#888888]">Mon - Sat: 10:00 AM to 6:00 PM</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E2DB] text-[#B8763C] shrink-0">
                  <IconMapPin size={20} color="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">Headquarters</h4>
                  <p className="text-xs text-[#555555]">
                    12, Creative Studio Street, Salt Lake, Sector V, Kolkata - 700091, West Bengal, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E8E2DB] rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-[#FAF7F4]/60 border border-[#E8E2DB] rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] transition-colors text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-[#FAF7F4]/60 border border-[#E8E2DB] rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                        Order Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="ORD-YYYYMMDD-XXXXX"
                        className="w-full bg-[#FAF7F4]/60 border border-[#E8E2DB] rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] transition-colors text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write details about your question..."
                        className="w-full bg-[#FAF7F4]/60 border border-[#E8E2DB] rounded-xl px-4 py-3 text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] transition-colors text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#B8763C] hover:bg-[#B06024] text-white font-bold h-14 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-matte-md hover:shadow-[#B8763C]/20 disabled:opacity-50 active:scale-[0.97]"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Message <IconSend size={16} color="currentColor" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    className="py-12 text-center space-y-4 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                    >
                      <MorphingIcon name="check" size={64} color="currentColor" strokeWidth={2.5} className="text-emerald-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold font-serif text-[#1A1A1A]">
                      Thank You!
                    </h3>
                    <p className="text-sm text-[#666666] max-w-sm">
                      We have received your message. A member of our support team will reach out to you within 24 business hours.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="active:scale-[0.97] text-xs font-bold text-[#B8763C] uppercase tracking-wider pt-4 hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
