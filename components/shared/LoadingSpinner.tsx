interface LoadingSpinnerProps {
  className?: string
  size?: number
}

export function LoadingSpinner({ className = '', size = 40 }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center w-full min-h-[200px] ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin text-[#B8763C]"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" className="opacity-10" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
      </svg>
    </div>
  )
}
