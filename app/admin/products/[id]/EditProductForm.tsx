'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { saveProduct } from '../actions'
import { 
  ArrowLeft, Plus, Trash2, Loader2, Cpu, Package, Sparkles, Wand2, 
  Check, Copy, Eye, Tag, DollarSign, Layers, ShieldCheck, Image as ImageIcon,
  Palette, Grid, AlertCircle, RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import { SingleImageUpload } from '@/components/ui/single-image-upload'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EditProductFormProps {
  product: any
  categories: { id: string; name: string }[]
  subcategories: { id: string; category_id: string; name: string }[]
  productTypes: { id: string; subcategory_id: string; name: string }[]
  availableDesigns?: { id: string; name: string; thumbnail_url: string; image_url: string }[]
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const PRESET_COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Heather Grey', hex: '#7A7A7A' },
  { name: 'Maroon', hex: '#8B1E1E' },
  { name: 'Olive Green', hex: '#1D3A20' },
  { name: 'Beige', hex: '#DCD1C4' },
  { name: 'Lavender', hex: '#D4B2D8' },
]

export function EditProductForm({ product, categories, subcategories, productTypes, availableDesigns = [] }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const isPod = !!product.qikink_product_id

  // Core Fields
  const [name, setName] = useState(product.name || '')
  const [customSlug, setCustomSlug] = useState(product.slug || '')
  const [description, setDescription] = useState(product.description || '')
  const [displayName, setDisplayName] = useState(product.display_name || '')
  const [shortDescription, setShortDescription] = useState(product.short_description || '')
  
  // Taxonomy
  const [categoryId, setCategoryId] = useState(product.category_id || '')
  const [subcategoryId, setSubcategoryId] = useState(product.subcategory_id || '')
  const [productTypeId, setProductTypeId] = useState(product.product_type_id || '')
  
  // Pricing
  const [basePrice, setBasePrice] = useState(product.base_price?.toString() || '')
  const [sellingPrice, setSellingPrice] = useState(product.selling_price?.toString() || '')
  const [compareAtPrice, setCompareAtPrice] = useState(product.compare_at_price?.toString() || '')
  
  // POD
  const [qikinkProductId, setQikinkProductId] = useState(product.qikink_product_id || '')
  
  // Media & Customizer Designs
  const [images, setImages] = useState<string[]>(product.images || [])
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>(
    product.product_designs?.map((pd: any) => pd.design_id) || []
  )
  
  // Specs & Highlights
  const [materialInfo, setMaterialInfo] = useState(product.material_info || '')
  const [productCareInfo, setProductCareInfo] = useState(product.product_care_info || '')
  const [highlightsList, setHighlightsList] = useState<string[]>(product.product_highlights || [])
  const [newHighlight, setNewHighlight] = useState('')
  
  // Badges & Visibility
  const [isActive, setIsActive] = useState(product.is_active ?? true)
  const [isNewArrival, setIsNewArrival] = useState(product.is_new_arrival || false)
  const [isBestseller, setIsBestseller] = useState(product.is_bestseller || false)
  const [isTrending, setIsTrending] = useState(product.is_trending || false)

  // Variants
  const [variants, setVariants] = useState<{ id?: string; size: string; color: string; color_hex?: string; stock: string; qikink_variant_id: string; image_url: string }[]>(
    product.product_variants?.map((v: any) => ({
      id: v.id,
      size: v.size || '',
      color: v.color || '',
      color_hex: v.color_hex || '',
      stock: v.stock?.toString() || '0',
      qikink_variant_id: v.qikink_variant_id || '',
      image_url: v.image_url || ''
    })) || []
  )

  const [colorImages, setColorImages] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    if (product.product_variants) {
      product.product_variants.forEach((v: any) => {
        if (v.color && v.image_url) {
          map[v.color] = v.image_url
        }
      })
    }
    return map
  })
  
  // Matrix Generator Selection
  const [selectedMatrixSizes, setSelectedMatrixSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL'])
  const [selectedMatrixColors, setSelectedMatrixColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'White', hex: '#FFFFFF' }
  ])
  const [matrixDefaultStock, setMatrixDefaultStock] = useState('999')

  // Auto-slug generator
  const generatedSlug = useMemo(() => {
    if (customSlug.trim()) return customSlug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }, [name, customSlug])

  // Calculated Profit & Margin
  const profitMetrics = useMemo(() => {
    const cost = parseFloat(basePrice) || 0
    const price = parseFloat(sellingPrice) || 0
    if (price <= 0) return { profit: 0, margin: 0 }
    const profit = price - cost
    const margin = Math.round((profit / price) * 100)
    return { profit, margin }
  }, [basePrice, sellingPrice])

  // AI Content Generator Handler
  const handleGenerateAIContent = async (imagesToAnalyze?: string[]) => {
    const targetImages = imagesToAnalyze || images
    if ((!targetImages || targetImages.length === 0) && !name.trim() && !categoryId) {
      toast.error('Upload product photo(s) or enter a title first to generate AI copy.')
      return
    }

    setIsGeneratingAI(true)
    const toastId = toast.loading('✨ AI is analyzing product visually & drafting descriptions...')

    try {
      const selectedCategory = categories.find(c => c.id === categoryId)?.name

      const res = await fetch('/api/ai/describe-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls: targetImages,
          categoryName: selectedCategory,
          productName: name || displayName
        })
      })

      const json = await res.json()
      setIsGeneratingAI(false)

      if (json.success && json.data) {
        const d = json.data
        if (d.name && !name) setName(d.name)
        if (d.name && !displayName) setDisplayName(d.name)
        if (d.short_description) setShortDescription(d.short_description)
        if (d.description) setDescription(d.description)
        if (d.material_info) setMaterialInfo(d.material_info)
        if (d.product_care_info) setProductCareInfo(d.product_care_info)
        if (Array.isArray(d.product_highlights)) {
          setHighlightsList(d.product_highlights)
        }
        if (d.suggested_selling_price && !sellingPrice) {
          setSellingPrice(d.suggested_selling_price.toString())
        }
        if (d.suggested_compare_at_price && !compareAtPrice) {
          setCompareAtPrice(d.suggested_compare_at_price.toString())
        }
        if (d.suggested_base_price && !basePrice) {
          setBasePrice(d.suggested_base_price.toString())
        }
        if (d.suggested_badges) {
          if (typeof d.suggested_badges.is_new_arrival === 'boolean') setIsNewArrival(d.suggested_badges.is_new_arrival)
          if (typeof d.suggested_badges.is_bestseller === 'boolean') setIsBestseller(d.suggested_badges.is_bestseller)
          if (typeof d.suggested_badges.is_trending === 'boolean') setIsTrending(d.suggested_badges.is_trending)
        }

        toast.success(`✨ Product content & badges generated via AI!`, { id: toastId })
      } else {
        toast.error(json.error || 'Failed to generate product details.', { id: toastId })
      }
    } catch (err: any) {
      setIsGeneratingAI(false)
      toast.error(err.message || 'AI Generation failed.', { id: toastId })
    }
  }

  // Variant Matrix Auto Generator
  const generateVariantMatrix = () => {
    if (selectedMatrixSizes.length === 0 || selectedMatrixColors.length === 0) {
      toast.error('Select at least 1 size and 1 color for the matrix generator.')
      return
    }

    const newMatrixVariants: typeof variants = []
    selectedMatrixColors.forEach(color => {
      selectedMatrixSizes.forEach(size => {
        const exists = variants.find(v => v.size === size && v.color === color.name)
        if (!exists) {
          newMatrixVariants.push({
            size,
            color: color.name,
            color_hex: color.hex,
            stock: matrixDefaultStock || '999',
            qikink_variant_id: '',
            image_url: colorImages[color.name] || ''
          })
        }
      })
    })

    setVariants([...variants, ...newMatrixVariants])
    toast.success(`Added ${newMatrixVariants.length} variant combination(s)!`)
  }

  const addSingleVariant = () => {
    setVariants([...variants, { size: 'M', color: 'Black', color_hex: '#1A1A1A', stock: '999', qikink_variant_id: '', image_url: '' }])
  }

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx))
  }

  const updateVariant = (idx: number, field: string, value: string) => {
    setVariants(variants.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  const addHighlight = () => {
    if (!newHighlight.trim()) return
    setHighlightsList([...highlightsList, newHighlight.trim()])
    setNewHighlight('')
  }

  const removeHighlight = (idx: number) => {
    setHighlightsList(highlightsList.filter((_, i) => i !== idx))
  }

  const toggleDesignSelection = (designId: string) => {
    setSelectedDesignIds(prev =>
      prev.includes(designId) ? prev.filter(id => id !== designId) : [...prev, designId]
    )
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Product name is required')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.set('id', product.id)
    formData.set('name', name)
    formData.set('slug', generatedSlug)
    formData.set('description', description)
    formData.set('category_id', categoryId)
    formData.set('subcategory_id', subcategoryId)
    formData.set('product_type_id', productTypeId)
    formData.set('base_price', basePrice || '0')
    formData.set('selling_price', sellingPrice || '0')
    formData.set('compare_at_price', compareAtPrice || '')
    formData.set('qikink_product_id', qikinkProductId)
    formData.set('is_active', isActive.toString())
    formData.set('images', JSON.stringify(images))
    
    const processedVariants = variants.map(v => ({
      ...v,
      image_url: colorImages[v.color] || v.image_url || ''
    })).filter(v => v.size || v.color)
    
    formData.set('variants', JSON.stringify(processedVariants))
    formData.set('display_name', displayName)
    formData.set('short_description', shortDescription)
    formData.set('material_info', materialInfo)
    formData.set('product_care_info', productCareInfo)
    formData.set('product_highlights', JSON.stringify(highlightsList))
    formData.set('is_new_arrival', isNewArrival.toString())
    formData.set('is_bestseller', isBestseller.toString())
    formData.set('is_trending', isTrending.toString())
    formData.set('design_ids', JSON.stringify(selectedDesignIds))

    const result = await saveProduct(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Product updated successfully!')
      router.push('/admin/products')
    } else {
      toast.error(result.error || 'Failed to update product')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">

      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 py-4 -mx-6 px-6 mb-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <button
                type="button"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Back to Products"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Edit Product</h1>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                  isPod ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {isPod ? 'Qikink POD' : 'Manual Stock'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-md">
                Editing: {name} • /shop/{generatedSlug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href={`/shop/${generatedSlug}`} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-9">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> View on Store
              </Button>
            </a>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#B8763C] hover:bg-[#a66833] text-white font-bold text-xs h-9 px-5 rounded-xl shadow-lg shadow-[#B8763C]/20 cursor-pointer min-w-[130px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Product Info (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Basic Title & Descriptions */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#B8763C]" /> General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">Product Title *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Bengali Graphic Tee"
                  className="bg-[#09090b] border-zinc-800 text-white text-xs h-10 focus:border-[#B8763C]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">Display Name Override</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Optional custom title for store PDP"
                  className="bg-[#09090b] border-zinc-800 text-white text-xs h-10 focus:border-[#B8763C]"
                />
              </div>
            </div>

            {/* Custom URL Slug */}
            <div className="space-y-1.5 bg-[#09090b] p-3 rounded-xl border border-zinc-800/60">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">URL Slug Preview</label>
                <span className="text-[10px] text-zinc-500 font-mono">/shop/{generatedSlug}</span>
              </div>
              <Input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="Custom slug"
                className="bg-transparent border-zinc-800 text-zinc-300 text-xs h-8 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300">Full Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-quality combed cotton with vibrant DTG Bengali typography artwork..."
                className="bg-[#09090b] border-zinc-800 text-white text-xs h-32 resize-y focus:border-[#B8763C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300">Short Description (Above the fold summary)</label>
              <Textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Cut from 240 GSM organic cotton with relaxed streetwear drop-shoulder fit."
                className="bg-[#09090b] border-zinc-800 text-white text-xs h-20 resize-none focus:border-[#B8763C]"
              />
            </div>
          </div>

          {/* 2. Media Upload & AI Copilot */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#B8763C]" /> Media Gallery & AI Copywriter
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Upload product photos. AI Vision will visually analyze them to draft product specs.</p>
              </div>

              <Button
                type="button"
                onClick={() => handleGenerateAIContent()}
                disabled={isGeneratingAI}
                className="h-9 px-4 bg-gradient-to-r from-[#B8763C] via-amber-600 to-[#B8763C] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Analyzing Visuals...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" /> Auto-Write Copy with AI
                  </>
                )}
              </Button>
            </div>

            <MultiImageUpload
              value={images}
              onChange={(newImages) => {
                const previousCount = images.length
                setImages(newImages)
                if (previousCount === 0 && newImages.length > 0 && !description.trim()) {
                  handleGenerateAIContent(newImages)
                }
              }}
            />

            {images.length > 0 && (
              <div className="p-3.5 bg-[#B8763C]/10 border border-[#B8763C]/20 rounded-xl flex items-center justify-between gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#B8763C]" />
                  <span><strong>{images.length} image(s) uploaded.</strong> Click to auto-fill title, descriptions & fabric specs!</span>
                </div>
                <Button
                  type="button"
                  onClick={() => handleGenerateAIContent()}
                  disabled={isGeneratingAI}
                  variant="outline"
                  className="h-7 px-3 text-[11px] bg-[#B8763C]/20 border-[#B8763C]/40 text-[#B8763C] hover:bg-[#B8763C]/30 rounded-lg font-bold cursor-pointer"
                >
                  Auto-Fill All
                </Button>
              </div>
            )}
          </div>

          {/* 3. Specs & Product Highlights */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="border-b border-zinc-800/60 pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8763C]" /> Fabric Specs & Features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">Material & Weight</label>
                <Textarea
                  value={materialInfo}
                  onChange={(e) => setMaterialInfo(e.target.value)}
                  placeholder="100% Combed Ring-Spun Cotton, 240 GSM Heavyweight"
                  className="bg-[#09090b] border-zinc-800 text-white text-xs h-20 resize-none focus:border-[#B8763C]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300">Garment Care Instructions</label>
                <Textarea
                  value={productCareInfo}
                  onChange={(e) => setProductCareInfo(e.target.value)}
                  placeholder="Machine wash cold inside-out, tumble dry low, do not iron on print."
                  className="bg-[#09090b] border-zinc-800 text-white text-xs h-20 resize-none focus:border-[#B8763C]"
                />
              </div>
            </div>

            {/* Bulleted Highlights List */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-zinc-300">Product Highlights (PDP Bullet Points)</label>
              <div className="flex gap-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addHighlight()
                    }
                  }}
                  placeholder="Add highlight (e.g. Bio-washed for extra softness)..."
                  className="bg-[#09090b] border-zinc-800 text-white text-xs h-9"
                />
                <Button
                  type="button"
                  onClick={addHighlight}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-9 px-3 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {highlightsList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {highlightsList.map((hl, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium"
                    >
                      <span>• {hl}</span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(idx)}
                        className="text-zinc-500 hover:text-red-400 transition-colors ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Variant Matrix Builder & Individual Variants */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-[#B8763C]" /> Product Variants & Sizes
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Use the fast Matrix Generator or add custom size/color rows manually.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSingleVariant}
                className="text-xs border-zinc-700 text-zinc-300 h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Custom Row
              </Button>
            </div>

            {/* Matrix Quick Generator Panel */}
            <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8763C] flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Quick Matrix Generator
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {selectedMatrixSizes.length} sizes × {selectedMatrixColors.length} colors = {selectedMatrixSizes.length * selectedMatrixColors.length} variants
                </span>
              </div>

              {/* Sizes Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Select Sizes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SIZES.map(sz => {
                    const isSelected = selectedMatrixSizes.includes(sz)
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSelectedMatrixSizes(prev =>
                            isSelected ? prev.filter(s => s !== sz) : [...prev, sz]
                          )
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8763C] text-white border-[#B8763C]'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {sz}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Colors Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Select Colors:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => {
                    const isSelected = selectedMatrixColors.some(col => col.name === c.name)
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedMatrixColors(prev =>
                            isSelected ? prev.filter(col => col.name !== c.name) : [...prev, c]
                          )
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-white border-[#B8763C]'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-medium">Default Stock per variant:</span>
                  <Input
                    type="number"
                    value={matrixDefaultStock}
                    onChange={(e) => setMatrixDefaultStock(e.target.value)}
                    className="w-20 bg-zinc-900 border-zinc-800 text-white text-xs h-8 text-center font-bold"
                  />
                </div>
                <Button
                  type="button"
                  onClick={generateVariantMatrix}
                  className="bg-[#B8763C] hover:bg-[#a66833] text-white font-bold text-xs h-8 px-4 rounded-lg cursor-pointer"
                >
                  Generate Combinations
                </Button>
              </div>
            </div>

            {/* Variants Table / List */}
            {variants.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-4 italic">No variants added yet. Use the Quick Matrix Generator above or click "Custom Row".</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3">
                  <span className="col-span-2">Size</span>
                  <span className="col-span-3">Color</span>
                  <span className="col-span-2">Stock</span>
                  {isPod && <span className="col-span-4">Qikink SKU</span>}
                  <span className="col-span-1 text-right">Action</span>
                </div>

                {variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#09090b] p-2.5 rounded-xl border border-zinc-800/60">
                    <div className="col-span-2">
                      <Input
                        value={v.size}
                        onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                        placeholder="M"
                        className="bg-transparent border-zinc-800 text-white text-xs h-8 font-bold"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: v.color_hex || '#1A1A1A' }}
                      />
                      <Input
                        value={v.color}
                        onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                        placeholder="Black"
                        className="bg-transparent border-zinc-800 text-white text-xs h-8"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                        placeholder="999"
                        className="bg-transparent border-zinc-800 text-white text-xs h-8 text-center"
                      />
                    </div>
                    {isPod && (
                      <div className="col-span-4">
                        <Input
                          value={v.qikink_variant_id}
                          onChange={(e) => updateVariant(idx, 'qikink_variant_id', e.target.value)}
                          placeholder="e.g. QIK-TSHIRT-BLK-M"
                          className="bg-transparent border-zinc-800 text-zinc-300 text-xs h-8 font-mono text-[11px]"
                        />
                      </div>
                    )}
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Per-Color Variant Image Uploaders */}
            {Array.from(new Set(variants.map(v => v.color).filter(c => c.trim().length > 0))).length > 0 && (
              <div className="pt-4 border-t border-zinc-800/60">
                <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-3">Color Swatch Image Overrides</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(new Set(variants.map(v => v.color).filter(c => c.trim().length > 0))).map((color, idx) => (
                    <div key={idx} className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800/60 space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: variants.find(v => v.color === color)?.color_hex || '#1A1A1A' }}
                        />
                        <span className="text-xs font-bold text-white">{color} Color Photo</span>
                      </div>
                      <SingleImageUpload 
                        value={colorImages[color] || ''} 
                        onChange={(url) => setColorImages({ ...colorImages, [color]: url })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Customizer Designs Attachment */}
          {availableDesigns.length > 0 && (
            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <div className="border-b border-zinc-800/60 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-[#B8763C]" /> Link Customizer Artwork Designs
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Attach artwork designs to enable customer customization on PDP.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {availableDesigns.map(design => {
                  const isSelected = selectedDesignIds.includes(design.id)
                  return (
                    <button
                      key={design.id}
                      type="button"
                      onClick={() => toggleDesignSelection(design.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#B8763C]/10 border-[#B8763C] text-white'
                          : 'bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={design.thumbnail_url || design.image_url}
                        alt={design.name}
                        className="w-8 h-8 rounded-lg object-cover bg-black"
                      />
                      <div className="truncate flex-1">
                        <p className="text-xs font-bold truncate">{design.name}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#B8763C] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. Status & Visibility Card */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 space-y-4 sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800/60 pb-3">
              Publishing & Status
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800/60">
              <div>
                <p className="text-xs font-bold text-white">Product Status</p>
                <p className="text-[10px] text-zinc-400">{isActive ? 'Visible in store catalog' : 'Hidden from customers'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B8763C]"></div>
              </label>
            </div>

            {/* Qikink Integration Info */}
            {isPod && (
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <label className="text-[11px] font-bold text-blue-400">Qikink Product ID / SKU</label>
                <Input
                  value={qikinkProductId}
                  onChange={(e) => setQikinkProductId(e.target.value)}
                  placeholder="e.g. 12345 or QIK-TSHIRT"
                  className="bg-[#09090b] border-blue-500/30 text-white text-xs h-9"
                />
                <p className="text-[10px] text-zinc-400">Required for automatic order fulfillment push to Qikink.</p>
              </div>
            )}

            {/* 2. Taxonomy Organization */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">Catalog Organization</h4>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">Category *</label>
                <Select
                  value={categoryId || 'none'}
                  onValueChange={(val: string | null) => {
                    const newCat: string = (!val || val === 'none') ? '' : val
                    setCategoryId(newCat)
                    setSubcategoryId('')
                    setProductTypeId('')
                  }}
                >
                  <SelectTrigger className="w-full bg-[#09090b] border border-zinc-800 text-white text-xs h-10 px-3 rounded-xl focus:border-[#B8763C]">
                    <SelectValue placeholder="Select category">
                      {categories.find(c => c.id === categoryId)?.name || 'Select category'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border border-zinc-700/80 text-white shadow-2xl z-[100]">
                    <SelectItem value="none">-- Unassigned Category --</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">Subcategory (Optional)</label>
                <Select
                  value={subcategoryId || 'none'}
                  onValueChange={(val: string | null) => {
                    const newSub: string = (!val || val === 'none') ? '' : val
                    setSubcategoryId(newSub)
                    setProductTypeId('')
                  }}
                >
                  <SelectTrigger className="w-full bg-[#09090b] border border-zinc-800 text-white text-xs h-10 px-3 rounded-xl focus:border-[#B8763C]">
                    <SelectValue placeholder="Select subcategory">
                      {subcategories.find(s => s.id === subcategoryId)?.name || 'Select subcategory (Optional)'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border border-zinc-700/80 text-white shadow-2xl z-[100]">
                    <SelectItem value="none">-- None (Direct to Category) --</SelectItem>
                    {(categoryId 
                      ? subcategories.filter(s => s.category_id === categoryId)
                      : subcategories
                    ).map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">Product Type (Optional)</label>
                <Select
                  value={productTypeId || 'none'}
                  onValueChange={(val: string | null) => {
                    const newType: string = (!val || val === 'none') ? '' : val
                    setProductTypeId(newType)
                  }}
                >
                  <SelectTrigger className="w-full bg-[#09090b] border border-zinc-800 text-white text-xs h-10 px-3 rounded-xl focus:border-[#B8763C]">
                    <SelectValue placeholder="Select product type">
                      {productTypes.find(t => t.id === productTypeId)?.name || 'Select product type (Optional)'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border border-zinc-700/80 text-white shadow-2xl z-[100]">
                    <SelectItem value="none">-- None --</SelectItem>
                    {(subcategoryId
                      ? (productTypes.filter(t => t.subcategory_id === subcategoryId).length > 0
                          ? productTypes.filter(t => t.subcategory_id === subcategoryId)
                          : productTypes)
                      : productTypes
                    ).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3. Pricing & Profit Margin Calculator */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/60">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Pricing & Margins</span>
                {profitMetrics.profit > 0 && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    profitMetrics.margin >= 40 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {profitMetrics.margin}% Margin (₹{profitMetrics.profit})
                  </span>
                )}
              </h4>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-300 font-medium">Selling Price (₹) *</label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="599"
                    className="bg-[#09090b] border-zinc-800 text-white text-xs h-10 font-bold text-base focus:border-[#B8763C]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Base Cost (₹)</label>
                    <Input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="249"
                      className="bg-[#09090b] border-zinc-800 text-zinc-300 text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Compare At (₹)</label>
                    <Input
                      type="number"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="999"
                      className="bg-[#09090b] border-zinc-800 text-zinc-300 text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Badges & Featured Tags */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">Promotional Badges</h4>
                <button
                  type="button"
                  onClick={async () => {
                    const targetImages = images
                    if (targetImages.length === 0 && !name && !displayName) {
                      toast.error('Add an image or product title first for AI badge analysis.')
                      return
                    }
                    const tid = toast.loading('✨ AI analyzing product positioning for optimal badges...')
                    try {
                      const selectedCategory = categories.find(c => c.id === categoryId)?.name
                      const res = await fetch('/api/ai/describe-product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          imageUrls: targetImages,
                          categoryName: selectedCategory,
                          productName: name || displayName
                        })
                      })
                      const json = await res.json()
                      if (json.success && json.data?.suggested_badges) {
                        const sb = json.data.suggested_badges
                        if (typeof sb.is_new_arrival === 'boolean') setIsNewArrival(sb.is_new_arrival)
                        if (typeof sb.is_bestseller === 'boolean') setIsBestseller(sb.is_bestseller)
                        if (typeof sb.is_trending === 'boolean') setIsTrending(sb.is_trending)
                        toast.success(`✨ AI Badges Applied: ${sb.badge_reason || 'Badges optimized!'}`, { id: tid, duration: 4000 })
                      } else {
                        toast.error('Could not determine AI badges. Defaulting enabled.', { id: tid })
                      }
                    } catch {
                      toast.error('AI Badge detection failed.', { id: tid })
                    }
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-[#B8763C] hover:text-[#a66833] bg-[#B8763C]/10 border border-[#B8763C]/30 px-2.5 py-1 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Detect with AI
                </button>
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-zinc-800/60 cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">New Arrival Badge</span>
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-[#B8763C]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-zinc-800/60 cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">Bestseller Badge</span>
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-[#B8763C]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-zinc-800/60 cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">Trending Badge</span>
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-[#B8763C]"
                  />
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8763C] hover:bg-[#a66833] text-white font-bold text-xs h-10 rounded-xl shadow-lg shadow-[#B8763C]/20 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Product Changes
            </Button>

          </div>

        </div>

      </div>

    </form>
  )
}
