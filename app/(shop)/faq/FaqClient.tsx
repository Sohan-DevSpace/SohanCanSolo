'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ThumbsUp, ThumbsDown, HelpCircle, Check, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  created_at?: string
}

interface FaqClientProps {
  faqs: FaqItem[]
}

export function FaqClient({ faqs }: FaqClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null)
  const [votedMap, setVotedMap] = useState<Record<string, 'yes' | 'no'>>({})

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    faqs.forEach(f => {
      if (f.category) set.add(f.category)
    })
    return ['All', ...Array.from(set)]
  }, [faqs])

  // Filter FAQs based on search query and category
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.category && faq.category.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === 'All' ||
        (faq.category && faq.category.toLowerCase() === selectedCategory.toLowerCase())

      return matchesSearch && matchesCategory
    })
  }, [faqs, searchQuery, selectedCategory])

  const handleVote = (id: string, vote: 'yes' | 'no') => {
    if (votedMap[id]) return
    setVotedMap(prev => ({ ...prev, [id]: vote }))
    toast.success(vote === 'yes' ? 'Thanks for your feedback!' : 'We will improve this answer.')
  }

  return (
    <div className="space-y-8 max-w-[800px] mx-auto">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8580] group-focus-within:text-[#C87533] transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by keyword (e.g., shipping, returns, DPI)..."
          className="w-full pl-12 pr-10 py-3.5 bg-white border border-[#E8E2DB] rounded-2xl text-sm font-medium text-[#1A1A1A] placeholder-[#8A8580] focus:outline-none focus:border-[#C87533] focus:ring-4 focus:ring-[#C87533]/10 shadow-sm transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8A8580] hover:text-[#1A1A1A] hover:bg-[#FAF7F4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'text-white bg-[#1A1A1A] shadow-md shadow-[#1A1A1A]/10 scale-[1.02]'
                  : 'text-[#6B6560] bg-white border border-[#E8E2DB] hover:border-[#C87533]/40 hover:text-[#1A1A1A] shadow-xs'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3.5">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id
            const userVote = votedMap[faq.id]

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#C87533]/40 shadow-[0_12px_32px_rgba(200,117,51,0.08)] ring-1 ring-[#C87533]/20'
                    : 'bg-white hover:bg-white border-[#E8E2DB] shadow-xs hover:shadow-md'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer focus:outline-none"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A] pr-4 leading-snug">
                    {faq.question}
                  </span>

                  <span
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#C87533] border-[#C87533] text-white rotate-180 shadow-sm'
                        : 'bg-[#FAF7F4] border-[#E8E2DB] text-[#1A1A1A]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 md:px-6 pb-6 pt-1 text-sm text-[#5C5650] leading-relaxed border-t border-[#E8E2DB]/60 space-y-4">
                        <p>{faq.answer}</p>

                        {/* Was this helpful? Interactive Feedback */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#FAF7F4] text-xs">
                          <span className="text-[#8A8580] font-medium">Was this answer helpful?</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVote(faq.id, 'yes')}
                              disabled={!!userVote}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                                userVote === 'yes'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-[#FAF7F4] border-[#E8E2DB] text-[#5C5650] hover:bg-white hover:border-[#C87533]/30 active:scale-95'
                              }`}
                            >
                              {userVote === 'yes' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                              Yes
                            </button>

                            <button
                              onClick={() => handleVote(faq.id, 'no')}
                              disabled={!!userVote}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                                userVote === 'no'
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : 'bg-[#FAF7F4] border-[#E8E2DB] text-[#5C5650] hover:bg-white hover:border-rose-300 active:scale-95'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        ) : (
          <div className="bg-white border border-[#E8E2DB] rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F4] border border-[#E8E2DB] flex items-center justify-center mx-auto text-[#8A8580]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">No matching questions found</h3>
            <p className="text-xs text-[#8A8580] max-w-xs mx-auto">
              Try searching with a different term or browse all questions by selecting &quot;All&quot; above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
