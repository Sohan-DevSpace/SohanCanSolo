'use client'

import { useEffect } from 'react'

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.debug('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.debug('FID:', (entry as any).processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          console.debug('CLS:', (entry as any).value)
        }
      }
    })

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      observer.observe({ type: 'first-input', buffered: true })
      observer.observe({ type: 'layout-shift', buffered: true })
    } catch {
      // Fallback for unsupported browser engines
    }

    return () => observer.disconnect()
  }, [])

  return null
}
