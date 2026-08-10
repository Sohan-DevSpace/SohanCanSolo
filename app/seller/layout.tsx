import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  LogOut, 
  Store,
  Sparkles,
  ChevronRight
} from 'lucide-react'

export const metadata = {
  title: 'Seller Portal | Alpona',
  description: 'Manage and upload products for Alpona Print-on-Demand Marketplace',
}

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/seller')
  }

  // 2. Check role (admin or seller allowed)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'seller'
  if (!isAuthorized) {
    redirect('/account?error=seller_unauthorized')
  }

  const userDisplayName = profile?.full_name || user.email || 'Seller'

  return (
    <div className="min-h-screen bg-[#0F0F10] text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141416] border-r border-zinc-800/60 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8763C] to-[#8A5222] flex items-center justify-center text-white shadow-lg shadow-[#B8763C]/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-white leading-tight">Alpona</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B8763C] bg-[#B8763C]/10 px-2 py-0.5 rounded-full border border-[#B8763C]/20">
                <Sparkles className="w-3 h-3" /> Seller Portal
              </span>
            </div>
          </div>

          {/* User Profile Quick Info */}
          <div className="bg-[#1A1A1E] border border-zinc-800/80 rounded-xl p-3 mb-6">
            <div className="text-xs text-zinc-400">Signed in as</div>
            <div className="text-sm font-semibold text-zinc-200 truncate">{userDisplayName}</div>
            <div className="text-[10px] text-zinc-500 capitalize mt-0.5">Role: {profile?.role || 'Seller'}</div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              href="/seller"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors group"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400 group-hover:text-[#B8763C] transition-colors" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/seller/products"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors group"
            >
              <Package className="w-4 h-4 text-zinc-400 group-hover:text-[#B8763C] transition-colors" />
              <span>My Products</span>
            </Link>

            <Link
              href="/seller/products/create"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-[#B8763C]/15 text-[#DDA164] border border-[#B8763C]/30 hover:bg-[#B8763C]/25 transition-all group mt-2"
            >
              <PlusCircle className="w-4 h-4 text-[#B8763C]" />
              <span className="font-semibold">Upload Product</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />
            </Link>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-zinc-800/60 mt-8 space-y-2">
          <Link
            href="/shop"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-colors"
          >
            <Store className="w-4 h-4 text-zinc-500" />
            <span>View Marketplace</span>
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
