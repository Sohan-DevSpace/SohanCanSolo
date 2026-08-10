'use client'

import dynamic from 'next/dynamic'

const FloatingCartBar = dynamic(
  () => import('@/components/shop/FloatingCartBar').then((mod) => mod.FloatingCartBar),
  { ssr: false }
)

export function ClientShopExtras() {
  return (
    <>
      <FloatingCartBar />
    </>
  )
}
