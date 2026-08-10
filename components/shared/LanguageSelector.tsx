'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English (IN)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
]

export function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'compact' | 'footer' }) {
  const [selected, setSelected] = useState('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('alpona_lang')
    if (saved) setSelected(saved)
  }, [])

  const handleSelect = (code: string) => {
    setSelected(code)
    localStorage.setItem('alpona_lang', code)
    setIsOpen(false)
  }

  const currentLang = LANGUAGES.find((l) => l.code === selected) || LANGUAGES[0] || { code: 'en', label: 'English', native: 'English' }

  if (variant === 'compact') {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors py-1 px-2 rounded-lg hover:bg-black/5"
          aria-label="Select Language"
          aria-expanded={isOpen}
        >
          <Globe className="w-3.5 h-3.5 text-[#B8763C]" />
          <span>{currentLang.code.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3 text-[#8C857C]" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-white border border-[#E8E2DB] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                  selected === lang.code ? 'bg-[#FAF7F4] font-bold text-[#B8763C]' : 'text-[#1A1A1A] hover:bg-[#FAF7F4]'
                }`}
              >
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-[#1A1A1A]/80 hover:text-[#B8763C] transition-colors py-1.5 px-3 rounded-full border border-[#E8E2DB] bg-white/70 backdrop-blur-sm shadow-xs"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[#B8763C]" />
        <span className="font-sans font-bold">{currentLang.label}</span>
        <ChevronDown className="w-3 h-3 text-[#8C857C]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E8E2DB] rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-[#FAF7F4]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C857C]">Select Language</p>
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors ${
                selected === lang.code ? 'bg-[#FCF7F2] font-bold text-[#B8763C]' : 'text-[#1A1A1A] hover:bg-[#FAF7F4]'
              }`}
            >
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
