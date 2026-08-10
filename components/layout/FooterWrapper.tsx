'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

export function FooterWrapper() {
  const pathname = usePathname()
  
  // Hide footer on specific routes where it causes a bad UX
  const hideFooter = 
    pathname === '/checkout' ||
    pathname?.startsWith('/shop') || 
    pathname?.startsWith('/auth') || 
    pathname?.startsWith('/account')
  
  if (hideFooter) {
    return null
  }
  
  return <Footer />
}
