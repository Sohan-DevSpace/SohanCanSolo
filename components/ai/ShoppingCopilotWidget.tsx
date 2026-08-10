'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, MessageSquare, X, Send, Loader2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function ShoppingCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm Alpona AI Copilot. Ask me for gift ideas, apparel styling tips, or recommendations for custom hoodies & tees!",
    }
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = input.trim()
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

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 antialiased">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#B8763C] hover:bg-[#a66833] text-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(184,118,60,0.35)] transition-all duration-300 active:scale-95"
          aria-label="Open AI Shopping Copilot"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">AI Copilot</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] bg-[#FAF7F4] dark:bg-[#121214] border border-[#E8E2DB] dark:border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] dark:bg-[#09090b] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#B8763C] flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  Alpona AI Copilot
                  <span className="text-[9px] font-medium bg-[#B8763C]/30 text-amber-300 px-1.5 py-0.2 rounded border border-[#B8763C]/40">Gemini</span>
                </h3>
                <p className="text-[10px] text-zinc-400">Shopping & Design Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
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
                      ? 'bg-[#B8763C] text-white rounded-br-none'
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-[#E8E2DB] dark:border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Product Recommendation Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-[#B8763C]" /> Suggested Products
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

            {/* Skeleton Loading State */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-white dark:bg-zinc-800 border border-[#E8E2DB] dark:border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-zinc-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8763C]" />
                  <span className="text-[11px] font-medium">Gemini AI thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                'Minimalist Hoodie for gifting',
                'Trending oversized tees',
                'Custom print design ideas'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt)
                  }}
                  className="text-[10px] bg-white dark:bg-zinc-800 hover:bg-[#B8763C]/10 text-zinc-600 dark:text-zinc-300 border border-[#E8E2DB] dark:border-white/10 rounded-full px-2.5 py-1 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#09090b] border-t border-[#E8E2DB] dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messageCount >= MAX_SESSION_MESSAGES
                    ? 'Session limit reached (10/10)'
                    : 'Ask about hoodies, sizes, gifts...'
                }
                disabled={loading || messageCount >= MAX_SESSION_MESSAGES}
                className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 border border-[#E8E2DB] dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#B8763C] disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading || messageCount >= MAX_SESSION_MESSAGES}
                className="bg-[#B8763C] hover:bg-[#a66833] text-white rounded-xl w-9 h-9 shrink-0 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-zinc-400 px-1">
              <span>Powered by Gemini 1.5 Flash</span>
              <span>{MAX_SESSION_MESSAGES - messageCount} msgs remaining</span>
            </div>
          </form>

        </div>
      )}
    </div>
  )
}
