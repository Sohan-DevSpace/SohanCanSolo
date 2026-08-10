'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function BfcacheHandler() {
  const router = useRouter()

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from back-forward cache (bfcache) — force a router refresh
        // to re-sync server state and re-render fresh components
        router.refresh()
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [router])

  return null
}
