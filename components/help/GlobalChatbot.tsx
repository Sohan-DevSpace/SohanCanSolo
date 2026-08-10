'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, X, Send, RefreshCw, Copy, Check, 
  Bot, User, ChevronDown, Package, Ruler, Truck, Palette, MessageSquare
} from 'lucide-react'

import { apiClient } from '@/lib/api/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_PROMPTS = [
  { icon: Package, label: 'Track Order', prompt: 'How do I track my order status?' },
  { icon: Ruler, label: 'Size Guide', prompt: 'Where can I find the sizing guide for t-shirts and hoodies?' },
  { icon: Palette, label: 'Custom Design', prompt: 'How does the custom design studio printing work?' },
  { icon: Truck, label: 'Shipping Times', prompt: 'What are your delivery options and shipping times?' },
]

export function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hello! I'm your **Alpona Smart Assistant**. How can I help you with apparel, custom designs, or orders today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim()
    if (!query || isLoading) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: userTime
    }

    setMessages(prev => [...prev, newUserMsg])
    if (!textToSend) setInputValue('')
    setIsLoading(true)

    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }))
      apiMessages.push({ role: 'user', content: query })

      const data = await apiClient.post<{ success: boolean; message: string; error?: string }>('/api/ai', {
        mode: 'chat',
        messages: apiMessages,
      })
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      if (data.success && data.message) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            timestamp: aiTime
          }
        ])
      } else {
        throw new Error(data.error || 'Failed to generate AI response')
      }
    } catch (err: any) {
      console.error('GlobalChatbot error:', err)
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I ran into a connection issue. Please check your internet or try again in a moment!',
          timestamp: aiTime
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Conversation cleared. How else can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON ── */}
      <div className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative group flex items-center gap-2.5 px-4 py-3 bg-[#1A1A1A] text-white rounded-full shadow-2xl border border-white/10 hover:bg-[#2A2A2A] transition-all duration-300"
              aria-label="Open Smart Assistant"
            >
              {/* Pulsing ring effect */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#B8763C] to-[#E5A971] opacity-40 blur-sm group-hover:opacity-75 transition duration-500 animate-pulse -z-10" />
              
              <div className="w-7 h-7 rounded-full bg-[#B8763C] flex items-center justify-center text-white shrink-0 shadow-inner">
                <Sparkles size={15} />
              </div>
              <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline-block">AI Assistant</span>

              {/* Online Dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── CHATBOT MODAL DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Main Window */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 md:bottom-8 right-3 md:right-8 w-[calc(100vw-24px)] sm:w-[420px] h-[620px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#E8E2DB] flex flex-col overflow-hidden z-50 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-[#FAF7F4] border-b border-[#E8E2DB] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-md">
                      <Sparkles size={18} className="text-[#B8763C]" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      Alpona AI Assistant
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-[#B8763C]/10 text-[#B8763C]">Auto</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">Powered by OpenRouter AI</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClear}
                    title="Clear Chat"
                    className="p-2 text-muted-foreground hover:text-[#1A1A1A] hover:bg-black/5 rounded-full transition-colors"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close Chat"
                    className="p-2 text-muted-foreground hover:text-[#1A1A1A] hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F4]/40 scroll-smooth">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <Bot size={14} className="text-[#B8763C]" />
                      </div>
                    )}

                    <div className={`group relative max-w-[82%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#1A1A1A] text-white rounded-br-xs'
                        : 'bg-white text-[#1A1A1A] border border-[#E8E2DB] rounded-bl-xs'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      <div className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t ${
                        msg.role === 'user' ? 'border-white/10 text-white/60' : 'border-black/5 text-muted-foreground'
                      } text-[10px]`}>
                        <span>{msg.timestamp}</span>

                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1A1A1A] flex items-center gap-1"
                          >
                            {copiedId === msg.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-[#B8763C] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <User size={14} />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5 justify-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} className="text-[#B8763C]" />
                    </div>
                    <div className="bg-white border border-[#E8E2DB] rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5 shadow-xs">
                      <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-[#B8763C] rounded-full" />
                      <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#B8763C] rounded-full" />
                      <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#B8763C] rounded-full" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="px-3 py-2 bg-[#FAF7F4] border-t border-[#E8E2DB] overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
                {QUICK_PROMPTS.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      disabled={isLoading}
                      className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-[#1A1A1A] hover:text-white border border-[#E8E2DB] rounded-full text-[11px] font-medium text-[#4A4A4A] flex items-center gap-1.5 transition-all duration-200 shrink-0 shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      <Icon size={12} className="text-[#B8763C]" />
                      {item.label}
                    </button>
                  )
                })}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-[#E8E2DB] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="relative flex items-center"
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or ask a question..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl pl-3.5 pr-11 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] transition-all resize-none max-h-24 placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 p-2 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#B8763C] disabled:opacity-40 disabled:hover:bg-[#1A1A1A] transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground/70 mt-2">
                  Alpona AI Assistant can help with custom orders, sizing, & FAQs.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
