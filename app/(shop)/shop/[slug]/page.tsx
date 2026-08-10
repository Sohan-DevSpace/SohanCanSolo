import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { ProductDetailClient } from '@/components/shop/ProductDetailClient'
import { Database } from '@/lib/types/database'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_NAME, SITE_URL } from '@/constants/config'

export const revalidate = 60 // Revalidate product page at most every 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data } = await supabase.from('products').select('name, description, images, selling_price, mrp').eq('slug', slug).single()
  
  if (!data) return { title: 'Product Not Found | Alpona' }
  const product = data as any
  
  const images = product?.images && Array.isArray(product.images) && product.images.length > 0 
    ? [product.images[0]] 
    : [`${SITE_URL}/images/og-home.png`]

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: product.description || `Buy ${product.name} online at Alpona. Custom streetwear apparel with premium combed cotton.`,
    alternates: {
      canonical: `${SITE_URL}/shop/${slug}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description || `Buy ${product.name} online at Alpona. Custom streetwear apparel.`,
      url: `${SITE_URL}/shop/${slug}`,
      siteName: SITE_NAME,
      images: images.map((img: string) => ({
        url: img.startsWith('http') ? img : `${SITE_URL}${img}`,
        alt: product.name,
      })),
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: images,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = createPublicClient()

  const { data: productData } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id, name, slug, description, image_url, is_active, created_at
      ),
      product_variants (*),
      product_designs (
        designs (*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (!productData) {
    notFound()
  }

  const product = productData as any

  // Extract flat arrays from the nested joins
  const variants = product.product_variants || []
  
  // Flatten the product_designs many-to-many relationship
  const designs = (product.product_designs || [])
    .map((pd: any) => pd.designs)
    .filter(Boolean) as Database['public']['Tables']['designs']['Row'][]

  // Clean up the product object before passing to client to match expected types
  const cleanProduct = {
    ...product,
    categories: Array.isArray(product.categories) ? product.categories[0] : product.categories
  }

  // Fetch approved product reviews and related products in parallel
  const [{ data: dbReviews }, { data: relatedProducts }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, comment, images, status, created_at, user_id, profiles(full_name, avatar_url)')
      .eq('product_id', productData.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select(`
        id, name, slug, selling_price, mrp, images, status, category_id,
        category:categories(name, slug),
        product_variants(id, size, color, sku, stock_qty, price_modifier)
      `)
      .eq('status', 'active')
      .eq('category_id', productData.category_id)
      .neq('id', productData.id)
      .limit(4)
      .order('created_at', { ascending: false })
  ])

  const categoryName = cleanProduct?.categories?.name || 'Catalog'
  const categorySlug = cleanProduct?.categories?.slug || 'shop'

  const productSchemas = {
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
          {
            '@type': 'ListItem',
            position: 3,
            name: categoryName,
            item: `${SITE_URL}/shop?category=${categorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
            item: `${SITE_URL}/shop/${slug}`,
          },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/shop/${slug}/#product`,
        name: product.name,
        description: product.description,
        image: product.images || [],
        sku: product.id,
        brand: {
          '@type': 'Brand',
          name: SITE_NAME,
        },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/shop/${slug}`,
          priceCurrency: 'INR',
          price: product.selling_price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
        ...(dbReviews && dbReviews.length > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (dbReviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / dbReviews.length).toFixed(1),
            reviewCount: dbReviews.length,
          },
          review: dbReviews.slice(0, 5).map((r: any) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: r.profiles?.full_name || 'Customer',
            },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating || 5,
            },
            reviewBody: r.comment,
          })),
        } : {}),
      },
    ],
  }

  return (
    <div className="bg-[#FAF7F4] min-h-screen">
      <JsonLd data={productSchemas} />
      <ProductDetailClient 
        product={cleanProduct} 
        variants={variants} 
        designs={designs} 
        initialReviews={dbReviews || []}
        relatedProducts={relatedProducts || []}
      />
    </div>
  )
}
