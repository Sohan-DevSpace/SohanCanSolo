import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Navbar } from '@/components/layout/Navbar'
import { FooterWrapper } from '@/components/layout/FooterWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { MotionLayout } from '@/components/providers/MotionLayout'
import { ClientShopExtras } from '@/components/providers/ClientShopExtras'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SmoothScroll>
      <MotionLayout>
        <AnnouncementBar />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
          {children}
        </main>
        <FooterWrapper />
        <BottomNav />
        <ClientShopExtras />
      </MotionLayout>
    </SmoothScroll>
  )
}
