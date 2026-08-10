'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { IconHome, IconGrid, IconCart, IconUser } from '@/components/shared/PremiumIcons'
import { Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function BottomNav() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const items = useCartStore(state => state.items)

  useEffect(() => setMounted(true), [])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const navItems = [
    { name: 'Home', href: '/', icon: IconHome },
    { name: 'Shop', href: '/shop', icon: IconGrid },
    { name: 'Studio', href: '/design-studio', icon: Sparkles },
    { name: 'Cart', href: '/cart', icon: IconCart, badge: cartCount },
    { name: 'Account', href: '/account', icon: IconUser },
  ]

  if (!mounted || pathname === '/checkout' || pathname?.startsWith('/admin')) return null

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl border-t border-[#E8E2DB]/80 dark:border-white/[0.08] pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around h-[68px] px-2">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
          const IconComponent = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-[0.95] transition-transform duration-150"
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId={shouldReduceMotion ? undefined : "bottom-nav-indicator"}
                    className="absolute -inset-2 bg-[#B8763C]/15 dark:bg-[#B8763C]/25 rounded-full"
                    transition={shouldReduceMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                
                <IconComponent className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-[#B8763C] dark:text-[#B8763C]' : 'text-neutral-500 dark:text-zinc-400'
                }`} />

                {item.name === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#B8763C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#09090b] z-20 shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-bold tracking-tight relative z-10 transition-colors duration-200 ${
                isActive ? 'text-[#B8763C] dark:text-[#B8763C]' : 'text-neutral-500 dark:text-zinc-400'
              }`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
