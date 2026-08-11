import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { TrustSection } from '@/components/home/TrustSection'
import { ShopByCategory } from '@/components/home/ShopByCategory'
import { PopularDesigns } from '@/components/home/PopularDesigns'
import { NewArrivals } from '@/components/home/NewArrivals'
import { WhyAlpona } from '@/components/home/WhyAlpona'
import { AIRecommendations } from '@/components/shop/AIRecommendations'
import { LimitedTimeOffer } from '@/components/home/LimitedTimeOffer'
import { TrustedLogos } from '@/components/home/TrustedLogos'
import { SafeBoundary } from '@/components/shared/SafeBoundary'
import { createPublicClient } from '@/lib/supabase/public'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_NAME, SITE_URL } from '@/constants/config'
import dynamic from 'next/dynamic'

const Testimonials = dynamic(() => import('@/components/home/Testimonials').then((mod) => mod.Testimonials))
const FAQPreview = dynamic(() => import('@/components/home/FAQPreview').then((mod) => mod.FAQPreview))
const NewsletterCommunity = dynamic(() => import('@/components/home/NewsletterCommunity').then((mod) => mod.NewsletterCommunity))

export const revalidate = 60 // Revalidate home page at most every 60 seconds

export const metadata: Metadata = {
  title: `${SITE_NAME} — Wear Your Imagination | Custom Apparel & Streetwear`,
  description: 'Discover 120+ original streetwear designs or build your custom print-on-demand t-shirts, hoodies, and accessories. High quality combed cotton, zero-waste printing, delivered across India.',
  keywords: ['custom t-shirts india', 'print on demand apparel', 'streetwear brand', 'custom hoodies', 'alpona clothing'],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} — Wear Your Imagination | Custom Apparel & Streetwear`,
    description: 'Discover 120+ original streetwear designs or build your custom print-on-demand t-shirts, hoodies, and accessories.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/og-home.png`,
        width: 1200,
        height: 630,
        alt: 'Alpona Streetwear & Custom Apparel',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Wear Your Imagination`,
    description: 'Custom print-on-demand streetwear & original apparel.',
    images: [`${SITE_URL}/images/og-home.png`],
  },
}

export default async function HomePage() {
  const homeSchemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
          caption: SITE_NAME,
        },
        sameAs: [
          'https://instagram.com/alpona.in',
          'https://facebook.com/alponaindia',
          'https://twitter.com/alponaindia',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-9876543210',
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi', 'bn'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
  const supabase = createPublicClient()

  // Parallel data fetching via Promise.all
  const [{ data: categories }, { data: popularProducts }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, status, image_url')
      .neq('status', 'hidden')
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        selling_price,
        images,
        is_bestseller,
        product_type:product_types(name)
      `)
      .eq('status', 'active')
      .eq('is_trending', true)
      .limit(8)
      .order('created_at', { ascending: false })
  ])

  // Format popular products
  const formattedProducts = popularProducts?.map(p => ({
    id: p.id,
    title: p.name,
    main_image_url: p.images?.[0] || '/images/designer_1.png',
    hover_image_url: p.images?.[1] || p.images?.[0] || '/images/designer_1.png',
    price: p.selling_price,
    type: p.product_type ? (Array.isArray(p.product_type) ? p.product_type[0]?.name : (p.product_type as any).name) : 'Product',
    slug: p.slug
  })) || []

  const fallbackCategories = [
    { id: 'fallback-tshirts', name: 'T-Shirts', slug: 't-shirts', image_url: null },
    { id: 'fallback-bags', name: 'Bags', slug: 'bags', image_url: null },
    { id: 'fallback-kids', name: 'Kids', slug: 'kids', image_url: null },
    { id: 'fallback-accessories', name: 'Accessories', slug: 'accessories', image_url: null },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={homeSchemas} />
      <SafeBoundary name="Hero">
        <Hero />
      </SafeBoundary>

      <SafeBoundary name="TrustSection">
        <TrustSection />
      </SafeBoundary>

      <SafeBoundary name="TrustedLogos">
        <TrustedLogos />
      </SafeBoundary>

      <SafeBoundary name="ShopByCategory">
        <ShopByCategory categories={categories?.length ? categories : fallbackCategories} />
      </SafeBoundary>

      <SafeBoundary name="PopularDesigns">
        <PopularDesigns products={formattedProducts} />
      </SafeBoundary>

      <SafeBoundary name="NewArrivals">
        <NewArrivals products={formattedProducts} />
      </SafeBoundary>

      <SafeBoundary name="AIRecommendations">
        <AIRecommendations title="AI Smart Recommendations" />
      </SafeBoundary>

      <SafeBoundary name="WhyAlpona">
        <WhyAlpona />
      </SafeBoundary>

      <SafeBoundary name="LimitedTimeOffer">
        <LimitedTimeOffer />
      </SafeBoundary>

      <SafeBoundary name="Testimonials">
        <Testimonials />
      </SafeBoundary>

      <SafeBoundary name="FAQPreview">
        <FAQPreview />
      </SafeBoundary>

      <SafeBoundary name="NewsletterCommunity">
        <NewsletterCommunity />
      </SafeBoundary>
    </div>
  )
}
