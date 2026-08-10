import { createClient } from '@/lib/supabase/server'
import { WishlistClient } from '@/components/shop/WishlistClient'
import { ProductWithCategory } from '@/components/ui/ProductCard'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export const metadata = {
  title: 'My Wishlist | Alpona',
  description: 'Your saved favorite streetwear garments and custom artwork templates.',
}

export default async function WishlistPage() {
  const supabase = await createClient()

  // Fetch all active products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name,
        slug
      )
    `)
    .eq('is_active', true)

  const cleanProducts = (products || []).map((p: any) => ({
    ...p,
    categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
  })) as unknown as ProductWithCategory[]

  return (
    <div className="min-h-screen bg-[#FAF7F4] pt-6 md:pt-10 pb-20 md:pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1A1A1A] font-bold">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8763C]/10 border border-[#B8763C]/20 text-[#B8763C] text-[10px] font-black uppercase tracking-[0.25em]">
            <Heart size={12} className="fill-[#B8763C]" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] tracking-tight text-balance">
            My Studio Wishlist
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Curate your personal collection and transfer saved pieces directly to your cart.
          </p>
        </div>
      </div>

      <WishlistClient products={cleanProducts} />
    </div>
  )
}
