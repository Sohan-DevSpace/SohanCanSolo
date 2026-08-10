import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden">
      
      {/* Premium Minimal Auth Header */}
      <header className="absolute top-0 left-0 right-0 h-20 px-6 lg:px-12 flex items-center justify-between z-20 pointer-events-auto">
        <Link href="/" className="flex items-center gap-2.5 group select-none transition-transform duration-150 active:scale-[0.97]">
          <div className="w-8 h-8 relative flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png?v=3"
              alt="Alpona Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          <span className="font-display text-xl font-bold text-primary tracking-tight group-hover:text-ring transition-colors">
            Alpona
          </span>
        </Link>
        <Link 
          href="/shop" 
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 text-muted-foreground/60 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Store
        </Link>
      </header>

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/auth/auth_bg.png"
          alt="Alpona Premium Apparel"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Deep, unified dark glass overlay to make the white text pop and match the dark glass forms */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-1" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-12 flex h-full items-center pt-16">
        {/* Children will contain the split layout logic for Desktop/Mobile */}
        {children}
      </div>
    </div>
  )
}
