import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { ShopCatalog } from '@/components/shop/ShopCatalog'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_NAME, SITE_URL } from '@/constants/config'

export const revalidate = 300 // Revalidate shop page every 5 minutes

export const metadata: Metadata = {
  title: `Shop All Custom Products & Original Streetwear | ${SITE_NAME}`,
  description: 'Browse our exclusive collection of custom printed t-shirts, hoodies, sweatshirts, tote bags, and accessories. Premium quality, customizable designs, fast delivery across India.',
  keywords: ['shop custom t-shirts', 'custom apparel catalog', 'tote bags india', 'streetwear collection', 'alpona shop'],
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    title: `Shop Custom Apparel & Streetwear | ${SITE_NAME}`,
    description: 'Browse our exclusive collection of custom printed t-shirts, hoodies, sweatshirts, tote bags, and accessories.',
    url: `${SITE_URL}/shop`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/og-shop.png`,
        width: 1200,
        height: 630,
        alt: 'Alpona Shop Catalog',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Shop Custom Apparel | ${SITE_NAME}`,
    description: 'Explore custom t-shirts, hoodies, and accessories.',
    images: [`${SITE_URL}/images/og-shop.png`],
  },
}


export default async function ShopPage() {
  const supabase = createPublicClient()

  // Parallel fetch categories, subcategories, product types, and products with targeted select columns
  const [
    { data: categories },
    { data: subcategories },
    { data: productTypes },
    { data: products }
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, status, description, image_url')
      .neq('status', 'hidden')
      .order('sort_order', { ascending: true }),
    supabase
      .from('subcategories')
      .select('id, category_id, name, slug, status, description, image_url')
      .eq('status', 'visible')
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_types')
      .select('id, subcategory_id, name, slug, status, description, image_url')
      .eq('status', 'visible')
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select(`
        id, name, slug, selling_price, base_price, compare_at_price, images, status, category_id, subcategory_id, product_type_id, is_bestseller, is_trending, created_at,
        category:categories(name, slug),
        subcategory:subcategories(name, slug),
        product_type:product_types(name, slug),
        product_variants(id, size, color, color_hex, stock, price, base_price, is_active, image_url)
      `)
      .or('status.eq.active,is_active.eq.true')
      .order('created_at', { ascending: false })
  ])

  const shopSchemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop',
            item: `${SITE_URL}/shop`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Alpona Products Catalog',
        numberOfItems: products?.length || 0,
        itemListElement: (products || []).slice(0, 20).map((p: any, idx: number) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${SITE_URL}/shop/${p.slug}`,
          name: p.name,
        })),
      },
    ],
  }

  return (
    <ErrorBoundary sectionName="Shop Catalog">
      <JsonLd data={shopSchemas} />
      <ShopCatalog 
        categories={categories || []} 
        subcategories={subcategories || []}
        productTypes={productTypes || []}
        products={products || []}
      />
    </ErrorBoundary>
  )
}
