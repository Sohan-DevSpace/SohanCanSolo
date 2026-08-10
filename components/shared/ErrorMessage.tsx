import { IconAlert, IconRefresh } from '@/components/shared/PremiumIcons'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  title = "Something went wrong", 
  message = "We encountered an unexpected error. Please try again.", 
  onRetry,
  className = ""
}: ErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-[#E5E5E5]/60 shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <IconAlert className="h-7 w-7" color="#EF4444" />
      </div>
      <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-[#555555] mb-6 max-w-md">{message}</p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-[#B8763C] text-white hover:bg-[#B06024] font-medium rounded-full px-6 h-11 cursor-pointer"
        >
          <IconRefresh className="mr-2 h-4 w-4" color="#FFFFFF" />
          Try Again
        </Button>
      )}
    </div>
  )
}
