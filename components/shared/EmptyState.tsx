import { Button } from '@/components/ui/button'
import Link from 'next/link'
import * as React from 'react'

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-[#FAF7F4]/50 rounded-2xl border border-[#E5E5E5]/60 border-dashed ${className}`}>
      <div className="bg-[#F5F1EC] p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-[#B8763C]" />
      </div>
      <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-[#555555] mb-8 max-w-md">{description}</p>
      
      {(actionLabel && actionHref) ? (
        <Link href={actionHref}>
          <Button className="bg-[#B8763C] text-white hover:bg-[#B06024] font-medium rounded-full px-6 h-11 cursor-pointer">
            {actionLabel}
          </Button>
        </Link>
      ) : (actionLabel && actionOnClick) ? (
        <Button onClick={actionOnClick} className="bg-[#B8763C] text-white hover:bg-[#B06024] font-medium rounded-full px-6 h-11 cursor-pointer">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
