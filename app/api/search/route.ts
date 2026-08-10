import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Static index of website pages, sections, and quick actions
const WEBSITE_PAGES = [
  {
    id: 'page-shop',
    title: 'Shop Catalog',
    description: 'Explore full apparel catalog, graphics, and collection items',
    href: '/shop',
    category: 'Pages',
    icon: 'ShoppingBag',
    keywords: ['shop', 'store', 'catalog', 'buy', 'clothes', 'apparel', 'tshirt', 'hoodie', 'products']
  },
  {
    id: 'page-style-match',
    title: 'Style Match AI',
    description: 'Personalized AI style finder & apparel recommendation engine',
    href: '/style-match',
    category: 'Pages',
    icon: 'Sparkles',
    keywords: ['style match', 'ai', 'dna', 'design dna', 'recommendations', 'curator', 'personality', 'taste']
  },
  {
    id: 'page-create',
    title: 'Custom Design Studio',
    description: 'Create custom t-shirts & hoodies with your own artwork or text',
    href: '/create',
    category: 'Pages',
    icon: 'Palette',
    keywords: ['create', 'design', 'custom', 'studio', 'pod', 'customize', 'print', 'artwork', 'editor']
  },
  {
    id: 'page-track',
    title: 'Track Order',
    description: 'Check status & tracking details of your active Alpona order',
    href: '/track',
    category: 'Pages',
    icon: 'PackageCheck',
    keywords: ['track', 'order', 'status', 'shipment', 'delivery', 'tracking', 'where is my order']
  },
  {
    id: 'page-wishlist',
    title: 'Wishlist & Favorites',
    description: 'View your saved favorite apparel items and curated products',
    href: '/wishlist',
    category: 'Pages',
    icon: 'Heart',
    keywords: ['wishlist', 'favorite', 'saved', 'likes', 'bookmarks']
  },
  {
    id: 'page-about',
    title: 'About Atelier Alpona',
    description: 'Our heritage, craftsmanship, and Bengali typography studio story',
    href: '/about',
    category: 'Pages',
    icon: 'Info',
    keywords: ['about', 'story', 'brand', 'heritage', 'bengali', 'atelier', 'who we are']
  },
  {
    id: 'page-contact',
    title: 'Contact & Support',
    description: 'Get in touch with customer support or send us a message',
    href: '/contact',
    category: 'Pages',
    icon: 'MessageSquare',
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'customer service', 'chat']
  },
  {
    id: 'page-faq',
    title: 'FAQ & Shipping Policy',
    description: 'Frequently asked questions, shipping times, and return policies',
    href: '/faq',
    category: 'Pages',
    icon: 'HelpCircle',
    keywords: ['faq', 'shipping', 'delivery', 'returns', 'exchange', 'policy', 'questions', 'refund']
  },
]

const CATEGORIES_AND_COLLECTIONS = [
  {
    id: 'cat-tshirts',
    title: 'T-Shirts Collection',
    description: 'Graphic, typography, and oversized streetwear t-shirts',
    href: '/shop?category=t-shirts',
    category: 'Categories',
    icon: 'Shirt',
    keywords: ['tshirt', 't-shirt', 'tee', 'top', 'oversized', 'bengali tee']
  },
  {
    id: 'cat-hoodies',
    title: 'Hoodies & Sweatshirts',
    description: 'Cozy heavy-cotton hoodies and embroidered sweatshirts',
    href: '/shop?category=hoodies-sweatshirts',
    category: 'Categories',
    icon: 'Flame',
    keywords: ['hoodie', 'sweatshirt', 'winter', 'jacket', 'fleece', 'warm']
  },
  {
    id: 'cat-bags',
    title: 'Tote Bags Collection',
    description: 'Eco-friendly printed canvas tote bags & accessories',
    href: '/shop?category=bags-totes',
    category: 'Categories',
    icon: 'ShoppingBag',
    keywords: ['bag', 'tote', 'canvas', 'tote bag', 'carry', 'accessories']
  },
  {
    id: 'cat-kids',
    title: 'Kids Collection',
    description: 'Soft organic cotton apparel curated for children',
    href: '/shop?category=kids-collection',
    category: 'Categories',
    icon: 'Smile',
    keywords: ['kids', 'children', 'baby', 'junior', 'small']
  },
  {
    id: 'col-newest',
    title: 'New Arrivals',
    description: 'Latest studio drops and freshly printed apparel',
    href: '/shop?sort=newest',
    category: 'Collections',
    icon: 'Sparkles',
    keywords: ['new', 'arrivals', 'latest', 'fresh', 'drop', 'recent']
  },
  {
    id: 'col-bestsellers',
    title: 'Best Sellers',
    description: 'Most popular and top-rated customer favorites',
    href: '/shop?sort=best-selling',
    category: 'Collections',
    icon: 'Star',
    keywords: ['best seller', 'bestseller', 'popular', 'top rated', 'trending']
  },
  {
    id: 'col-bangla',
    title: 'Bangla Typography',
    description: 'Artisanal Bengali script design & heritage typography',
    href: '/shop?search=Bangla',
    category: 'Collections',
    icon: 'Palette',
    keywords: ['bangla', 'bengali', 'script', 'typography', 'heritage', 'kolkata']
  },
]

const QUICK_ACTIONS = [
  {
    id: 'action-create',
    title: 'Create a Custom Design',
    description: 'Launch Design Studio to customize apparel with your text/art',
    href: '/create',
    category: 'Actions',
    icon: 'Zap',
    keywords: ['custom', 'design', 'make', 'create', 'print', 'editor']
  },
  {
    id: 'action-style',
    title: 'Recalculate Style Match AI',
    description: 'Update your category & color preferences for fresh AI picks',
    href: '/style-match',
    category: 'Actions',
    icon: 'Sparkles',
    keywords: ['ai', 'style', 'match', 'recalculate', 'recommend']
  },
  {
    id: 'action-track',
    title: 'Track an Active Order',
    description: 'Enter your order ID (e.g. ALP-102) to see shipment status',
    href: '/track',
    category: 'Actions',
    icon: 'PackageCheck',
    keywords: ['track', 'order', 'status', 'shipping']
  },
]

// In-memory LRU search cache with 60s TTL
const searchCache = new Map<string, { timestamp: number; data: any }>()
const CACHE_TTL_MS = 60 * 1000

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    if (!q) {
      return NextResponse.json({
        success: true,
        products: [],
        pages: [],
        categories: [],
        actions: []
      })
    }

    // Check cache
    const cached = searchCache.get(q)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data)
    }

    // 1. Match Static Pages
    const matchedPages = WEBSITE_PAGES.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.keywords.some(k => k.includes(q))
    )

    // 2. Match Categories & Collections
    const matchedCategories = CATEGORIES_AND_COLLECTIONS.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.keywords.some(k => k.includes(q))
    )

    // 3. Match Quick Actions
    const matchedActions = QUICK_ACTIONS.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.keywords.some(k => k.includes(q))
    )

    // 4. Query Database Products
    let matchedProducts: any[] = []
    try {
      const supabase = await createClient()
      const { data: rawProducts } = await supabase
        .from('products')
        .select(`
          id, name, slug, description, selling_price, compare_at_price, images,
          category:categories(name)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(6)

      if (rawProducts && rawProducts.length > 0) {
        matchedProducts = rawProducts.map(p => ({
          id: p.id,
          title: p.name,
          slug: p.slug,
          price: p.selling_price,
          compare_at_price: p.compare_at_price,
          category: (p.category as any)?.name || 'Apparel',
          image: p.images?.[0] || '',
          href: `/shop/${p.slug}`,
          type: 'product'
        }))
      }
    } catch (err) {
      console.warn('Supabase product query fallback:', err)
    }

    const responseData = {
      success: true,
      query: q,
      products: matchedProducts,
      pages: matchedPages,
      categories: matchedCategories,
      actions: matchedActions,
      totalMatches: matchedProducts.length + matchedPages.length + matchedCategories.length + matchedActions.length
    }

    if (searchCache.size > 200) {
      searchCache.clear()
    }
    searchCache.set(q, { timestamp: Date.now(), data: responseData })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Universal Search API Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to execute search' }, { status: 500 })
  }
}
