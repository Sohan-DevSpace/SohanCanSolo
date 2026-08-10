import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { BLOG_POSTS } from '../data'
import { IconArrowLeft, IconClock, IconCalendar, IconBookmark } from '@/components/shared/PremiumIcons'

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Try DB first
  const { data: dbPost } = await supabase
    .from('blogs')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (dbPost) {
    return {
      title: `${dbPost.title} | Alpona Blog`,
      description: dbPost.excerpt || '',
    }
  }

  // Fallback to static
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return { title: 'Article Not Found' }
  return {
    title: `${post.title} | Alpona Blog`,
    description: post.excerpt,
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch from Supabase
  const { data: dbPost } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  let postTitle = ''
  let postCategory = 'Streetwear'
  let postDate = ''
  let postReadTime = ''
  let postImage = ''
  let articleContent: React.ReactNode = null

  if (dbPost) {
    postTitle = dbPost.title
    postCategory = dbPost.slug.includes('trend') ? 'Fashion' : dbPost.slug.includes('qikink') ? 'POD Tips' : 'Design Inspiration'
    postDate = new Date(dbPost.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    
    const wordCount = dbPost.content ? dbPost.content.split(/\s+/).length : 0
    const readTimeMins = Math.max(1, Math.ceil(wordCount / 200))
    postReadTime = `${readTimeMins} min read`
    postImage = dbPost.cover_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'

    // Parse paragraph lines dynamically
    const paragraphs = dbPost.content ? dbPost.content.split('\n\n') : []
    articleContent = (
      <div className="space-y-6">
        {paragraphs.map((p: string, idx: number) => {
          const trimmed = p.trim()
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-lg font-bold font-serif text-[#1A1A1A] pt-3">
                {trimmed.replace('###', '').trim()}
              </h4>
            )
          } else if (trimmed.startsWith('##')) {
            return (
              <h3 key={idx} className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">
                {trimmed.replace('##', '').trim()}
              </h3>
            )
          } else if (trimmed.startsWith('>')) {
            return (
              <blockquote key={idx} className="border-l border-[#B8763C] pl-4 italic text-[#666666] my-6">
                {trimmed.replace('>', '').trim()}
              </blockquote>
            )
          } else if (trimmed.length > 0) {
            return <p key={idx}>{trimmed}</p>
          }
          return null
        })}
      </div>
    )
  } else {
    // 2. Fallback to static BLOG_POSTS
    const staticPost = BLOG_POSTS.find((p) => p.slug === slug)
    if (!staticPost) {
      notFound()
    }

    postTitle = staticPost.title
    postCategory = staticPost.category
    postDate = staticPost.date
    postReadTime = staticPost.readTime
    postImage = staticPost.image

    // Static layouts based on slug
    if (slug === 'anime-streetwear-trends') {
      articleContent = (
        <div className="space-y-6">
          <p>
            Streetwear has always been a canvas for culture, self-expression, and subversion. Over the last decade, a noticeable shift occurred as classic anime graphics found their way from niche fandoms onto the runways of major design houses and the clothing racks of global streetwear brands.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">The Evolution of Otaku Graphic Design</h3>
          <p>
            Early anime apparel was often simple: a large character print slapped onto a poor-quality t-shirt. Today, designers treat anime graphics with editorial respect, integrating retro cell shading, distressed vintage screens, and bold cyberpunk color pairings.
          </p>
          <blockquote className="border-l border-[#B8763C] pl-4 italic text-[#666666] my-6">
            "Fashion is the ultimate medium to signal identity. For a generation raised on Shonen and Cyberpunk anime, these characters carry the same cultural weight as rock bands did in the 80s."
          </blockquote>
          <p>
            Here at Alpona, we pay close attention to print-on-demand details. We ensure that direct-to-garment (DTG) parameters are calibrated for complex shading and color gradients, letting the artist's original vision stand out clearly on high-grade fabrics.
          </p>
        </div>
      )
    } else if (slug === 'typography-rules-custom-tshirts') {
      articleContent = (
        <div className="space-y-6">
          <p>
            Typography is the soul of text-based apparel design. When using our Creator Studio, selecting a font is just the first step. Creating a premium design requires understanding fundamental rules of kerning, letter spacing, contrast, and alignment.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">Rule 1: Keep tracking loose for capital sans-serif</h3>
          <p>
            If you are using bold, uppercase sans-serif fonts (like Futura or Helvetica Display), increasing the letter-spacing slightly creates a clean, premium editorial layout. Conversely, tight letters feel cheap and are harder to print clearly.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">Rule 2: Don't mix more than two fonts</h3>
          <p>
            Select one primary font for your main headline and a secondary matching font for subtext. Mixing three or more fonts on a single shirt creates visual clutter that distracts the viewer.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">Rule 3: Ensure sufficient contrast</h3>
          <p>
            White text on a black tee stands out perfectly, but medium gray on dark navy will get swallowed by the garment dye. Choose high-contrast palettes that pop!
          </p>
        </div>
      )
    } else if (slug === 'pod-scaling-guide-india') {
      articleContent = (
        <div className="space-y-6">
          <p>
            Print-on-demand (POD) represents a massive opportunity for Indian designers, creators, and entrepreneurs looking to launch DTC fashion brands without risking large capital on inventory.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">Why Partnering with Qikink is a Game Changer</h3>
          <p>
            Qikink handles the heavy lifting of printing, packaging, and logistics. By integrating your Next.js store with Qikink's automated sandbox APIs, order placement is instantly synchronized. Your main focus remains entirely on design marketing and building a loyal community.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">Maximizing Margins</h3>
          <p>
            Setting up dynamic collections, offering limited edition drops, and running Razorpay secure payment checkouts helps drive up conversion rates. Maintain quality customer support to keep refund requests under 1%.
          </p>
        </div>
      )
    } else if (slug === 'heavyweight-oversized-tees-guide') {
      articleContent = (
        <div className="space-y-6">
          <p>
            If you look at the streetwear catalogs of top global brands, they all share one staple product: the heavyweight, oversized crew neck t-shirt.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">What Makes a Tee "Heavyweight"?</h3>
          <p>
            Standard retail t-shirts weigh around 140-160 GSM (grams per square meter). Premium streetwear blanks require at least 220-240 GSM cotton. The thicker weave gives the shirt a structured drape that accentuates the oversized boxy silhouette without looking sloppy.
          </p>
          <h3 className="text-xl font-bold font-serif text-[#1A1A1A] pt-4">Why Oversized Silhouettes Dominate</h3>
          <p>
            Oversized clothing feels comfortable, gender-neutral, and sits perfectly above chunky sneakers and cargo denim. It provides a larger visual canvas for printed artworks, making it the perfect base product for custom designs.
          </p>
        </div>
      )
    } else {
      notFound()
    }
  }

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Back Button */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] pt-8 md:pt-12">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B8763C] hover:text-[#9A5E24] transition-colors"
        >
          <IconArrowLeft size={16} color="currentColor" /> Back to Blog
        </Link>
      </div>

      {/* Article Container */}
      <article className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] mt-6 md:mt-8 space-y-8">
        
        {/* Banner Details */}
        <div className="space-y-4">
          <span className="inline-block bg-[#B8763C]/10 text-[#B8763C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {postCategory}
          </span>
          <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight text-zinc-900 tracking-tight">
            {postTitle}
          </h1>
          
          <div className="flex flex-wrap gap-4 md:gap-6 text-xs text-zinc-500 font-semibold border-y border-[#E8E2DB] py-4">
            <span className="flex items-center gap-1.5"><IconCalendar size={16} color="currentColor" /> {postDate}</span>
            <span className="flex items-center gap-1.5"><IconClock size={16} color="currentColor" /> {postReadTime}</span>
            <span className="flex items-center gap-1.5"><IconBookmark size={16} color="currentColor" /> Author: Alpona Editorial</span>
          </div>
        </div>

        {/* Feature Image */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-[#E8E2DB] shadow-sm">
          <Image
            src={postImage}
            alt={postTitle}
            fill
            className="object-cover"
          />
        </div>

        {/* Article Text Content */}
        <div className="text-base md:text-lg leading-relaxed text-[#444444] space-y-6">
          {articleContent}
        </div>

      </article>
    </div>
  )
}
