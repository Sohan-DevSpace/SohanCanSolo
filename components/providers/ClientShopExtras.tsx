'use client'

import dynamic from 'next/dynamic'

const FloatingCartBar = dynamic(
  () => import('@/components/shop/FloatingCartBar').then((mod) => mod.FloatingCartBar),
  { ssr: false }
)

const ShoppingCopilotWidget = dynamic(
  () => import('@/components/ai/ShoppingCopilotWidget').then((mod) => mod.ShoppingCopilotWidget),
  { ssr: false }
)

export function ClientShopExtras() {
  return (
    <>
      <FloatingCartBar />
      <ShoppingCopilotWidget />
    </>
  )
}
