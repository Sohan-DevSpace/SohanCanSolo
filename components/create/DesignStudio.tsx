'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Undo2,
  Redo2,
  RotateCw,
  FlipHorizontal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Upload,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MessageCircle,
  Layers,
  MapPin,
  Zap,
  Sparkle,
  Ruler,
  X,
  Type,
  Download,
  Share2,
  Save,
  History,
  Grid3X3,
  ImageIcon,
  Search,
  Check,
  Wand2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api/client'
import { useUser } from '@/hooks/useUser'
import toast, { Toaster } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description: string
  image: string
  product_count: number
}

interface DBProduct {
  id: string
  name: string
  slug: string
  base_price: number
  selling_price: number
  category_id: string
  images: string[]
  product_type: any
  gender: string
}

type Step = 'entry' | 'category' | 'product' | 'design' | 'review'

interface PositionTransform {
  scale: number
  xOffset: number
  yOffset: number
  rotation: number
  isFlippedH: boolean
}

interface TextLayer {
  id: string
  text: string
  x: number
  y: number
  scale: number
  rotation: number
  fontSize: number
  fontFamily: string
  color: string
  isEditing: boolean
}

interface DesignState {
  frontUrl?: string
  backUrl?: string
  leftPocketUrl?: string
  rightPocketUrl?: string
  leftSleeveUrl?: string
  textLayers: Record<string, TextLayer[]>
  transforms: Record<string, PositionTransform>
}

interface DpiInfo {
  dpi: number
  status: 'excellent' | 'good' | 'low'
  dimensions: string
}

interface OrderConfig {
  printingType: 'DTG' | 'Embroidery' | 'DTF'
  printPosition: string
  selectedColors: string[]
  productBaseColor?: string
  sizes: Record<string, number>
  specialInstructions: string
}

interface HistorySnapshot {
  id: string
  timestamp: number
  thumbnail: string
  state: DesignState
}

interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  designUrl: string
  isPremium: boolean
}

const DEFAULT_TRANSFORM: PositionTransform = {
  scale: 100,
  xOffset: 0,
  yOffset: 0,
  rotation: 0,
  isFlippedH: false,
}

const PRINT_POSITIONS = ['front', 'back', 'left_pocket', 'right_pocket', 'left_sleeve'] as const

const FONT_FAMILIES = [
  'Inter', 'Poppins', 'Space Grotesk', 'Bebas Neue', 'Anton',
  'Oswald', 'Montserrat', 'Raleway', 'Playfair Display', 'Caveat',
]

const COLOR_PALETES = [
  { name: 'Vibrant', colors: ['#FF3131', '#3178FF', '#FFD166', '#06D6A0', '#118AB2'] },
  { name: 'Earthy', colors: ['#8D4231', '#C9653B', '#E6AF2E', '#6B8C23', '#3A6B35'] },
  { name: 'Neon', colors: ['#FF2A6D', '#05D9C6', '#F9A825', '#533483', '#FF6B6B'] },
  { name: 'Monochrome', colors: ['#1A1A1A', '#404040', '#6B6B6B', '#9C9C9C', '#CCCCCC'] },
  { name: 'Pastel', colors: ['#FFADAD', '#FFD3B6', '#FFFFDB', '#DEFFEA', '#B5E7A0'] },
]

const TEMPLATE_CATEGORIES = ['All', 'Streetwear', 'Minimal', 'Bold', 'Vintage', 'Abstract', 'Typography']

const ASSET_CATEGORIES = ['Icons', 'Shapes', 'Patterns', 'Textures', 'Illustrations']

const ASSETS: Record<string, { id: string; name: string; icon: string; url: string }[]> = {
  Icons: [
    { id: 'star', name: 'Star', icon: '★', url: '/assets/icons/star.svg' },
    { id: 'heart', name: 'Heart', icon: '♥', url: '/assets/icons/heart.svg' },
    { id: 'arrow', name: 'Arrow', icon: '→', url: '/assets/icons/arrow.svg' },
    { id: 'circle', name: 'Circle', icon: '●', url: '/assets/icons/circle.svg' },
    { id: 'lightning', name: 'Lightning', icon: '⚡', url: '/assets/icons/lightning.svg' },
  ],
  Shapes: [
    { id: 'circle-shape', name: 'Circle', icon: '●', url: '/assets/shapes/circle.svg' },
    { id: 'square-shape', name: 'Square', icon: '■', url: '/assets/shapes/square.svg' },
    { id: 'triangle-shape', name: 'Triangle', icon: '▲', url: '/assets/shapes/triangle.svg' },
    { id: 'hexagon-shape', name: 'Hexagon', icon: '⬡', url: '/assets/shapes/hexagon.svg' },
  ],
  Patterns: [
    { id: 'dots', name: 'Dots', icon: '⋰', url: '/assets/patterns/dots.svg' },
    { id: 'stripes', name: 'Stripes', icon: '|||', url: '/assets/patterns/stripes.svg' },
    { id: 'waves', name: 'Waves', icon: '~', url: '/assets/patterns/waves.svg' },
  ],
}

const TEMPLATES: Template[] = [
  { id: 'tmpl-1', name: 'Urban Street', category: 'Streetwear', thumbnail: '/templates/urban.jpg', designUrl: '/templates/urban-design.svg', isPremium: false },
  { id: 'tmpl-2', name: 'Minimalist Logo', category: 'Minimal', thumbnail: '/templates/minimal.jpg', designUrl: '/templates/minimal-design.svg', isPremium: false },
  { id: 'tmpl-3', name: 'Bold Typography', category: 'Typography', thumbnail: '/templates/typography.jpg', designUrl: '/templates/typography-design.svg', isPremium: true },
  { id: 'tmpl-4', name: 'Retro Vibes', category: 'Vintage', thumbnail: '/templates/retro.jpg', designUrl: '/templates/retro-design.svg', isPremium: false },
  { id: 'tmpl-5', name: 'Abstract Geometry', category: 'Abstract', thumbnail: '/templates/abstract.jpg', designUrl: '/templates/abstract-design.svg', isPremium: true },
  { id: 'tmpl-6', name: 'Graffiti Style', category: 'Streetwear', thumbnail: '/templates/graffiti.jpg', designUrl: '/templates/graffiti-design.svg', isPremium: true },
]

const SIZE_GUIDE_DATA = [
  { size: 'XS', chest: '34-36"', length: '26"', shoulder: '16.5"' },
  { size: 'S', chest: '36-38"', length: '27"', shoulder: '17.5"' },
  { size: 'M', chest: '38-40"', length: '28"', shoulder: '18.5"' },
  { size: 'L', chest: '40-42"', length: '29"', shoulder: '19.5"' },
  { size: 'XL', chest: '42-44"', length: '30"', shoulder: '20.5"' },
  { size: '2XL', chest: '44-46"', length: '31"', shoulder: '21.5"' },
]

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function DesignStudio() {
  const router = useRouter()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState<Step>('entry')

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedProductSku, setSelectedProductSku] = useState<string>('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women' | 'kids'>('all')

  const [activeTab, setActiveTab] = useState<string>('front')
  const [activeTool, setActiveTool] = useState<'upload' | 'text' | 'templates' | 'assets' | 'ai'>('upload')
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<string>('All')
  const [activeAssetCategory, setActiveAssetCategory] = useState<string>('Icons')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const [showAIGenerate, setShowAIGenerate] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAIGenerating, setIsAIGenerating] = useState(false)
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState<string | null>(null)
  const [aiGenerationMode, setAiGenerationMode] = useState<'svg' | 'image'>('svg')
  const [showSloganGenerator, setShowSloganGenerator] = useState(false)
  const [slogans, setSlogans] = useState<{ text: string; style: string }[]>([])
  const [isGeneratingSlogans, setIsGeneratingSlogans] = useState(false)

  const [designState, setDesignState] = useState<DesignState>({
    textLayers: {},
    transforms: {
      front: { ...DEFAULT_TRANSFORM },
      back: { ...DEFAULT_TRANSFORM },
      left_pocket: { ...DEFAULT_TRANSFORM },
      right_pocket: { ...DEFAULT_TRANSFORM },
      left_sleeve: { ...DEFAULT_TRANSFORM },
    },
  })

  const [history, setHistory] = useState<HistorySnapshot[]>([
    {
      id: 'initial',
      timestamp: Date.now(),
      thumbnail: '',
      state: {
        textLayers: {},
        transforms: {
          front: { ...DEFAULT_TRANSFORM },
          back: { ...DEFAULT_TRANSFORM },
          left_pocket: { ...DEFAULT_TRANSFORM },
          right_pocket: { ...DEFAULT_TRANSFORM },
          left_sleeve: { ...DEFAULT_TRANSFORM },
        },
      },
    },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showHistory, setShowHistory] = useState(false)

  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [dpiMap, setDpiMap] = useState<Record<string, DpiInfo>>({})
  const [selectedTextLayerId, setSelectedTextLayerId] = useState<string | null>(null)

  const [config, setConfig] = useState<OrderConfig>({
    printingType: 'DTG',
    printPosition: 'front',
    selectedColors: ['White'],
    sizes: { M: 1 },
    specialInstructions: '',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<DBProduct[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: true,
  })

  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('products').select('*'),
        ])
        if (catsRes.data) setCategories(catsRes.data as Category[])
        if (prodsRes.data) setProducts(prodsRes.data as unknown as DBProduct[])
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast.error('Failed to load design studio data')
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [supabase])

  useEffect(() => {
    if (user) {
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).then(res => {
        if (res.data) {
          setAddresses(res.data)
          if (res.data.length > 0) setSelectedAddressId(res.data[0].id)
        }
      })
    }
  }, [user, supabase])

  const pushHistory = useCallback((state: DesignState, thumbnail: string = '') => {
    const snapshot: HistorySnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      thumbnail,
      state: JSON.parse(JSON.stringify(state)),
    }
    setHistory(hPrev => {
      const sliced = hPrev.slice(0, historyIndex + 1)
      const newHistory = [...sliced, snapshot]
      if (newHistory.length > 20) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(hIdx => Math.min(hIdx + 1, 19))
  }, [historyIndex])

  const updateDesignState = useCallback((updater: (prev: DesignState) => DesignState) => {
    setDesignState(prev => {
      const next = updater(prev)
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevSnapshot = history[historyIndex - 1]
      if (prevSnapshot) {
        setHistoryIndex(historyIndex - 1)
        setDesignState(prevSnapshot.state)
      }
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextSnapshot = history[historyIndex + 1]
      if (nextSnapshot) {
        setHistoryIndex(historyIndex + 1)
        setDesignState(nextSnapshot.state)
      }
    }
  }

  useEffect(() => {
    if (currentStep !== 'design') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) handleRedo()
        else handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 2
        const activeTransform = designState.transforms[activeTab] || DEFAULT_TRANSFORM
        updateDesignState(prev => ({
          ...prev,
          transforms: {
            ...prev.transforms,
            [activeTab]: {
              ...prev.transforms[activeTab] || DEFAULT_TRANSFORM,
              xOffset: e.key === 'ArrowLeft' ? activeTransform.xOffset - step : e.key === 'ArrowRight' ? activeTransform.xOffset + step : activeTransform.xOffset,
              yOffset: e.key === 'ArrowUp' ? activeTransform.yOffset - step : e.key === 'ArrowDown' ? activeTransform.yOffset + step : activeTransform.yOffset,
            },
          },
        }))
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        updateDesignState(p => {
          const newP = { ...p } as typeof p
          delete newP[`${activeTab}Url` as keyof typeof p]
          return newP
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, activeTab, historyIndex, history, designState, updateDesignState, handleUndo, handleRedo])

  const handleGenerateSlogans = async (theme: string) => {
    if (!theme.trim()) {
      toast.error('Please enter a theme for slogans')
      return
    }
    setIsGeneratingSlogans(true)
    try {
      const res = await apiClient.post<{ success: boolean; slogans: { text: string; style: string }[] }>('/api/ai', {
        mode: 'slogan',
        prompt: theme,
      })
      if (res.slogans && res.slogans.length > 0) {
        setSlogans(res.slogans)
        toast.success(`${res.slogans.length} slogans generated`)
      } else {
        toast.error('No slogans generated. Try a different theme.')
      }
    } catch (err) {
      console.error('Slogan generation failed:', err)
      toast.error('Failed to generate slogans')
    } finally {
      setIsGeneratingSlogans(false)
    }
  }

  const handleApplySlogan = (text: string) => {
    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      text,
      x: 0,
      y: 0,
      scale: 100,
      rotation: 0,
      fontSize: 48,
      fontFamily: 'Inter',
      color: '#1A1A1A',
      isEditing: true,
    }
    updateDesignState(prev => ({
      ...prev,
      textLayers: {
        ...prev.textLayers,
        [activeTab]: [...(prev.textLayers[activeTab] || []), newLayer],
      },
    }))
    setSelectedTextLayerId(newLayer.id)
    setShowSloganGenerator(false)
    toast.success(`"${text}" added as text layer`)
  }

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const rawProduct = products.find(p => p.id === selectedProductSku)
  const selectedProduct = rawProduct ? {
    sku: rawProduct.id,
    name: rawProduct.name,
    collection: 'Master',
    gender: 'unisex' as const,
    basePrice: rawProduct.selling_price || rawProduct.base_price,
    availableColors: ['White', 'Black', 'Navy', 'Grey'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    printPositions: PRINT_POSITIONS,
    printingTypes: ['DTG', 'Embroidery', 'DTF'] as ('DTG' | 'Embroidery' | 'DTF')[],
    image: rawProduct.images?.[0],
  } : undefined

  const steps = [
    { id: 'entry', label: 'Entry' },
    { id: 'category', label: 'Category' },
    { id: 'product', label: 'Product' },
    { id: 'design', label: 'Design Studio' },
    { id: 'review', label: 'Review & Pay' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const activeTransform = designState.transforms[activeTab] || DEFAULT_TRANSFORM

  const updateActiveTransform = useCallback((updater: (prev: PositionTransform) => PositionTransform) => {
    updateDesignState(prev => ({
      ...prev,
      transforms: {
        ...prev.transforms,
        [activeTab]: updater(prev.transforms[activeTab] || DEFAULT_TRANSFORM),
      },
    }))
  }, [activeTab, updateDesignState])

  const totalQuantity = Object.values(config.sizes).reduce((acc, qty) => acc + qty, 0)
  const basePricePerItem = selectedProduct?.basePrice || 0

  let finishSurcharge = 0
  if (config.printingType === 'Embroidery') finishSurcharge = 350
  if (config.printingType === 'DTF') finishSurcharge = 250

  let extraPositionsSurcharge = 0
  const activePositionCount = PRINT_POSITIONS.filter(
    pos => (designState as any)[`${pos}Url`]
  ).length

  if (activePositionCount > 1) {
    extraPositionsSurcharge = (activePositionCount - 1) * 150
  }

  const finalPricePerItem = basePricePerItem + finishSurcharge + extraPositionsSurcharge
  const grandTotal = totalQuantity * finalPricePerItem

  const analyzeImageDpi = (url: string, positionKey: string) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const estimatedDpi = Math.round((width / 12))
      let status: 'excellent' | 'good' | 'low' = 'excellent'
      if (estimatedDpi < 150) status = 'low'
      else if (estimatedDpi < 300) status = 'good'

      setDpiMap(prev => ({
        ...prev,
        [positionKey]: {
          dpi: Math.max(72, estimatedDpi),
          status,
          dimensions: `${width} × ${height}px`,
        },
      }))
    }
    img.src = url
  }

  const processUploadedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG)')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 25MB')
      return
    }

    setIsUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${activeTab}-${crypto.randomUUID()}.${ext}`

      const { data, error } = await supabase.storage
        .from('studio-designs')
        .upload(`temp/${fileName}`, file, { upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('studio-designs')
        .getPublicUrl(data.path)

      analyzeImageDpi(publicUrl, activeTab)

      updateDesignState(prev => ({
        ...prev,
        [`${activeTab}Url`]: publicUrl,
      }))

      setConfig(prev => ({ ...prev, printPosition: activeTab }))
      toast.success('Artwork uploaded successfully')
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Failed to upload design. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processUploadedFile(file)
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverCanvas(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processUploadedFile(file)
    }
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a design prompt')
      return
    }

    setIsAIGenerating(true)
    try {
      if (aiGenerationMode === 'svg') {
        const res = await apiClient.post<{ success: boolean; dataUri: string; rawSvg: string }>('/api/ai', {
          mode: 'svg',
          prompt: aiPrompt,
        })

        if (res.dataUri) {
          setAiGeneratedUrl(res.dataUri)
          analyzeImageDpi(res.dataUri, activeTab)
          updateDesignState(prev => ({
            ...prev,
            [`${activeTab}Url`]: res.dataUri,
          }))
          setConfig(prev => ({ ...prev, printPosition: activeTab }))
          toast.success('AI vector design generated successfully')
          setShowAIGenerate(false)
        }
      } else {
        const res = await apiClient.post<{ imageUrl: string }>('/api/ai/generate', {
          prompt: aiPrompt,
          style: 'digital art',
          width: 1024,
          height: 1024,
        })

        if (res.imageUrl) {
          setAiGeneratedUrl(res.imageUrl)
          analyzeImageDpi(res.imageUrl, activeTab)
          updateDesignState(prev => ({
            ...prev,
            [`${activeTab}Url`]: res.imageUrl,
          }))
          setConfig(prev => ({ ...prev, printPosition: activeTab }))
          toast.success('AI design generated successfully')
          setShowAIGenerate(false)
        }
      }
    } catch (err) {
      console.error('AI generation failed:', err)
      toast.error('Failed to generate AI design. Please try again.')
    } finally {
      setIsAIGenerating(false)
    }
  }

  const handleApplyTemplate = (template: Template) => {
    updateDesignState(prev => ({
      ...prev,
      [`${activeTab}Url`]: template.designUrl,
    }))
    setConfig(prev => ({ ...prev, printPosition: activeTab }))
    setShowTemplates(false)
    toast.success(`Template "${template.name}" applied`)
  }

  const handleApplyAsset = (asset: { id: string; name: string; url: string }) => {
    updateDesignState(prev => ({
      ...prev,
      [`${activeTab}Url`]: asset.url,
    }))
    setConfig(prev => ({ ...prev, printPosition: activeTab }))
    setShowAssets(false)
    toast.success(`Asset "${asset.name}" applied`)
  }

  const handleAddTextLayer = () => {
    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      text: 'Your Text',
      x: 0,
      y: 0,
      scale: 100,
      rotation: 0,
      fontSize: 48,
      fontFamily: 'Inter',
      color: '#1A1A1A',
      isEditing: true,
    }
    updateDesignState(prev => ({
      ...prev,
      textLayers: {
        ...prev.textLayers,
        [activeTab]: [...(prev.textLayers[activeTab] || []), newLayer],
      },
    }))
    setSelectedTextLayerId(newLayer.id)
  }

  const handleTextChange = (layerId: string, text: string) => {
    updateDesignState(prev => ({
      ...prev,
      textLayers: {
        ...prev.textLayers,
        [activeTab]: (prev.textLayers[activeTab] || []).map(layer =>
          layer.id === layerId ? { ...layer, text } : layer
        ),
      },
    }))
  }

  const handleTextPropertyChange = (layerId: string, property: keyof TextLayer, value: any) => {
    updateDesignState(prev => ({
      ...prev,
      textLayers: {
        ...prev.textLayers,
        [activeTab]: (prev.textLayers[activeTab] || []).map(layer =>
          layer.id === layerId ? { ...layer, [property]: value } : layer
        ),
      },
    }))
  }

  const handleExportDesign = () => {
    const activeImageUrl = (designState as any)[`${activeTab}Url`]
    if (!activeImageUrl) {
      toast.error('No design to export')
      return
    }
    const link = document.createElement('a')
    link.href = activeImageUrl
    link.download = `alpona-${activeTab}-design.png`
    link.click()
    toast.success('Design exported successfully')
  }

  const handleShareDesign = async () => {
    const activeImageUrl = (designState as any)[`${activeTab}Url`]
    if (!activeImageUrl) {
      toast.error('No design to share')
      return
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Alpona Design',
          text: 'Check out this custom design I made on Alpona!',
          url: activeImageUrl,
        })
        toast.success('Design shared successfully')
      } catch (err) {
        toast.error('Failed to share design')
      }
    } else {
      await navigator.clipboard.writeText(activeImageUrl)
      toast.success('Design link copied to clipboard')
    }
  }

  const handleSaveDesign = async () => {
    if (!user) {
      toast.error('Please log in to save designs')
      return
    }
    try {
      await supabase.from('customer_designs').insert({
        customer_id: user.id,
        product_id: selectedProduct?.sku || null,
        canvas_json: JSON.parse(JSON.stringify(designState)),
        print_ready_url: designState.frontUrl || designState.backUrl || null,
        mockup_url: designState.frontUrl || null,
      })
      toast.success('Design saved to your account')
    } catch (err) {
      console.error('Save design failed:', err)
      toast.error('Failed to save design')
    }
  }

  const handlePlaceOrder = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      toast('Please log in to place an order.', { icon: '🔒' })
      router.push('/auth/login')
      return
    }

    if (addresses.length > 0 && !selectedAddressId) {
      toast.error('Please select a shipping address.')
      return
    }

    if (addresses.length === 0) {
      toast.error('Please add a shipping address in your profile before placing a studio order.')
      return
    }

    setIsProcessing(true)
    try {
      const frontTransform = designState.transforms['front'] || DEFAULT_TRANSFORM
      const data = await apiClient.post<{ orderId: string }>('/api/studio/create-order', {
        userId: currentUser.id,
        addressId: selectedAddressId,
        razorpayPaymentId: 'pay_mock123',
        razorpayOrderId: 'order_mock123',
        razorpaySignature: 'mock_signature',
        studioItems: [{
          qikinkProductSku: selectedProduct!.sku,
          qikinkProductName: selectedProduct!.name,
          qikinkCollection: selectedProduct!.collection,
          designFrontUrl: designState.frontUrl,
          designBackUrl: designState.backUrl,
          designLeftPocketUrl: designState.leftPocketUrl,
          printPositions: [config.printPosition],
          printingType: config.printingType,
          selectedColors: config.selectedColors,
          productBaseColor: config.selectedColors[0] || 'White',
          sizesQuantities: config.sizes,
          qikinkBasePrice: selectedProduct!.basePrice,
          printFinish: config.printingType,
          specialInstructions: config.specialInstructions,
          designX: frontTransform.xOffset,
          designY: frontTransform.yOffset,
          designScale: frontTransform.scale,
          estimatedTotal: grandTotal,
        }],
      })

      router.push(`/order/success?orderId=${data.orderId}&type=studio`)
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error('Checkout failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddAddress = async () => {
    if (!user) return
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsProcessing(true)
    try {
      const { data, error } = await supabase.from('addresses').insert({
        user_id: user.id,
        ...newAddress,
      }).select().single()

      if (error) throw error

      setAddresses(prev => [data, ...prev])
      setSelectedAddressId(data.id)
      setShowAddressForm(false)
      toast.success('Address added successfully')
    } catch (err) {
      console.error('Add address error:', err)
      toast.error('Failed to add address. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderPositionIcon = (pos: string, isActive: boolean) => {
    const isUploaded = !!(designState as any)[`${pos}Url`]
    return (
      <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'text-[#C87533]' : 'text-muted-foreground'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M7 4L4 7v13a1 1 0 001 1h14a1 1 0 001-1V7l-3-3H7z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 4a3 3 0 006 0" strokeLinecap="round" strokeLinejoin="round" />
          {pos === 'front' && <rect x="9" y="9" width="6" height="7" rx="1" fill={isActive ? '#C87533' : 'currentColor'} opacity={isActive ? '0.8' : '0.2'} />}
          {pos === 'back' && <rect x="8" y="8" width="8" height="8" rx="1" fill={isActive ? '#C87533' : 'currentColor'} opacity={isActive ? '0.8' : '0.2'} strokeDasharray="1 1" />}
          {pos === 'left_pocket' && <rect x="13" y="9" width="3" height="4" rx="0.5" fill={isActive ? '#C87533' : 'currentColor'} opacity={isActive ? '0.8' : '0.3'} />}
          {pos === 'right_pocket' && <rect x="8" y="9" width="3" height="4" rx="0.5" fill={isActive ? '#C87533' : 'currentColor'} opacity={isActive ? '0.8' : '0.3'} />}
          {pos === 'left_sleeve' && <circle cx="5" cy="11" r="1.5" fill={isActive ? '#C87533' : 'currentColor'} opacity={isActive ? '0.8' : '0.4'} />}
        </svg>
        {isUploaded && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C87533] border-2 border-background" />
        )}
      </div>
    )
  }

  const getMockupImage = () => {
    if (!selectedProduct) return null
    const color = (config.productBaseColor || 'white').toLowerCase()
    const pos = activeTab === 'left_pocket' ? 'front' : activeTab

    if (selectedProduct.sku === 'US21') {
      if (color === 'black' && pos === 'front') return '/images/mockups/US21-black-front.png'
      if (color === 'black' && pos === 'back') return '/images/mockups/US21-black-back.png'
      if (color === 'white' && pos === 'front') return '/images/mockups/US21-white-front.png'
      if (color === 'white' && pos === 'back') return '/images/mockups/US21-white-back.png'
    }
    if (selectedProduct.sku === 'UC22') {
      if (color === 'white' && pos === 'front') return '/images/mockups/UC22-white-front.jpg'
      if (color === 'white' && pos === 'back') return '/images/mockups/UC22-white-back.jpg'
    }
    return selectedProduct.image || null
  }

  const renderStepProgressBar = () => (
    <div className="w-full max-w-5xl mx-auto px-6 pt-10 pb-8 flex justify-center z-10 relative select-none">
      <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full justify-center">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex
          const isActive = idx === currentStepIndex
          return (
            <div key={step.id} className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button
                onClick={() => {
                  if (isCompleted) setCurrentStep(step.id as Step)
                }}
                disabled={!isCompleted && !isActive}
                className={`flex flex-col items-center gap-1.5 group transition-all ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 ${
                  isActive ? 'text-[#C87533]' : isCompleted ? 'text-foreground' : 'text-muted-foreground/40'
                }`}>
                  0{idx + 1}. {step.label}
                </span>
                <div className={`h-[2.5px] rounded-full transition-all duration-500 ${
                  isActive ? 'bg-[#C87533] w-full shadow-[0_0_8px_rgba(200,117,51,0.5)]' : isCompleted ? 'bg-foreground w-full' : 'bg-border/60 w-0'
                }`} />
              </button>
              {idx < steps.length - 1 && <span className="text-muted-foreground/20 w-4 md:w-8 h-[1px] bg-border" />}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderEntry = () => (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 text-center relative z-10">
      {/* Subtle animated dot grid background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(200,117,51,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C87533]/5 rounded-full blur-[120px]" />
      </div>
      <div className="mb-16">
        <span className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#C87533] mb-6 px-4 py-1.5 bg-[#C87533]/10 border border-[#C87533]/20 rounded-full shadow-2xs">
          <Sparkle size={12} className="animate-spin" /> Interactive Design Studio
        </span>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight text-balance">
          Customize Your Masterpiece.
        </h1>
        <p className="font-sans text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Create high-fidelity streetwear print designs using our real-time 2D canvas editor, AI-powered design generation, or request personalized assistance from our team.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-left">
        <div
          onClick={() => setCurrentStep('category')}
          className="group relative border-2 border-[#C87533]/40 bg-card/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] hover:border-[#C87533] transition-all duration-500 shadow-[0_12px_36px_-12px_rgba(200,117,51,0.25)] hover:shadow-[0_20px_48px_-12px_rgba(200,117,51,0.35)] overflow-hidden hover:-translate-y-1 cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-6 z-10">
            <div className="bg-[#C87533] text-white text-[9px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <Zap size={11} /> Primary Studio
            </div>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#C87533]/10 border border-[#C87533]/20 flex items-center justify-center text-[#C87533] mb-6 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold mb-3 text-foreground group-hover:text-[#C87533] transition-colors">Design It Yourself</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10 min-h-[70px]">
              Upload artwork, generate designs with AI, inspect DPI print safety, drag & snap to alignment guides, configure colors, and preview in real-time.
            </p>

            <button
              className="w-full py-4 bg-[#C87533] hover:bg-[#A65E28] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md group-hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="group relative border border-border/70 bg-card/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] hover:border-foreground/30 transition-all duration-500 shadow-sm hover:shadow-md overflow-hidden hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 p-6 z-10">
            <div className="bg-secondary text-foreground border border-border text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
              Full Support
            </div>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold mb-3 text-foreground">Expert Design Help</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10 min-h-[70px]">
              Work 1-on-1 with our streetwear specialists on WhatsApp. We will vectorize your artwork and optimize your placement for zero extra charge.
            </p>

            <a
              href="https://wa.me/911234567890?text=Hi! I'd like help creating a custom design for my order."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-transparent border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <span>Chat with Specialist</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16 inline-flex items-center gap-3 px-6 py-3 bg-card border border-border/80 rounded-full shadow-2xs text-xs text-muted-foreground">
        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
        <span>100% Quality Inspected • Free Print Vector Verification on all orders</span>
      </div>
    </div>
  )

  const renderCategory = () => (
    <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
      <button onClick={() => setCurrentStep('entry')} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground mb-12 transition-all hover:-translate-x-1">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="mb-12">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533]">Step 01</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">Select Apparel Category</h2>
        <p className="font-sans text-base text-muted-foreground">Choose the baseline silhouette category to start customizing.</p>
      </div>

      {isLoadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[2rem] overflow-hidden border border-border/60 bg-white shadow-sm animate-pulse">
              <div className="aspect-[4/5] bg-gray-200" />
              <div className="p-8 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => {
            const count = products.filter(p => p.category_id === category.id).length
            const isEmpty = count === 0

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: categories.indexOf(category) * 0.1 }}>
              <div
                onClick={() => {
                  if (isEmpty) return
                  setSelectedCategoryId(category.id)
                  setCurrentStep('product')
                }}
                className={`group relative rounded-[2rem] overflow-hidden border border-border/60 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 ${isEmpty ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                <div className="aspect-[4/5] relative bg-[#F8F8F8]">
                  {category.image ? (
                    <Image src={category.image} alt={category.name} fill className={`object-cover transition-transform duration-700 ${isEmpty ? 'grayscale opacity-70' : 'group-hover:scale-105'}`} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-bold">Category Artwork</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 flex flex-col justify-end">
                  <h3 className="font-display text-2xl font-bold mb-2">{category.name}</h3>

                  {isEmpty ? (
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit">
                      Restocking Soon
                    </span>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{count} {count === 1 ? 'Style' : 'Styles'} Available</span>
                      <span className="text-[#E8C9A0] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Explore <ArrowRight size={12} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderProduct = () => {
    const categoryProducts = products.filter(p => p.category_id === selectedCategoryId)
    const filteredProducts = genderFilter === 'all' ? categoryProducts : categoryProducts.filter((p: any) => p.gender === genderFilter || p.gender === 'unisex' || !p.gender)

    return (
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <button onClick={() => setCurrentStep('category')} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground mb-12 transition-all hover:-translate-x-1">
          <ArrowLeft size={14} /> Back to Categories
        </button>

        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533]">Step 02</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2">Choose Canvas Garment</h2>
            <p className="font-sans text-base text-muted-foreground">Select a high-density print canvas frame from {selectedCategory?.name || 'Collection'}.</p>
          </div>

          <div className="flex flex-wrap gap-2 p-1.5 bg-card rounded-full border border-border shadow-2xs w-fit">
            {['all', 'men', 'women', 'kids'].map(g => (
              <button
                key={g}
                onClick={() => setGenderFilter(g as any)}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                  genderFilter === g
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center border border-border/80 rounded-[2.5rem] bg-card/50">
            <p className="font-display text-2xl font-bold text-foreground mb-2">No items found</p>
            <p className="text-muted-foreground text-sm">We are currently restocking this category. Try switching filters or categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p: any) => {
              const sku = p.id
              const name = p.name
              const image = p.images?.[0]
              const basePrice = p.selling_price || p.base_price || 0
              const printPositions = PRINT_POSITIONS
              return (
                <div
                  key={sku}
                  onClick={() => {
                    setSelectedProductSku(sku)
                    setConfig(prev => ({ ...prev, printPosition: printPositions[0], selectedColors: ['White'], sizes: { M: 1 } }))
                    setCurrentStep('design')
                  }}
                  className="group relative border border-border/80 bg-white rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-[#C87533]/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 p-4 flex flex-col justify-between"
                >
                  <div className="aspect-[4/5] relative bg-[#F8F8F8] rounded-[2rem] overflow-hidden flex items-center justify-center p-6 mb-4">
                    {image ? (
                      <Image src={image} alt={name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <span className="font-display font-bold text-muted-foreground text-2xl">{sku}</span>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                      <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs border border-border/50">
                        {(p as any).material || '240 GSM Combed Cotton'}
                      </span>
                      <span className="bg-[#C87533]/10 text-[#C87533] border border-[#C87533]/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit">
                        DTG • DTF • Embroidery
                      </span>
                    </div>
                  </div>

                  <div className="px-2 pb-2">
                    <h3 className="font-display text-xl font-bold text-foreground leading-snug mb-1">{name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{(p as any).short_description || 'Pre-shrunk Heavyweight Streetwear Fit'}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-bold">Base Price</span>
                        <span className="text-lg font-bold font-sans text-[#1A1A1A]">₹{basePrice}</span>
                      </div>

                      <button className="px-5 py-2.5 bg-[#C87533] hover:bg-[#A65E28] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm">
                        Customize <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderDesign = () => {
    if (!selectedProduct) return null

    const activeImageUrl = (designState as any)[`${activeTab}Url`]
    const activeDpiInfo = dpiMap[activeTab]
    const isSnapX = Math.abs(activeTransform.xOffset) < 6
    const isSnapY = Math.abs(activeTransform.yOffset) < 6
    const mockupImage = getMockupImage()

    const filteredTemplates = TEMPLATES.filter(t =>
      activeTemplateCategory === 'All' || t.category === activeTemplateCategory
    ).filter(t =>
      searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const renderAssetGrid = (assets: { id: string; name: string; icon: string; url: string }[]) => (
      <div className="grid grid-cols-4 gap-2">
        {assets.map(asset => (
          <button
            key={asset.id}
            onClick={() => handleApplyAsset(asset)}
            className="aspect-square rounded-xl border border-border bg-[#FAF7F4] hover:border-[#C87533] transition-all flex items-center justify-center text-2xl cursor-pointer hover:scale-105 active:scale-95"
            title={asset.name}
          >
            {asset.icon}
          </button>
        ))}
      </div>
    )

    return (
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-4 md:py-8 relative z-10 select-none">

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentStep('product')} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all hover:-translate-x-1">
            <ArrowLeft size={14} /> Change Canvas
          </button>

          <div className="flex items-center gap-2 bg-white border border-border rounded-full p-1.5 shadow-2xs">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-full hover:bg-secondary text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-full hover:bg-secondary text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
            <div className="h-4 w-[1px] bg-border" />
            <button
              onClick={() => updateActiveTransform(t => ({ ...t, xOffset: 0, yOffset: 0 }))}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Snap Center
            </button>
            <div className="h-4 w-[1px] bg-border" />
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-full hover:bg-secondary text-foreground transition-all"
              title="History Timeline"
            >
              <History size={16} />
            </button>
            <div className="h-4 w-[1px] bg-border" />
            <button
              onClick={handleSaveDesign}
              className="p-2 rounded-full hover:bg-secondary text-foreground transition-all cursor-pointer"
              title="Save Design"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleExportDesign}
              className="p-2 rounded-full hover:bg-secondary text-foreground transition-all cursor-pointer"
              title="Export Design"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOverCanvas(true) }}
              onDragLeave={() => setIsDragOverCanvas(false)}
              onDrop={handleCanvasDrop}
              className={`relative w-full aspect-[4/5] bg-[#FAF7F4] rounded-[2.5rem] overflow-hidden border-2 transition-all duration-300 shadow-md flex items-center justify-center group ${
                isDragOverCanvas ? 'border-[#C87533] ring-4 ring-[#C87533]/20 bg-[#C87533]/5' : 'border-border/80'
              }`}
              style={{ backgroundColor: !mockupImage && config.productBaseColor ? config.productBaseColor.toLowerCase() : '' }}
            >

              {isDragOverCanvas && (
                <div className="absolute inset-0 bg-[#C87533]/10 backdrop-blur-xs z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-[#C87533] flex items-center gap-3 text-sm font-bold text-[#C87533]">
                    <Upload size={20} className="animate-bounce" /> Drop File Here to Apply Artwork
                  </div>
                </div>
              )}

              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                <span className="bg-white/90 backdrop-blur-md border border-border/60 px-4 py-1.5 rounded-full text-xs font-bold text-[#1A1A1A] shadow-2xs">
                  {selectedProduct.name}
                </span>
                <span className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit shadow-2xs">
                  {activeTab.replace('_', ' ')} Print Zone
                </span>
              </div>

              {activeImageUrl && (
                <div className="absolute top-6 right-6 z-20">
                  <div className={`px-4 py-2 rounded-full backdrop-blur-md border shadow-2xs flex items-center gap-2 text-xs font-bold ${
                    activeDpiInfo?.status === 'low'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-700'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                  }`}>
                    {activeDpiInfo?.status === 'low' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                    <span>
                      {activeDpiInfo?.status === 'low'
                        ? 'Low Res Warning (<150 DPI)'
                        : `${activeDpiInfo?.dpi || 300} DPI • Print Ready`}
                    </span>
                  </div>
                </div>
              )}

              {mockupImage ? (
                <Image src={mockupImage} alt={selectedProduct.name} fill className="object-cover pointer-events-none transition-transform duration-700" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
              )}

              <div className="absolute w-[52%] h-[62%] border-2 border-dashed border-[#C87533]/40 rounded-2xl pointer-events-none flex items-center justify-center">

                {/* Empty state prompt when no artwork */}
                {!activeImageUrl && (designState.textLayers[activeTab] || []).length === 0 && (
                  <div className="flex flex-col items-center gap-2 text-center pointer-events-none opacity-60">
                    <Upload size={28} className="text-[#C87533]/50" />
                    <span className="text-[11px] font-bold text-neutral-400 max-w-[160px] leading-snug">Upload artwork or generate with AI to begin designing</span>
                  </div>
                )}

                <AnimatePresence>
                  {isSnapX && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-[#C87533] -translate-x-1/2 pointer-events-none z-30 shadow-[0_0_8px_#C87533]"
                    />
                  )}
                  {isSnapY && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-[#C87533] -translate-y-1/2 pointer-events-none z-30 shadow-[0_0_8px_#C87533]"
                    />
                  )}
                </AnimatePresence>

                {activeImageUrl && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    onDrag={(e, info) => {
                      updateActiveTransform(prev => {
                        let newX = prev.xOffset + info.delta.x
                        let newY = prev.yOffset + info.delta.y
                        if (Math.abs(newX) < 6) newX = 0
                        if (Math.abs(newY) < 6) newY = 0
                        return { ...prev, xOffset: newX, yOffset: newY }
                      })
                    }}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-30 flex items-center justify-center group/art"
                    style={{
                      x: activeTransform.xOffset,
                      y: activeTransform.yOffset,
                      scale: activeTransform.scale / 100,
                      rotate: activeTransform.rotation || 0,
                      scaleX: activeTransform.isFlippedH ? -1 : 1,
                    }}
                  >
                    <div className="relative w-full h-full p-2 border-2 border-[#C87533] border-dashed rounded-xl group-hover/art:border-solid transition-all">
                      <img
                        src={activeImageUrl}
                        alt="Custom Artwork"
                        className="w-full h-full object-contain filter drop-shadow-md pointer-events-none"
                        draggable={false}
                      />

                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#C87533] rounded-full shadow-xs" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#C87533] rounded-full shadow-xs" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#C87533] rounded-full shadow-xs" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#C87533] rounded-full shadow-xs" />

                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          updateActiveTransform(p => ({ ...p, rotation: ((p.rotation || 0) + 90) % 360 }))
                        }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#C87533] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                        title="Rotate 90 degrees"
                      >
                        <RotateCw size={12} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {(designState.textLayers[activeTab] || []).map(layer => (
                  <motion.div
                    key={layer.id}
                    drag
                    dragMomentum={false}
                    onDrag={(e, info) => {
                      updateDesignState(prev => ({
                        ...prev,
                        textLayers: {
                          ...prev.textLayers,
                          [activeTab]: (prev.textLayers[activeTab] || []).map(l =>
                            l.id === layer.id
                              ? { ...l, x: l.x + info.delta.x, y: l.y + info.delta.y }
                              : l
                          ),
                        },
                      }))
                    }}
                    className="absolute z-30 cursor-grab active:cursor-grabbing"
                    style={{
                      left: '50%',
                      top: '50%',
                      x: layer.x,
                      y: layer.y,
                      scale: layer.scale / 100,
                      rotate: layer.rotation,
                    }}
                    onClick={() => setSelectedTextLayerId(layer.id)}
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(layer.id, e.target.textContent || '')}
                      className="font-bold outline-none select-text"
                      style={{
                        fontSize: `${layer.fontSize}px`,
                        fontFamily: layer.fontFamily,
                        color: layer.color,
                        minWidth: '100px',
                        textAlign: 'center',
                      }}
                    >
                      {layer.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {activeImageUrl && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-3 text-xs font-bold text-[#1A1A1A]">
                  <button
                    onClick={() => updateActiveTransform(p => ({ ...p, rotation: ((p.rotation || 0) + 90) % 360 }))}
                    className="flex items-center gap-1 hover:text-[#C87533] transition-colors p-1 cursor-pointer"
                    title="Rotate 90°"
                  >
                    <RotateCw size={14} /> Rotate
                  </button>
                  <div className="h-3 w-[1px] bg-border" />
                  <button
                    onClick={() => updateActiveTransform(p => ({ ...p, isFlippedH: !p.isFlippedH }))}
                    className="flex items-center gap-1 hover:text-[#C87533] transition-colors p-1 cursor-pointer"
                    title="Flip Horizontally"
                  >
                    <FlipHorizontal size={14} /> Flip
                  </button>
                  <div className="h-3 w-[1px] bg-border" />
                  <button
                    onClick={() => updateActiveTransform(p => ({ ...p, scale: 100, xOffset: 0, yOffset: 0, rotation: 0, isFlippedH: false }))}
                    className="flex items-center gap-1 hover:text-[#C87533] transition-colors p-1 cursor-pointer"
                    title="Reset All Transforms"
                  >
                    Reset
                  </button>
                  <div className="h-3 w-[1px] bg-border" />
                  <button
                    onClick={() => updateDesignState(p => {
                      const newP = { ...p } as typeof p
                      delete newP[`${activeTab}Url` as keyof typeof p]
                      return newP
                    })}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors p-1 cursor-pointer"
                    title="Remove Artwork"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="lg:col-span-5 space-y-8 pb-24">

            <div className="bg-white border border-border rounded-3xl p-6 shadow-2xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">1. Print Location</span>

              <div className="grid grid-cols-5 gap-2">
                {selectedProduct.printPositions.map(pos => {
                  const isActive = activeTab === pos
                  return (
                    <button
                      key={pos}
                      onClick={() => {
                        setActiveTab(pos)
                        setConfig(prev => ({ ...prev, printPosition: pos }))
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#C87533] bg-[#C87533]/5 text-[#C87533] shadow-2xs font-bold scale-[1.02]'
                          : 'border-border/60 hover:border-border text-muted-foreground hover:text-foreground bg-[#FAF7F4]'
                      }`}
                    >
                      {renderPositionIcon(pos, isActive)}
                      <span className="text-[9px] font-bold uppercase tracking-wider capitalize mt-1.5 truncate max-w-full">
                        {pos.replace('_', ' ')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border border-border rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">2. Add Artwork</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setActiveTool('upload'); setShowTemplates(false); setShowAssets(false); setShowAIGenerate(false) }}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === 'upload' ? 'bg-[#C87533] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => { setActiveTool('ai'); setShowAIGenerate(true); setShowTemplates(false); setShowAssets(false); setShowSloganGenerator(false) }}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === 'ai' ? 'bg-[#C87533] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    AI Generate
                  </button>
                  <button
                    onClick={() => { setActiveTool('templates'); setShowTemplates(true); setShowAssets(false); setShowAIGenerate(false) }}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === 'templates' ? 'bg-[#C87533] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Templates
                  </button>
                  <button
                    onClick={() => { setActiveTool('assets'); setShowAssets(true); setShowTemplates(false); setShowAIGenerate(false) }}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === 'assets' ? 'bg-[#C87533] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Assets
                  </button>
                </div>
              </div>

              <div className="relative border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:border-[#C87533] transition-all bg-[#FAF7F4] group">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  ref={fileInputRef}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-6 h-6 text-[#C87533] animate-spin" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inspecting Asset...</span>
                  </div>
                ) : activeImageUrl ? (
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-white shrink-0 p-1">
                      <img src={activeImageUrl} alt="Artwork preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#1A1A1A] block truncate">Artwork Uploaded</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {activeDpiInfo?.dimensions || 'Transparent Layer'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateDesignState(prev => { const newP = { ...prev } as typeof prev; delete newP[`${activeTab}Url` as keyof typeof prev]; return newP }) }}
                      className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors z-20 cursor-pointer"
                      title="Remove artwork"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 pointer-events-none py-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-[#C87533] shadow-2xs group-hover:scale-110 transition-transform">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">Click or Drag File to Upload</span>
                    <span className="text-[10px] text-muted-foreground">Vector SVG or 300+ DPI Transparent PNG recommended</span>
                  </div>
                )}
              </div>

              {activeImageUrl && (
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] mb-1.5">
                      <span>Scale Size</span>
                      <span className="font-mono text-muted-foreground">{activeTransform.scale}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      value={activeTransform.scale}
                      onChange={e => updateActiveTransform(p => ({ ...p, scale: Number(e.target.value) }))}
                      className="w-full accent-[#C87533] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">Text Layers</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSloganGenerator(true)}
                    className="p-1.5 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer flex items-center gap-1"
                    title="Generate slogan ideas"
                  >
                    <Sparkle size={12} /> Slogans
                  </button>
                  <button
                    onClick={handleAddTextLayer}
                    className="p-1.5 rounded-lg bg-[#C87533] text-white text-[10px] font-bold hover:bg-[#A65E28] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Type size={12} /> Add
                  </button>
                </div>
              </div>

              {(designState.textLayers[activeTab] || []).length === 0 ? (
                <div className="text-center py-6 bg-[#FAF7F4] rounded-2xl border border-dashed border-border/60">
                  <Type size={20} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No text layers on {activeTab.replace('_', ' ')} position</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button onClick={handleAddTextLayer} className="px-4 py-2 bg-[#C87533] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-[#A65E28] transition-all cursor-pointer">
                      Add Text Layer
                    </button>
                    <button onClick={() => setShowSloganGenerator(true)} className="px-4 py-2 bg-secondary border border-border rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                      Generate Slogans
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(designState.textLayers[activeTab] || []).map(layer => (
                    <div
                      key={layer.id}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedTextLayerId === layer.id ? 'border-[#C87533] bg-[#C87533]/5' : 'border-border/60 bg-[#FAF7F4] hover:border-border'}`}
                      onClick={() => setSelectedTextLayerId(layer.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#1A1A1A] truncate max-w-[120px]">{layer.text}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateDesignState(prev => ({
                              ...prev,
                              textLayers: {
                                ...prev.textLayers,
                                [activeTab]: (prev.textLayers[activeTab] || []).filter(l => l.id !== layer.id),
                              },
                            }))
                          }}
                          className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {selectedTextLayerId === layer.id && (
                        <div className="space-y-2 pt-2 border-t border-border/40">
                          <div className="flex gap-2">
                            <select
                              value={layer.fontFamily}
                              onChange={e => handleTextPropertyChange(layer.id, 'fontFamily', e.target.value)}
                              className="flex-1 bg-white border border-border rounded-lg px-2 py-1 text-[10px] font-semibold focus:outline-none focus:border-[#C87533] cursor-pointer"
                            >
                              {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <input
                              type="number"
                              value={layer.fontSize}
                              onChange={e => handleTextPropertyChange(layer.id, 'fontSize', Number(e.target.value))}
                              className="w-16 bg-white border border-border rounded-lg px-2 py-1 text-[10px] font-semibold text-center focus:outline-none focus:border-[#C87533]"
                              min={8}
                              max={200}
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={layer.color}
                              onChange={e => handleTextPropertyChange(layer.id, 'color', e.target.value)}
                              className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                            />
                            <input
                              type="range"
                              min={30}
                              max={200}
                              value={layer.scale}
                              onChange={e => handleTextPropertyChange(layer.id, 'scale', Number(e.target.value))}
                              className="flex-1 accent-[#C87533] cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{layer.scale}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-3xl p-6 shadow-2xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">3. Garment Color</span>
              <div className="flex flex-wrap gap-4">
                {selectedProduct.availableColors.map(color => {
                  const isSelected = config.selectedColors.includes(color)
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          selectedColors: isSelected ? prev.selectedColors.filter(c => c !== color) : [...prev.selectedColors, color],
                          productBaseColor: color,
                        }))
                      }}
                      className="flex flex-col items-center gap-1.5 cursor-pointer outline-none group"
                    >
                      <div className={`w-10 h-10 rounded-full p-0.5 transition-all ${isSelected ? 'ring-2 ring-[#C87533] ring-offset-2 scale-110' : 'hover:scale-105 border border-black/10'}`}>
                        <div className="w-full h-full rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color.toLowerCase() }} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#1A1A1A]' : 'text-muted-foreground'}`}>{color}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border border-border rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">4. Sizes & Quantities</span>
                <button onClick={() => setShowSizeGuide(true)} className="text-[10px] font-bold text-[#C87533] hover:underline flex items-center gap-1 cursor-pointer">
                  <Ruler size={12} /> Size Guide
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {selectedProduct.availableSizes.map(size => {
                  const isSelected = config.sizes[size] !== undefined
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setConfig(prev => {
                          const newSizes = { ...prev.sizes }
                          if (isSelected) delete newSizes[size]
                          else newSizes[size] = 1
                          return { ...prev, sizes: newSizes }
                        })
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-2xs'
                          : 'bg-[#FAF7F4] border-border text-muted-foreground hover:border-[#C87533]'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>

              {Object.keys(config.sizes).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  {Object.entries(config.sizes).map(([size, qty]) => (
                    <div key={size} className="flex items-center justify-between p-3 bg-[#FAF7F4] rounded-xl border border-border/50 text-xs">
                      <span className="font-bold text-[#1A1A1A]">Size {size}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setConfig(p => ({ ...p, sizes: { ...p.sizes, [size]: Math.max(1, qty - 1) } }))} className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center font-bold text-[#1A1A1A] hover:bg-secondary cursor-pointer">-</button>
                        <span className="font-bold w-4 text-center tabular-nums">{qty}</span>
                        <button onClick={() => setConfig(p => ({ ...p, sizes: { ...p.sizes, [size]: qty + 1 } }))} className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center font-bold text-[#1A1A1A] hover:bg-secondary cursor-pointer">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-3xl p-6 shadow-2xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">5. Print Finish Method</span>

              <div className="space-y-3">
                {selectedProduct.printingTypes.map(type => (
                  <label key={type} className={`block p-4 rounded-2xl border cursor-pointer transition-all ${config.printingType === type ? 'border-[#C87533] bg-[#C87533]/5 shadow-2xs' : 'border-border/60 bg-[#FAF7F4] hover:border-border'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="printType" checked={config.printingType === type} onChange={() => setConfig(prev => ({ ...prev, printingType: type }))} className="accent-[#C87533]" />
                        <span className="font-bold text-sm text-[#1A1A1A]">{type} Finish</span>
                      </div>
                      {type !== 'DTG' && <span className="text-[10px] font-black uppercase tracking-wider text-[#C87533] bg-[#C87533]/10 px-2 py-0.5 rounded-md">+₹{type === 'Embroidery' ? '350' : '250'}/unit</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2DB] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Transparent Cost Breakdown</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Live Total</span>
              </div>

              <div className="space-y-2 text-xs text-neutral-600 font-medium">
                <div className="flex justify-between">
                  <span>Base Canvas Garment</span>
                  <span className="font-bold text-[#1A1A1A]">₹{basePricePerItem}</span>
                </div>
                {finishSurcharge > 0 && (
                  <div className="flex justify-between text-[#C87533]">
                    <span>{config.printingType} Finish Upgrade</span>
                    <span className="font-bold">+₹{finishSurcharge}</span>
                  </div>
                )}
                {extraPositionsSurcharge > 0 && (
                  <div className="flex justify-between text-[#C87533]">
                    <span>Extra Print Positions ({activePositionCount - 1})</span>
                    <span className="font-bold">+₹{extraPositionsSurcharge}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#E8E2DB] pt-2 font-bold text-[#1A1A1A]">
                  <span>Unit Price</span>
                  <span className="text-sm font-sans font-black">₹{finalPricePerItem}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2DB] flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest block">Grand Total ({totalQuantity} Units)</span>
                  <span className="text-3xl font-sans font-black text-[#1A1A1A] tabular-nums">₹{grandTotal}</span>
                </div>

                <button
                  onClick={() => setCurrentStep('review')}
                  disabled={totalQuantity === 0 || config.selectedColors.length === 0 || (!designState.frontUrl && !designState.backUrl && !designState.leftPocketUrl)}
                  className="px-6 py-3.5 bg-[#C87533] hover:bg-[#A65E28] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Order</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Total ({totalQuantity} items)</span>
            <span className="text-xl font-black text-[#1A1A1A]">₹{grandTotal}</span>
          </div>

          <button
            onClick={() => setCurrentStep('review')}
            disabled={totalQuantity === 0 || config.selectedColors.length === 0 || (!designState.frontUrl && !designState.backUrl && !designState.leftPocketUrl)}
            className="px-6 py-3 bg-[#C87533] text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-40 flex items-center gap-2"
          >
            <span>Proceed to Review</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <AnimatePresence>
          {showSizeGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowSizeGuide(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowSizeGuide(false) }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Ruler size={18} className="text-[#C87533]" />
                    <h3 className="font-display text-xl font-bold text-[#1A1A1A]">Garment Size Guide</h3>
                  </div>
                  <button onClick={() => setShowSizeGuide(false)} className="p-1 rounded-full hover:bg-secondary text-neutral-500 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-4">Measurements in inches. Regular streetwear fit. Pre-shrunk 100% combed cotton.</p>

                <div className="border border-border/60 rounded-2xl overflow-hidden mb-6 text-xs">
                  <div className="grid grid-cols-4 bg-[#FAF7F4] p-3 font-bold text-[#1A1A1A] border-b border-border/60">
                    <span>Size</span>
                    <span>Chest</span>
                    <span>Length</span>
                    <span>Shoulder</span>
                  </div>
                  {SIZE_GUIDE_DATA.map((row) => (
                    <div key={row.size} className="grid grid-cols-4 p-3 border-b border-border/40 font-medium text-neutral-600 last:border-0">
                      <span className="font-bold text-[#1A1A1A]">{row.size}</span>
                      <span>{row.chest}</span>
                      <span>{row.length}</span>
                      <span>{row.shoulder}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black cursor-pointer"
                >
                  Got It
                </button>
              </motion.div>
            </div>
          )}

          {showAIGenerate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowAIGenerate(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowAIGenerate(false) }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Wand2 size={20} className="text-[#C87533]" />
                    <h3 className="font-display text-xl font-bold text-[#1A1A1A]">AI Design Generator</h3>
                  </div>
                  <button onClick={() => setShowAIGenerate(false)} className="p-1 rounded-full hover:bg-secondary text-neutral-500 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-4">Describe the design you want. Vector SVG generates crisp scalable graphics. Image mode generates photo-realistic artwork.</p>

                <div className="flex gap-2 mb-4 p-1 bg-[#FAF7F4] rounded-xl border border-border w-fit">
                  <button
                    onClick={() => setAiGenerationMode('svg')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${aiGenerationMode === 'svg' ? 'bg-white text-[#1A1A1A] shadow-xs border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Vector SVG
                  </button>
                  <button
                    onClick={() => setAiGenerationMode('image')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${aiGenerationMode === 'image' ? 'bg-white text-[#1A1A1A] shadow-xs border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Image
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">Design Prompt</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={aiGenerationMode === 'svg' ? "e.g., 'Minimalist geometric pattern with circles and lines, orange and black, streetwear style'" : "e.g., 'Abstract geometric pattern with orange and black, minimalist streetwear style'"}
                      className="w-full px-4 py-3 bg-[#FAF7F4] border border-border rounded-xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#C87533] resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAIGenerate(false)}
                      className="flex-1 py-3 bg-secondary border border-border text-[#1A1A1A] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-border cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAIGenerate}
                      disabled={isAIGenerating || !aiPrompt.trim()}
                      className="flex-1 py-3 bg-[#C87533] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A65E28] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAIGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                      {isAIGenerating ? 'Generating...' : `Generate ${aiGenerationMode === 'svg' ? 'SVG' : 'Image'}`}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {showTemplates && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowTemplates(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowTemplates(false) }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Grid3X3 size={20} className="text-[#C87533]" />
                    <h3 className="font-display text-xl font-bold text-[#1A1A1A]">Design Templates</h3>
                  </div>
                  <button onClick={() => setShowTemplates(false)} className="p-1 rounded-full hover:bg-secondary text-neutral-500 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setActiveTemplateCategory('All')}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTemplateCategory === 'All' ? 'bg-[#C87533] text-white' : 'bg-[#FAF7F4] text-muted-foreground hover:text-foreground'}`}
                    >
                      All
                    </button>
                    {TEMPLATE_CATEGORIES.slice(1).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveTemplateCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTemplateCategory === cat ? 'bg-[#C87533] text-white' : 'bg-[#FAF7F4] text-muted-foreground hover:text-foreground'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F4] border border-border rounded-xl text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#C87533]"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}
                        className="group relative rounded-2xl overflow-hidden border border-border/60 bg-[#FAF7F4] hover:border-[#C87533] transition-all cursor-pointer hover:shadow-xl"
                      >
                        <div className="aspect-square relative">
                          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          {template.isPremium && (
                            <div className="absolute top-2 right-2 bg-[#C87533] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                              PRO
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <span className="text-xs font-bold text-[#1A1A1A] block">{template.name}</span>
                          <span className="text-[10px] text-muted-foreground">{template.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {showAssets && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowAssets(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowAssets(false) }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={20} className="text-[#C87533]" />
                    <h3 className="font-display text-xl font-bold text-[#1A1A1A]">Design Assets</h3>
                  </div>
                  <button onClick={() => setShowAssets(false)} className="p-1 rounded-full hover:bg-secondary text-neutral-500 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {ASSET_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveAssetCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeAssetCategory === cat ? 'bg-[#C87533] text-white' : 'bg-[#FAF7F4] text-muted-foreground hover:text-foreground'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="border border-border/60 rounded-2xl p-4 bg-[#FAF7F4]">
                    {renderAssetGrid(ASSETS[activeAssetCategory] || ASSETS['Icons'] || [])}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {showSloganGenerator && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowSloganGenerator(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowSloganGenerator(false) }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkle size={20} className="text-[#C87533]" />
                    <h3 className="font-display text-xl font-bold text-[#1A1A1A]">Slogan Generator</h3>
                  </div>
                  <button onClick={() => setShowSloganGenerator(false)} className="p-1 rounded-full hover:bg-secondary text-neutral-500 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-4">Describe a theme and generate typography slogans for your design. Click a slogan to add it as a text layer.</p>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., 'streetwear attitude', 'nature vibes', 'minimal luxury'"
                      className="flex-1 px-4 py-3 bg-[#FAF7F4] border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C87533]"
                      id="slogan-theme-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleGenerateSlogans((e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('slogan-theme-input') as HTMLInputElement
                        handleGenerateSlogans(input?.value || 'streetwear')
                      }}
                      disabled={isGeneratingSlogans}
                      className="px-6 py-3 bg-[#C87533] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A65E28] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {isGeneratingSlogans ? <Loader2 size={14} className="animate-spin" /> : <Sparkle size={14} />}
                      Generate
                    </button>
                  </div>

                  {slogans.length > 0 && (
                    <div className="border-t border-border/40 pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Generated Slogans</p>
                      <div className="space-y-2">
                        {slogans.map((slogan, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleApplySlogan(slogan.text)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-[#FAF7F4] hover:border-[#C87533] hover:bg-[#C87533]/5 transition-all text-left cursor-pointer group"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold text-[#1A1A1A] block truncate">{slogan.text}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{slogan.style}</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#C87533] opacity-0 group-hover:opacity-100 transition-opacity ml-3 shrink-0">
                              Add to Design →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {showHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowHistory(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowHistory(false) }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <History size={20} className="text-[#C87533]" />
                    <h3 className="font-display text-xl font-bold text-[#1A1A1A]">Design History</h3>
                  </div>
                  <button onClick={() => setShowHistory(false)} className="p-1 rounded-full hover:bg-secondary text-neutral-500 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  {history.map((snapshot, idx) => (
                    <button
                      key={snapshot.id}
                      onClick={() => {
                        setHistoryIndex(idx)
                        setDesignState(snapshot.state)
                        setShowHistory(false)
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${idx === historyIndex ? 'bg-[#C87533]/5 border border-[#C87533]' : 'bg-[#FAF7F4] hover:bg-secondary border border-transparent'}`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#E8E2DB] flex-shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#1A1A1A] block">
                          {new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {snapshot.state.frontUrl ? 'Front design' : 'No design'}
                        </span>
                      </div>
                      {idx === historyIndex && (
                        <Check size={16} className="text-[#C87533] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const renderReview = () => {
    if (!selectedProduct) return null

    return (
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533]">Final Approval</span>
            <h2 className="font-display text-4xl font-bold text-foreground tracking-tight">Review & Finalize Build</h2>
          </div>
          <button onClick={() => setCurrentStep('design')} className="px-5 py-2.5 rounded-full border border-border text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors cursor-pointer">
            Modify Design
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRINT_POSITIONS.map(pos => {
                const url = (designState as any)[`${pos}Url`]
                if (!url) return null

                const posName = pos.replace('_', ' ')
                const transform = designState.transforms[pos] || DEFAULT_TRANSFORM

                let mockupImg = selectedProduct?.image || null
                const color = (config.productBaseColor || 'white').toLowerCase()
                const posKey = pos === 'left_pocket' ? 'front' : pos
                if (selectedProduct?.sku === 'US21') {
                  if (color === 'black' && posKey === 'front') mockupImg = '/images/mockups/US21-black-front.png'
                  if (color === 'black' && posKey === 'back') mockupImg = '/images/mockups/US21-black-back.png'
                  if (color === 'white' && posKey === 'front') mockupImg = '/images/mockups/US21-white-front.png'
                  if (color === 'white' && posKey === 'back') mockupImg = '/images/mockups/US21-white-back.png'
                }
                if (selectedProduct?.sku === 'UC22') {
                  if (color === 'white' && posKey === 'front') mockupImg = '/images/mockups/UC22-white-front.jpg'
                  if (color === 'white' && posKey === 'back') mockupImg = '/images/mockups/UC22-white-back.jpg'
                }

                return (
                  <div key={pos} className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C87533] block">
                      {posName} Print
                    </span>

                    <div className="relative aspect-[4/5] bg-[#FAF7F4] rounded-3xl overflow-hidden border border-border/80 shadow-sm"
                         style={{ backgroundColor: !mockupImg && config.productBaseColor ? config.productBaseColor.toLowerCase() : '' }}>
                      {mockupImg ? (
                        <Image src={mockupImg} alt={`${posName} mockup`} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
                      )}

                      <div className="absolute w-[50%] h-[60%] pointer-events-none flex flex-col items-center justify-start pt-8" style={{ top: '0', left: '25%' }}>
                        <div
                          className="relative w-full h-full"
                          style={{
                            transform: `translate(${transform.xOffset}px, ${transform.yOffset}px) scale(${transform.scale / 100}) rotate(${transform.rotation || 0}deg) scaleX(${transform.isFlippedH ? -1 : 1})`,
                          }}
                        >
                          <img src={url} alt={`${posName} artwork`} className="w-full h-full object-contain filter drop-shadow-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-[#FAF7F4] border border-[#E8E2DB] rounded-3xl p-6 flex items-center gap-4">
              <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-[#1A1A1A]">100% Quality & Print Fidelity Guarantee</h3>
                <p className="text-[11px] text-neutral-600 mt-0.5">Our print technicians verify resolution and alignment before printing.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-border rounded-3xl p-8 shadow-md space-y-6">
              <div className="border-b border-border/50 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C87533] block mb-1">Order Summary</span>
                <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">{selectedProduct?.name}</h3>
              </div>

              <div className="space-y-3 text-xs text-neutral-600 font-medium">
                <div className="flex justify-between">
                  <span>Colorway</span>
                  <span className="font-bold text-[#1A1A1A]">{config.productBaseColor || 'White'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Print Finish</span>
                  <span className="font-bold text-[#1A1A1A]">{config.printingType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size Breakdown</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {Object.entries(config.sizes).filter(([_, q]) => q > 0).map(([s, q]) => `${s}(${q})`).join(', ')}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#C87533]" /> Shipping Address
                  </span>
                  {addresses.length > 0 && !showAddressForm && (
                    <button onClick={() => setShowAddressForm(true)} className="text-[10px] font-bold uppercase tracking-widest text-[#C87533] hover:underline cursor-pointer">
                      + Add New
                    </button>
                  )}
                </div>

                {showAddressForm || addresses.length === 0 ? (
                  <div className="bg-[#FAF7F4] border border-border rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">New Shipping Address</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Full Name*" value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} className="col-span-2 bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C87533]" />
                      <input type="tel" placeholder="Phone Number*" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="col-span-2 bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C87533]" />
                      <input type="text" placeholder="Address Line 1*" value={newAddress.address_line1} onChange={e => setNewAddress({...newAddress, address_line1: e.target.value})} className="col-span-2 bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C87533]" />
                      <input type="text" placeholder="City*" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C87533]" />
                      <input type="text" placeholder="State*" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C87533]" />
                      <input type="text" placeholder="PIN Code*" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="col-span-2 bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C87533]" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      {addresses.length > 0 && (
                        <button onClick={() => setShowAddressForm(false)} className="flex-1 py-2 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer">
                          Cancel
                        </button>
                      )}
                      <button onClick={handleAddAddress} disabled={isProcessing} className="flex-1 py-2 rounded-xl bg-[#C87533] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#A65E28] disabled:opacity-50 cursor-pointer">
                        {isProcessing ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full bg-[#FAF7F4] border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#C87533] cursor-pointer"
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.full_name} - {addr.city}, {addr.state} {addr.pincode}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Special Instructions Field */}
              <div className="border-t border-border/50 pt-4 space-y-2">
                <label className="text-xs font-bold text-[#1A1A1A] block">Special Instructions / Notes</label>
                <textarea
                  value={config.specialInstructions}
                  onChange={(e) => setConfig(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="e.g. Center alignment preferred, specific placement notes, gift packaging request..."
                  rows={2}
                  className="w-full bg-[#FAF7F4] border border-border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#C87533] resize-none"
                />
              </div>

              <div className="border-t border-border/50 pt-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest block">Total Payable</span>
                  <motion.span key={grandTotal} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-3xl font-sans font-black text-[#1A1A1A] tabular-nums block">₹{grandTotal}</motion.span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportDesign}
                    className="p-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                    title="Export Design"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={handleShareDesign}
                    className="p-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                    title="Share Design"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    onClick={handleSaveDesign}
                    className="p-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                    title="Save Design"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-[#C87533] hover:bg-[#A65E28] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Order & Pay'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] pb-24 relative overflow-hidden">
      {currentStep !== 'entry' && renderStepProgressBar()}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="relative z-10"
        >
          {currentStep === 'entry' && renderEntry()}
          {currentStep === 'category' && renderCategory()}
          {currentStep === 'product' && renderProduct()}
          {currentStep === 'design' && renderDesign()}
          {currentStep === 'review' && renderReview()}
        </motion.div>
      </AnimatePresence>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#F5F1EC',
            border: '1px solid #333',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#2D7D46',
              secondary: '#1A1A1A',
            },
          },
          error: {
            iconTheme: {
              primary: '#C53030',
              secondary: '#1A1A1A',
            },
          },
        }}
      />
    </div>
  )
}