'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { toggleProductActive, deleteProduct } from './actions'
import { Package, Search, Plus, Cpu, Grid3X3, List, Trash2, Pencil, Eye, EyeOff, Loader2, Download, Tag, Layers, Store } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface ProductsClientProps {
  products: any[]
}

const filterTabs = [
  { id: 'all', name: 'All' },
  { id: 'pod', name: 'Qikink (POD)' },
  { id: 'manual', name: 'Manual' },
  { id: 'low_stock', name: 'Low Stock (<5)' },
  { id: 'inactive', name: 'Inactive' },
]

export function ProductsClient({ products: initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null)

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(products.map(p => p.category?.name).filter(Boolean))
  ) as string[]

  const filtered = products.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_type?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const isPod = !!p.qikink_product_id
    const hasLowStock = Array.isArray(p.product_variants) && p.product_variants.some((v: any) => Number(v.stock) < 5)
    
    const matchesCategory = selectedCategory === 'all' || p.category?.name === selectedCategory

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'pod' && isPod) ||
      (activeFilter === 'manual' && !isPod) ||
      (activeFilter === 'low_stock' && hasLowStock) ||
      (activeFilter === 'inactive' && !p.is_active)

    return matchesSearch && matchesCategory && matchesFilter
  })

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTogglingId(id)
    const result = await toggleProductActive(id, currentStatus)
    setTogglingId(null)
    if (result.success) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
      toast.success(`Product ${currentStatus ? 'hidden' : 'published'}`)
    } else {
      toast.error(result.error || 'Failed to toggle')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return
    const result = await deleteProduct(deleteDialog.id)
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== deleteDialog.id))
      toast.success('Product deleted')
    } else {
      toast.error(result.error || 'Failed to delete')
    }
    setDeleteDialog(null)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Products Catalog</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage product details, pricing, variants & catalog hierarchy.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller">
            <Button variant="outline" className="bg-[#B8763C]/10 text-[#DDA164] border border-[#B8763C]/30 hover:bg-[#B8763C]/20 text-xs font-semibold active:scale-[0.97] h-10 px-4 rounded-xl transition-all">
              <Store className="w-4 h-4 mr-2 text-[#B8763C]" /> Seller Portal
            </Button>
          </Link>
          <Link href="/admin/products/import">
            <Button variant="outline" className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 text-xs font-semibold active:scale-[0.97] h-10 px-4 rounded-xl transition-all">
              <Cpu className="w-4 h-4 mr-2" /> Import Qikink
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              const headers = ['Name', 'Slug', 'Price', 'Category', 'Subcategory', 'Product Type', 'Fulfillment', 'Status']
              const rows = filtered.map((p: any) => [
                `"${p.name}"`, 
                p.slug, 
                p.selling_price, 
                `"${p.category?.name || ''}"`, 
                `"${p.subcategory?.name || ''}"`,
                `"${p.product_type?.name || ''}"`,
                p.qikink_product_id ? 'POD' : 'Manual', 
                p.is_active ? 'Active' : 'Inactive'
              ])
              const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `alpona_products_${Date.now()}.csv`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="border-white/[0.08] hover:bg-white/[0.04] text-white text-xs font-semibold active:scale-[0.97] h-10 px-4 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Link href="/admin/products/create">
            <Button className="bg-[#B8763C] hover:bg-[#a66833] text-white text-xs font-bold active:scale-[0.97] h-10 px-5 rounded-xl transition-all shadow-lg shadow-[#B8763C]/20 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> Create Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-[#121214]/80 border border-white/[0.04] p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, category, subcategory, or product type..."
              className="pl-10 bg-[#09090b] border-white/[0.06] text-white placeholder:text-zinc-500 text-xs h-10 rounded-xl focus:border-[#B8763C]"
            />
          </div>

          {/* Category Dropdown Filter */}
          {uniqueCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#09090b] border border-white/[0.06] text-zinc-300 text-xs h-10 px-3 rounded-xl focus:outline-none focus:border-[#B8763C] cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* View Toggles */}
          <div className="flex gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.04] shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#B8763C] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid / List */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product: any) => {
              const isPod = !!product.qikink_product_id
              const img = product.images?.[0]
              const taxonomyBreadcrumb = [
                product.category?.name,
                product.subcategory?.name,
                product.product_type?.name
              ].filter(Boolean).join(' › ')

              return (
                <div key={product.id} className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden hover:border-[#B8763C]/30 hover:shadow-xl hover:shadow-[#B8763C]/10 transition-all duration-300 group hover:-translate-y-1">
                  {/* Image */}
                  <div className="aspect-square bg-[#09090b]/80 relative flex items-center justify-center p-6 border-b border-white/[0.02]">
                    {img ? (
                      <img src={img} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" />
                    ) : (
                      <Package className="w-12 h-12 text-zinc-800" />
                    )}
                    {!product.is_active && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all">
                        <span className="px-3 py-1.5 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest shadow-xl">Inactive</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase shadow-sm ${
                        isPod ? 'text-blue-400 bg-blue-500/10 ring-1 ring-inset ring-blue-500/20' : 'text-orange-400 bg-orange-500/10 ring-1 ring-inset ring-orange-500/20'
                      }`}>
                        {isPod ? 'POD' : 'Manual'}
                      </span>
                      {Array.isArray(product.product_variants) && product.product_variants.some((v: any) => Number(v.stock) < 5) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 shadow-sm">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-[#B8763C] transition-colors">{product.name}</h3>
                      <p className="text-[11px] text-zinc-400 mt-1 truncate font-medium" title={taxonomyBreadcrumb}>
                        {taxonomyBreadcrumb || 'Uncategorized'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-white font-mono tabular-nums tracking-tight">{CURRENCY_SYMBOL}{product.selling_price}</span>
                        {product.base_price > 0 && product.base_price < product.selling_price && (
                          <span className="text-[11px] text-zinc-500 line-through font-mono tabular-nums">{CURRENCY_SYMBOL}{product.base_price}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-zinc-400 px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/50 rounded-lg">{product.product_variants?.length || 0} vars</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggle(product.id, product.is_active)} disabled={togglingId === product.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.95]">
                          {togglingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteDialog({ id: product.id, name: product.name })} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-[0.95]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] h-8 px-3 rounded-lg active:scale-[0.97] transition-all">
                          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-transparent text-zinc-500 border-b border-white/[0.04]">
                    <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Product</th>
                    <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Category & Taxonomy</th>
                    <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Price</th>
                    <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Fulfillment</th>
                    <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                    <th className="px-5 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filtered.map((product: any) => {
                    const isPod = !!product.qikink_product_id
                    const taxonomyBreadcrumb = [
                      product.category?.name,
                      product.subcategory?.name,
                      product.product_type?.name
                    ].filter(Boolean).join(' › ')

                    return (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-zinc-200 text-[13px] group-hover:text-[#B8763C] transition-colors">{product.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">/shop/{product.slug}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-zinc-300 font-medium">
                            {taxonomyBreadcrumb || <span className="text-zinc-600">Unassigned</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-white tabular-nums text-[13px]">{CURRENCY_SYMBOL}{product.selling_price}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase shadow-sm ${
                            isPod ? 'text-blue-400 bg-blue-500/10 ring-1 ring-inset ring-blue-500/20' : 'text-orange-400 bg-orange-500/10 ring-1 ring-inset ring-orange-500/20'
                          }`}>
                            {isPod ? 'POD' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                            product.is_active ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20' : 'text-zinc-400 bg-zinc-500/10 ring-1 ring-inset ring-zinc-500/20'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleToggle(product.id, product.is_active)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.95]">
                              {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <Link href={`/admin/products/${product.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all active:scale-[0.95]">
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button onClick={() => setDeleteDialog({ id: product.id, name: product.name })} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-[0.95]">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-[#121214]/40 rounded-2xl border border-white/[0.04] space-y-3">
          <Package className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-400">No products match your current filters.</p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setActiveFilter('all')
            }}
            variant="outline"
            className="text-xs border-zinc-700 text-zinc-300"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent className="bg-[#121214] border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Are you sure you want to delete <span className="text-white font-bold">{deleteDialog?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="border-zinc-800 text-zinc-300 text-xs">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
