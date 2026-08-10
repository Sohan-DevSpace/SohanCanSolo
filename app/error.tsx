'use client'

import { useEffect } from 'react'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#FAF7F4]">
      <ErrorMessage 
        title="Something went wrong"
        message={error.message || "An unexpected error occurred while rendering this page."}
        onRetry={() => reset()}
      />
    </div>
  )
}
