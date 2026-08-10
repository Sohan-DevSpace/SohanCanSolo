import type { Metadata } from 'next'
import { fontSerif, fontSans } from '@/lib/fonts'
import { Toaster } from 'react-hot-toast'
import { SITE_NAME, SITE_URL } from '@/constants/config'
import { BfcacheHandler } from '@/components/providers/BfcacheHandler'
import { ServiceWorkerRegister } from '@/components/providers/ServiceWorkerRegister'
import { NavigationProgressBar } from '@/components/ui/NavigationProgressBar'
import { RecentPurchaseToast } from '@/components/shared/RecentPurchaseToast'
import { MobileStickyBar } from '@/components/layout/MobileStickyBar'
import { WebVitals } from '@/components/shared/WebVitals'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: 'Custom print on demand — pick a design, we print & ship.',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSerif.variable} ${fontSans.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://ggielaflfgkkfubwfgck.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${fontSans.className} bg-[#FAF7F4] text-[#1A1A1A] min-h-screen flex flex-col antialiased`}>
        <NavigationProgressBar />
        <BfcacheHandler />
        <ServiceWorkerRegister />
        <WebVitals />
        <RecentPurchaseToast />
        <MobileStickyBar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#F5F1EC',
              border: '1px solid #333',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#2D7D46',
                secondary: '#1A1A1A',
              },
            },
            error: {
              iconTheme: {
                primary: '#C53030',
                secondary: '#1A1A1A',
              },
            },
          }}
        />
      </body>
    </html>
  )
}