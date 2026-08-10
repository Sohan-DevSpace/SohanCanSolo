import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { PlusCircle, Search, Package, ExternalLink } from 'lucide-react'

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const params = await searchParams
  const query = params.query || ''

  const supabase = await createClient()

  let q = supabase
    .from('products')
    .select('id, name, slug, selling_price, base_price, status, images, is_bestseller, is_trending, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (query) {
    q = q.ilike('name', `%${query}%`)
  }

  const { data: products } = await q
  const productList = products || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">My Products</h1>
          <p className="text-xs text-zinc-400">View and manage all products uploaded to Alpona</p>
        </div>

        <Link
          href="/seller/products/create"
          className="inline-flex items-center justify-center gap-2 bg-[#B8763C] hover:bg-[#A3632B] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-[#B8763C]/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Product</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#141416] border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form action="/seller/products" method="get" className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Search products by name..."
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#B8763C] placeholder:text-zinc-500"
          />
        </form>

        <div className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{productList.length}</span> products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl overflow-hidden">
        {productList.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No products found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              {query ? `No matching products found for "${query}"` : 'Your catalog is empty. Start by uploading a product.'}
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
                  <th scope="col" className="px-4 py-3.5">Product Details</th>
                  <th scope="col" className="px-4 py-3.5">Selling Price</th>
                  <th scope="col" className="px-4 py-3.5">Base Cost</th>
                  <th scope="col" className="px-4 py-3.5">Badges</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {productList.map((p) => {
                  const imageSrc = p.images?.[0] || '/placeholder.png'
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50">
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
                            <div className="font-semibold text-zinc-100">{p.name}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">/{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">₹{p.selling_price}</td>
                      <td className="px-4 py-3.5 text-zinc-400">₹{p.base_price || 0}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.is_bestseller && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">Bestseller</span>
                          )}
                          {p.is_trending && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">Trending</span>
                          )}
                          {!p.is_bestseller && !p.is_trending && (
                            <span className="text-[10px] text-zinc-500">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                          p.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-[#B8763C] transition-colors"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
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
