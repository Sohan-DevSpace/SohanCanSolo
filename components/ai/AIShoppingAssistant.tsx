'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, X, Send, Bot, User, ShoppingBag, ExternalLink, ArrowRight, 
  RefreshCw, MessageSquare, Package, Ruler, Truck, ShieldCheck, Copy, Check
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CURRENCY_SYMBOL } from '@/constants/config'

interface RecommendedProduct {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  image: string
  category: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendedProducts?: RecommendedProduct[]
}

const QUICK_SUGGESTIONS = [
  { icon: ShoppingBag, text: 'Black oversized tee < ₹1000' },
  { icon: Package, text: 'Track order status' },
  { icon: Ruler, text: 'Apparel size guide' },
  { icon: Truck, text: 'Delivery & shipping options' }
]

export function AIShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to **Alpona AI Studio**! How can I assist your style search today?\n\nTry asking me in natural language:\n• *'Oversized black graphic tee under ₹1000'*\n• *'Track my order status (e.g. ALP-102)'*\n• *'What are your shipping & return policies?'*"
    }
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim()
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          userQuery: query
        })
      })

      const json = await res.json()
      setLoading(false)

      if (json.success && json.message) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: json.message,
          recommendedProducts: json.recommendedProducts || []
        }
        setMessages(prev => [...prev, aiMsg])
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: json.error || "Apologies! I encountered a temporary hiccup fetching catalog recommendations. Please try asking again."
        }])
      }
    } catch (err: any) {
      setLoading(false)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Network connection issue. Please check your connection and resend."
      }])
    }
  }

  return (
    <>
      {/* Sleek Compact Circular Floating Button (Mobile Responsive Position) */}
      <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-full bg-[#1A1A1A] hover:bg-[#B8763C] text-white shadow-[0_16px_40px_-10px_rgba(0,0,0,0.4)] border border-[#B8763C]/40 flex items-center justify-center transition-all duration-300 cursor-pointer group"
              aria-label="Open AI Assistant"
              title="Open AI Shopping Assistant"
            >
              <div className="relative flex items-center justify-center">
                <Sparkles size={22} className="text-[#B8763C] group-hover:text-white transition-colors animate-pulse" />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1A1A1A] absolute top-0 right-0 shadow-sm" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Glassmorphic Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[440px] max-h-[85vh] h-[640px] bg-[#FAF7F4] border border-[#E8E2DB] rounded-[2rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden font-sans select-none"
          >
            {/* Header */}
            <div className="bg-[#121214] text-white px-5 py-4 flex items-center justify-between border-b border-[#B8763C]/20 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B8763C] to-amber-700 text-white flex items-center justify-center shadow-md">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black tracking-[0.2em] uppercase text-white">
                      Alpona AI Studio
                    </h3>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Natural Language Search & Support</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#B8763C] flex items-center justify-center shrink-0 mt-1 shadow-xs border border-[#B8763C]/30">
                      <Sparkles size={13} />
                    </div>
                  )}

                  <div className={`max-w-[86%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`group relative px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1A1A1A] text-white rounded-br-none shadow-md'
                        : 'bg-white border border-[#E8E2DB] text-[#1A1A1A] rounded-bl-none shadow-xs'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.role === 'assistant' && msg.id !== 'welcome' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="absolute -bottom-5 right-2 text-[9px] font-bold text-neutral-400 hover:text-[#B8763C] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {copiedId === msg.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>

                    {/* Recommended Product Cards */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#B8763C] flex items-center gap-1">
                          <ShoppingBag size={11} /> Matching Catalog Items ({msg.recommendedProducts.length})
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {msg.recommendedProducts.map(p => (
                            <Link
                              key={p.id}
                              href={`/shop/${p.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="bg-white border border-[#E8E2DB] hover:border-[#B8763C] rounded-2xl p-2.5 flex flex-col justify-between transition-all hover:shadow-md group"
                            >
                              <div className="aspect-square rounded-xl bg-[#FAF7F4] overflow-hidden mb-2 relative flex items-center justify-center">
                                {p.image ? (
                                  <Image src={p.image} alt={p.name} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <ShoppingBag size={20} className="text-neutral-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-[11px] font-bold text-[#1A1A1A] truncate group-hover:text-[#B8763C] transition-colors">{p.name}</h4>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                  <span className="text-xs font-black text-[#1A1A1A]">{CURRENCY_SYMBOL}{p.price}</span>
                                  {p.compare_at_price && p.compare_at_price > p.price && (
                                    <span className="text-[10px] text-neutral-400 line-through">{CURRENCY_SYMBOL}{p.compare_at_price}</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#B8763C] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <User size={13} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#B8763C] flex items-center justify-center shrink-0 shadow-xs border border-[#B8763C]/30">
                    <Sparkles size={13} className="animate-spin" />
                  </div>
                  <div className="bg-white border border-[#E8E2DB] px-4 py-3 rounded-2xl rounded-bl-none text-xs text-neutral-500 font-medium flex items-center gap-2 shadow-xs">
                    <RefreshCw size={12} className="animate-spin text-[#B8763C]" />
                    <span>Searching catalog & drafting response...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Pill Strip */}
            <div className="px-3 py-2 bg-white/90 border-t border-[#E8E2DB] overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
              {QUICK_SUGGESTIONS.map((qs, i) => {
                const Icon = qs.icon
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(qs.text)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F4] hover:bg-[#B8763C] text-[#57524A] hover:text-white border border-[#E8E2DB] hover:border-[#B8763C] text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Icon size={11} className="shrink-0" />
                    <span>{qs.text}</span>
                  </button>
                )
              })}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-[#E8E2DB] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask e.g. 'Oversized black tee under ₹1000'..."
                className="flex-1 bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl px-4 py-2.5 text-xs font-medium text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:border-[#B8763C]"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-2xl bg-[#1A1A1A] hover:bg-[#B8763C] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#1A1A1A] cursor-pointer shadow-sm active:scale-95"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
