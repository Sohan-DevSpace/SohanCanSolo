import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS, type BlogPost } from './data'

export const metadata = {
  title: 'Blog | Design & Fashion Inspiration | Alpona',
  description: 'Articles on print-on-demand trends, design inspiration, product guides, and apparel lifestyle.',
}

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch published blogs from Supabase
  const { data: dbBlogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Map database blogs to BlogPost interface
  const dynamicPosts: BlogPost[] = (dbBlogs || []).map(b => {
    const wordCount = b.content ? b.content.split(/\s+/).length : 0
    const readTimeMins = Math.max(1, Math.ceil(wordCount / 200))
    
    return {
      title: b.title,
      slug: b.slug,
      category: b.slug.includes('trend') ? 'Fashion' : b.slug.includes('qikink') ? 'POD Tips' : 'Design Inspiration',
      excerpt: b.excerpt || 'Read our latest blog post on custom designs and premium print quality.',
      readTime: `${readTimeMins} min read`,
      date: new Date(b.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      image: b.cover_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'
    }
  })

  // Fallback to static articles if no blogs are in database
  const posts = dynamicPosts.length > 0 ? dynamicPosts : BLOG_POSTS

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Knowledge Base
        </span>
        <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-zinc-900">
          The Alpona Blog
        </h1>
        <p className="text-[#666666] text-sm md:text-base mt-4 max-w-lg mx-auto leading-relaxed">
          Stay updated with printing guides, modern streetwear releases, and design tutorials from our creative team.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[1200px] mt-12 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="space-y-4 md:space-y-6">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-[#FAF6F2] border border-[#E8E2DB] shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-[#B8763C]/45">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-103"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 text-xs font-bold text-[#B8763C] px-3.5 py-1.5 rounded-full border border-[#E8E2DB]">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 px-2">
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#888888]">
                    <span>{post.date}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8E2DB]" />
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A] group-hover:text-[#B8763C] transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#666666] leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B8763C] group-hover:text-[#B06024] flex items-center gap-1 pt-1.5">
                    Read Article <span>&rarr;</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
