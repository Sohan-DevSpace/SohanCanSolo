'use client'

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-5 focus:py-3 focus:bg-[#1A1A1A] focus:text-[#FAF7F4] focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#B8763C] transition-all"
    >
      Skip to main content
    </a>
  )
}
