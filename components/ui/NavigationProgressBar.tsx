'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function NavigationProgressBarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // When path or query params change, complete the bar and reset
    setProgress(100)
    const timer = setTimeout(() => {
      setIsNavigating(false)
      setProgress(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  useEffect(() => {
    // Listen for link click events to trigger the progress bar immediately
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const url = new URL(target.href)
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setIsNavigating(true)
          setProgress(30)
          
          const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? prev : prev + 15))
          }, 150)

          setTimeout(() => clearInterval(interval), 3000)
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  if (!isNavigating && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-[#C87533] to-amber-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(200,117,51,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  )
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarContent />
    </Suspense>
  )
}
