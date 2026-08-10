export interface BlogPost {
  title: string
  slug: string
  category: string
  excerpt: string
  readTime: string
  date: string
  image: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'The Rise of Anime Streetwear: Why Otaku Fashion is Going Mainstream',
    slug: 'anime-streetwear-trends',
    category: 'Fashion',
    excerpt: 'Explore how classic anime artwork has shifted from niche comic cons directly to premium urban streetwear collections globally.',
    readTime: '5 min read',
    date: 'June 8, 2026',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop'
  },
  {
    title: '5 Typography Rules for Designing Custom T-Shirts that Sell',
    slug: 'typography-rules-custom-tshirts',
    category: 'Design Inspiration',
    excerpt: 'Before placing text in our Custom Studio, understand font pairings, letter spacing (tracking), and hierarchy constraints for clean DTG prints.',
    readTime: '4 min read',
    date: 'June 4, 2026',
    image: 'https://images.unsplash.com/photo-1513346940221-6f673d962e97?w=800&auto=format&fit=crop'
  },
  {
    title: 'Print on Demand Guide: High-Margin Scaling for Indian Brands',
    slug: 'pod-scaling-guide-india',
    category: 'POD Tips',
    excerpt: 'Learn how partnering with Qikink, designing custom collections, and driving organic SEO traffic can scale your DTC brand with minimal capital.',
    readTime: '8 min read',
    date: 'May 29, 2026',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop'
  },
  {
    title: 'Why Heavyweight Oversized Tees are the Ultimate Modern Uniform',
    slug: 'heavyweight-oversized-tees-guide',
    category: 'Product Guides',
    excerpt: 'A deep dive into garment construction, thread counts, and fabric weights that make oversized silhouettes dominate modern casual wear.',
    readTime: '6 min read',
    date: 'May 22, 2026',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop'
  }
]
