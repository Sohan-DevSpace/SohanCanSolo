'use client'
import { useState, useEffect, Component, ReactNode, ErrorInfo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Palette,
  LogOut,
  Menu,
  Search,
  ChevronRight,
  Users,
  BarChart3,
  Star,
  Ticket,
  Settings,
  X,
  Tags,
  Layers,
  Filter,
  Truck,
  UserCog,
  MessageSquare,
  Store
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const navGroups = [
  {
    label: null, // No label for the primary section
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Store',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Seller Portal', href: '/seller', icon: Store },
      { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { name: 'Categories', href: '/admin/categories', icon: Tags },
      { name: 'Subcategories', href: '/admin/subcategories', icon: Layers },
      { name: 'Product Types', href: '/admin/product-types', icon: Filter },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Users', href: '/admin/users', icon: UserCog },
      { name: 'Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

// Flat list for breadcrumb lookup
const allNavItems = navGroups.flatMap(g => g.items)


class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('Admin Error:', error, errorInfo) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#09090b] text-white p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-red-400">!</span>
            </div>
            <h1 className="text-xl font-bold text-balance">Something went wrong</h1>
            <p className="text-zinc-400 text-sm text-balance">{this.state.error?.message || 'An unexpected error occurred in the admin panel.'}</p>
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#B8763C] hover:bg-[#a66833] text-white text-sm font-semibold rounded-lg transition-all duration-150 active:scale-[0.97]">
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [adminName, setAdminName] = useState('Admin')
  const [adminEmail, setAdminEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking'>('checking')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAuthorized(false)
        router.push('/auth/login?returnUrl=/admin')
        return
      }

      // Fetch profile role for RBAC
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role === 'admin' || user.user_metadata?.role === 'admin' || user.email?.endsWith('@alpona.in')
      
      if (!isAdmin) {
        setIsAuthorized(false)
        router.push('/')
        return
      }

      setAdminName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin')
      setAdminEmail(user.email || '')
      setDbStatus('connected')
      setIsAuthorized(true)
    }
    fetchAdmin()
  }, [supabase, router])

  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div className="dark min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#B8763C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Verifying Admin Permissions...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const activePageName = (() => {
    const found = allNavItems.find(item =>
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname?.startsWith(item.href)
    )
    return found?.name || 'Dashboard'
  })()

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-white/[0.06] shrink-0">
        <Link href="/" className="flex items-center group">
          <div className="relative w-36 h-10 overflow-hidden shrink-0">
            <Image src="/logo.png?v=4" alt="Alpona Logo" fill sizes="144px" className="object-contain object-left" />
          </div>
        </Link>
      </div>

      {/* Nav Links — Grouped */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? 'text-white border-l-2 border-[#B8763C] bg-gradient-to-r from-[#B8763C]/10 to-transparent'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-l-2 border-transparent'
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors duration-150 ${
                      isActive ? 'text-[#B8763C]' : 'text-zinc-500 group-hover:text-zinc-400'
                    }`} />
                    <span className={`text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-all duration-150">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-zinc-800 ring-1 ring-white/[0.08] flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-zinc-200 truncate">{adminName}</p>
              <p className="text-xs text-zinc-500 truncate">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-all duration-150 shrink-0 active:scale-[0.92]"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <AdminErrorBoundary>
    <div className="dark min-h-screen bg-[#09090b] flex flex-col md:flex-row antialiased text-white selection:bg-[#B8763C]/30 relative overflow-hidden">
      
      {/* Subtle Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center">
        <div className="absolute top-0 left-[20%] w-[800px] h-[500px] bg-[#B8763C]/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-[#09090b] border-b border-white/[0.06] px-4 h-14 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#B8763C] flex items-center justify-center">
            <span className="text-white font-extrabold text-xs scale-[0.83]">AL</span>
          </div>
          <h1 className="text-sm font-bold text-white ">Alpona</h1>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/[0.05]">
              <Menu className="w-5 h-5" />
            </Button>
          } />
          <SheetContent side="left" className="w-[260px] bg-[#09090b] border-r border-white/[0.06] p-0 text-white">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[240px] shrink-0">
        <div className="sticky top-0 h-screen bg-[#09090b] border-r border-white/[0.06]">
          <NavContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#0c0c0e]">

        {/* Header */}
        <header className="h-14 border-b border-white/[0.04] bg-[#09090b]/50 backdrop-blur-2xl sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="hidden sm:inline">Admin</span>
            <ChevronRight className="hidden sm:block w-3 h-3" />
            <span className="text-zinc-100 font-medium">{activePageName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs scale-[0.83] font-medium text-zinc-500 border border-white/[0.06] px-2.5 py-1.5 rounded-md bg-[#121214]">
              <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {dbStatus === 'connected' ? 'Connected' : 'Connecting'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-5 md:p-8 flex-grow relative z-10">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AdminErrorBoundary>
  )
}
