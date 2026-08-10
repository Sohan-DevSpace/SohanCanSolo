'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Sparkles, User, Bot, RefreshCw, Copy, Check, 
  Package, Ruler, Palette, Truck, CornerDownLeft
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const SUGGESTIONS = [
  { icon: Package, label: 'Track Recent Order', query: 'How can I track my recent order status?' },
  { icon: Ruler, label: '240 GSM Size Guide', query: 'Where do I find size charts for t-shirts and hoodies?' },
  { icon: Palette, label: 'Custom Design Studio', query: 'How do I upload custom artwork in the Design Studio?' },
  { icon: Truck, label: 'Express Shipping India', query: 'What are your delivery timeframes across India?' }
]

export function SmartAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Welcome to Alpona Studio Support! How can I assist you with custom printing, streetwear sizing, or order tracking today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Ref for INTERNAL chat container only (prevents window auto-scroll bug)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Scroll ONLY internal chat container, NEVER window
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  const handleSend = async (customQuery?: string) => {
    const text = (customQuery || inputValue).trim()
    if (!text || isLoading) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: userTime
    }

    setMessages(prev => [...prev, newUserMsg])
    if (!customQuery) setInputValue('')
    setIsLoading(true)

    try {
      const apiMessages = messages.map(msg => ({ role: msg.role, content: msg.content }))
      apiMessages.push({ role: 'user', content: text })

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', messages: apiMessages })
      })

      const data = await response.json()
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
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting right now. Please try again in a few seconds.',
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

  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Chat cleared. Feel free to ask another question!",
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
    <div className="flex flex-col h-[580px] w-full max-w-[850px] mx-auto bg-white border border-[#E8E2DB] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden font-sans">
      
      {/* 1. Header (Obsidian Glass Bar) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2DB] bg-[#1A1A1A] text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-[#B8763C] flex items-center justify-center shadow-xs">
              <Sparkles size={20} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              Alpona AI Concierge
              <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#B8763C] text-white">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium">Instant 24/7 Customer Care</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-neutral-300 transition-colors cursor-pointer"
          title="Reset Conversation"
        >
          <RefreshCw size={12} />
          Reset Chat
        </button>
      </div>

      {/* 2. Messages Container (Internal Overflow Only) */}
      <div 
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#FAF7F4] scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-2xl mt-0.5 shadow-2xs ${
                msg.role === 'user' ? 'bg-[#B8763C] text-white' : 'bg-[#1A1A1A] text-white'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-[#B8763C]" />}
              </div>

              <div className={`group relative px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-tr-xs'
                  : 'bg-white text-[#1A1A1A] border border-[#E8E2DB] rounded-tl-xs'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className={`flex items-center justify-between gap-4 mt-2 pt-1 border-t ${
                  msg.role === 'user' ? 'border-white/10 text-white/50' : 'border-neutral-100 text-neutral-400'
                } text-[10px]`}>
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1A1A1A] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[88%]"
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-2xl mt-0.5 bg-[#1A1A1A] text-white">
                <Bot size={14} className="text-[#B8763C]" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-[#E8E2DB] rounded-tl-xs flex gap-1.5 items-center shadow-2xs">
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#B8763C] rounded-full" />
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#B8763C] rounded-full" />
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#B8763C] rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Suggestion Chips */}
      <div className="px-4 py-2.5 bg-white border-t border-[#E8E2DB] overflow-x-auto flex gap-2 no-scrollbar">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 bg-[#FAF7F4] hover:bg-[#1A1A1A] hover:text-white border border-[#E8E2DB] rounded-full text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-all duration-200 shrink-0 shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Icon size={13} className="text-[#B8763C]" />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* 4. Input Controls Bar */}
      <div className="p-3.5 bg-white border-t border-[#E8E2DB]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="relative flex items-center"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI about products, size guide, or order status..."
            rows={1}
            disabled={isLoading}
            className="w-full bg-[#FAF7F4] border border-[#E8E2DB] rounded-2xl pl-4 pr-12 py-3 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#B8763C] focus:bg-white transition-all resize-none max-h-24 placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#B8763C] disabled:opacity-40 disabled:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

    </div>
  )
}
