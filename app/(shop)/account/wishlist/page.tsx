import { createClient } from '@/lib/supabase/server'
import { WishlistClient } from '@/components/shop/WishlistClient'
import { ProductWithCategory } from '@/components/ui/ProductCard'

export const metadata = {
  title: 'My Wishlist | Account',
  description: 'Your saved custom print products and templates.',
}

export default async function AccountWishlistPage() {
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
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-balance text-2xl font-serif font-bold text-[#1A1A1A] mb-1">My Wishlist</h2>
        <p className="text-[13px] text-neutral-500 font-medium">Products you saved for later checkout.</p>
      </div>

      <div className="-mx-4 px-4 lg:mx-0 lg:px-0">
        <WishlistClient products={cleanProducts} />
      </div>
    </div>
  )
}
