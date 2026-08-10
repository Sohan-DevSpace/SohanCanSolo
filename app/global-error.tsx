'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Check if error is due to Vercel/Next.js chunk update mismatch
    if (
      typeof window !== 'undefined' &&
      (error.name === 'ChunkLoadError' ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Failed to fetch'))
    ) {
      const storageKey = 'alpona_global_chunk_reload'
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true')
        window.location.reload()
      }
    }
  }, [error])

  return (
    <html lang="en">
      <body className="bg-[#FAF7F4] text-[#1A1A1A] min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E2DB] shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C87533]/10 text-[#C87533] flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">
            Application Updated
          </h2>
          <p className="text-xs text-[#8C857C] leading-relaxed">
            A new version of Alpona has been deployed. Please click below to refresh and get the latest version.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              } else {
                reset()
              }
            }}
            className="w-full py-3 bg-[#C87533] hover:bg-[#A65E28] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  )
}
