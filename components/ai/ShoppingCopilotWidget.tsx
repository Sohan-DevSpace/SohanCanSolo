'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Sparkles, X, Send, Loader2, ShoppingBag, ArrowRight, Ruler, Palette, Tag, Truck } from 'lucide-react'

interface ProductCard {
  id: string
  name: string
  slug: string
  price: number
  image_url?: string
}

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  products?: ProductCard[]
}

const MAX_SESSION_MESSAGES = 10

const QUICK_ACTIONS = [
  { label: '📏 Fit & Size Guide', prompt: 'What size should I pick for oversized streetwear tees?' },
  { label: '🎨 DTF vs Embroidery', prompt: 'What is the difference between DTF printing and Embroidery?' },
  { label: '🏷️ Active Coupon Codes', prompt: 'What active discount coupon codes can I use?' },
  { label: '📦 Track Shipment', prompt: 'How do I track my order delivery?' },
]

export function ShoppingCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome to Alpona Studio! I'm your personal fashion stylist & concierge. Looking for drop-shoulder tees, fabric specs (240 GSM combed cotton), sizing tips, or custom print advice?",
    }
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  const executePrompt = async (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed || loading || messageCount >= MAX_SESSION_MESSAGES) return

    const userMsgId = Date.now().toString()
    const userMsg: Message = { id: userMsgId, sender: 'user', text: trimmed }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setMessageCount((count) => count + 1)

    try {
      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'shopping_assistant',
          message: trimmed,
          history: messages.slice(-4).map((m) => ({ role: m.sender, content: m.text }))
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get recommendation')
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || "Here are some recommendations from Alpona!",
        products: data.products || []
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I'm having trouble connecting to AI services right now. Feel free to browse our shop catalog!",
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    executePrompt(input)
  }

  const pathname = usePathname()
  const isCartOrCheckout = pathname === '/cart' || pathname === '/checkout'

  return (
    <div className={`fixed ${isCartOrCheckout ? 'bottom-36 md:bottom-6' : 'bottom-20 md:bottom-6'} right-4 md:right-6 z-50 antialiased`}>
      {/* Floating Circular Glassmorphic Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-zinc-950/90 dark:bg-zinc-900/90 hover:bg-black text-white border border-[#B8763C]/60 hover:border-[#B8763C] shadow-[0_12px_36px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open AI Concierge"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B8763C] to-amber-500/80 flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-zinc-950" />
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[530px] bg-[#FAF7F4] dark:bg-[#121214] border border-[#E8E2DB] dark:border-white/[0.08] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] dark:bg-[#09090b] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B8763C] to-amber-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  Alpona AI Concierge
                  <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-widest">
                    Gemini 1.5 Flash
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400">Styling, Sizing & Custom Print Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#B8763C] text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-[#E8E2DB] dark:border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Product Recommendation Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-[#B8763C]" /> Recommended Apparel
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/shop/${prod.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E8E2DB] dark:border-white/10 hover:border-[#B8763C] transition-all group shadow-sm"
                        >
                          <div className="w-11 h-11 relative rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                            {prod.image_url ? (
                              <Image
                                src={prod.image_url}
                                alt={prod.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[9px]">Alpona</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#B8763C] transition-colors">
                              {prod.name}
                            </h4>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">₹{prod.price}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#B8763C] group-hover:translate-x-0.5 transition-all shrink-0 mr-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs italic bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-[#E8E2DB] dark:border-white/10 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8763C]" />
                <span>Alpona AI is searching catalog & style guide...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Feature Action Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-[#E8E2DB] dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 flex gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                disabled={loading || messageCount >= MAX_SESSION_MESSAGES}
                onClick={() => executePrompt(action.prompt)}
                className="text-[10px] font-semibold text-stone-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-[#B8763C] hover:text-white border border-[#E8E2DB] dark:border-white/10 rounded-full px-2.5 py-1 transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-[#E8E2DB] dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2 bg-[#FAF7F4] dark:bg-zinc-800 border border-[#E8E2DB] dark:border-white/10 rounded-full px-3 py-1.5 focus-within:border-[#B8763C] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messageCount >= MAX_SESSION_MESSAGES
                    ? 'Session limit reached. Restart chat.'
                    : 'Ask about sizing, fabric GSM, or custom print...'
                }
                disabled={loading || messageCount >= MAX_SESSION_MESSAGES}
                className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || messageCount >= MAX_SESSION_MESSAGES}
                className="w-7 h-7 rounded-full bg-[#B8763C] hover:bg-[#a66833] disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-center text-zinc-400 mt-1.5 font-medium">
              Powered by Alpona AI • {MAX_SESSION_MESSAGES - messageCount} queries left in session
            </p>
          </form>

        </div>
      )}
    </div>
  )
}
