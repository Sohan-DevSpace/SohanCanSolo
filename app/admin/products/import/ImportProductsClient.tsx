'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Cpu, Download, Loader2, Search, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

type QikinkProduct = {
  client_product_id: string
  product_name: string
  description?: string
  base_price: string
  variants: any[]
}

export function ImportProductsClient() {
  const router = useRouter()
  const [cookie, setCookie] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [products, setProducts] = useState<QikinkProduct[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cookie.trim()) {
      toast.error('Please enter your Qikink session cookie')
      return
    }

    setIsFetching(true)
    setProducts([])
    setSelectedIds(new Set())

    try {
      const res = await fetch('/api/qikink/fetch-my-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setProducts(data.products || [])
        toast.success(`Found ${data.products?.length || 0} products in Qikink`)
      } else {
        toast.error(data.error || 'Failed to fetch products')
      }
    } catch (error: any) {
      toast.error('An error occurred while fetching products')
    } finally {
      setIsFetching(false)
    }
  }

  const handleImport = async () => {
    if (selectedIds.size === 0) return

    const selectedProducts = products.filter(p => selectedIds.has(p.client_product_id))
    setIsImporting(true)

    try {
      const res = await fetch('/api/qikink/import-selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: selectedProducts }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Successfully imported ${data.imported} products`)
        if (data.failed > 0) {
          toast.error(`Failed to import ${data.failed} products`)
        }
        router.push('/admin/products')
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch (error) {
      toast.error('An error occurred during import')
    } finally {
      setIsImporting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.client_product_id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.client_product_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/products" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to Products
        </Link>
        <h1 className="text-xl font-bold text-white  flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          Import from Qikink
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Fetch your existing products from Qikink and import them into your store.</p>
      </div>

      {/* Fetch Section */}
      <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-6">
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 font-medium">Qikink Session Cookie</label>
            <div className="flex gap-3">
              <Input 
                value={cookie} 
                onChange={(e) => setCookie(e.target.value)}
                placeholder="Paste your Qikink session cookie here..." 
                className="bg-[#09090b] border-white/[0.06] text-white text-sm font-mono"
              />
              <Button 
                type="submit" 
                disabled={isFetching || !cookie.trim()}
                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 min-w-[140px]"
              >
                {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Fetch Products
              </Button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Log into your Qikink dashboard, open Developer Tools (F12) {'>'} Network, and copy the `Cookie` header from any request to `fetch_my_products`.
            </p>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {products.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121214] border border-white/[0.06] rounded-xl p-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search fetched products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#09090b] border-white/[0.06] h-9 text-white placeholder-zinc-500 text-xs"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">{selectedIds.size} selected</span>
              <Button 
                onClick={handleImport}
                disabled={isImporting || selectedIds.size === 0}
                className="bg-[#B8763C] hover:bg-[#a66833] text-white text-xs font-semibold"
              >
                {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Import Selected
              </Button>
            </div>
          </div>

          <div className="bg-[#121214] border border-white/[0.06] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#09090b] text-zinc-500 border-b border-white/[0.06]">
                  <th className="px-5 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-white">
                      {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Product Info</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Qikink ID</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Base Price</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Variants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.client_product_id)
                  return (
                    <tr 
                      key={product.client_product_id} 
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${isSelected ? 'bg-blue-500/[0.02]' : ''}`}
                      onClick={() => toggleSelect(product.client_product_id)}
                    >
                      <td className="px-5 py-3">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-white">{product.product_name}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{product.description || 'No description'}</div>
                      </td>
                      <td className="px-5 py-3 font-mono text-zinc-400">{product.client_product_id}</td>
                      <td className="px-5 py-3 font-mono text-white">₹{product.base_price}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border text-zinc-400 bg-zinc-800/50 border-zinc-700">
                          {product.variants?.length || 0} variants
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-sm">
                No products match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
