import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'

export default async function SellerDashboardPage() {
  const supabase = await createClient()

  // Fetch product stats
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, selling_price, base_price, status, images, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const allProducts = products || []
  const totalCount = allProducts.length
  const activeCount = allProducts.filter(p => p.status === 'active').length
  const draftCount = allProducts.filter(p => p.status === 'draft').length
  const recentProducts = allProducts.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E1B18] via-[#141416] to-[#1E1B18] border border-zinc-800/80 rounded-2xl p-6 md:p-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#B8763C]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B8763C] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Seller Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
              Product Upload Portal
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-xl">
              Upload new merchandise, update pricing, configure print variants, and manage your store catalog seamlessly.
            </p>
          </div>

          <Link
            href="/seller/products/create"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8763C] to-[#A3632B] hover:from-[#A3632B] hover:to-[#8E5220] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-[#B8763C]/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141416] border border-zinc-800/80 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-300">
            <Package className="w-6 h-6 text-[#B8763C]" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Total Products</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="bg-[#141416] border border-zinc-800/80 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Active Listings</div>
            <div className="text-2xl font-bold text-white mt-0.5">{activeCount}</div>
          </div>
        </div>

        <div className="bg-[#141416] border border-zinc-800/80 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Draft Products</div>
            <div className="text-2xl font-bold text-white mt-0.5">{draftCount}</div>
          </div>
        </div>

        <div className="bg-[#141416] border border-zinc-800/80 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-medium">Platform Ready</div>
            <div className="text-2xl font-bold text-white mt-0.5">100%</div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Uploads</h2>
            <p className="text-xs text-zinc-400">Latest products added to the catalog</p>
          </div>
          <Link
            href="/seller/products"
            className="text-xs font-semibold text-[#B8763C] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
            <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No products uploaded yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              Get started by uploading your first product with images, variants, and pricing.
            </p>
            <Link
              href="/seller/products/create"
              className="inline-flex items-center gap-2 text-xs font-semibold bg-[#B8763C] text-white px-4 py-2 rounded-lg hover:bg-[#A3632B] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/60 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-4 py-3">Product</th>
                  <th scope="col" className="px-4 py-3">Selling Price</th>
                  <th scope="col" className="px-4 py-3">Base Price</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentProducts.map((p) => {
                  const imageSrc = p.images?.[0] || '/placeholder.png'
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50">
                            {p.images?.[0] ? (
                              <Image
                                src={imageSrc}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Img</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">/{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">₹{p.selling_price}</td>
                      <td className="px-4 py-3 text-zinc-400">₹{p.base_price || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                          p.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
