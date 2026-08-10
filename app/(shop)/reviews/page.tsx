import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { IconStar, IconUser } from '@/components/shared/PremiumIcons'
import { AnimatedStarFilled, AnimatedStar } from '@/components/shared/AnimatedIcons'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const supabase = await createClient()
  
  // Fetch approved reviews with product and user info
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      images,
      created_at,
      profiles ( full_name, avatar_url ),
      products ( name, slug, images )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)

  const hasReviews = reviews && reviews.length > 0
  const avgRating = hasReviews 
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-16 md:pt-20 pb-12 px-4 border-b border-[#E8E2DB] bg-white">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Wall of Love
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900 mb-6">
          Customer Reviews
        </h1>
        
        {hasReviews && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                Number(avgRating) >= i + 1 
                  ? <AnimatedStarFilled key={i} size={24} className="text-[#B8763C]" />
                  : <AnimatedStar key={i} size={24} className="text-[#B8763C]/30" />
              ))}
            </div>
            <div className="text-2xl font-bold font-display">{avgRating} <span className="text-sm font-normal text-neutral-500">/ 5.0</span></div>
            <div className="text-sm text-neutral-500 pl-4 border-l border-[#E8E2DB]">Based on {reviews.length} reviews</div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-5 lg:px-16 max-w-[1200px] mt-12 md:mt-16">
        {!hasReviews ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E2DB] shadow-sm">
            <h2 className="text-balance text-2xl font-bold font-serif mb-3">No reviews yet</h2>
            <p className="text-neutral-500">Check back later for customer experiences.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="break-inside-avoid bg-white border border-[#E8E2DB]/50 rounded-3xl p-6 shadow-sm hover:shadow-matte-md hover:border-[#B8763C]/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F1EC] border border-[#E8E2DB] flex items-center justify-center overflow-hidden shrink-0">
                      {review.profiles?.avatar_url ? (
                        <Image src={review.profiles.avatar_url} alt={review.profiles?.full_name || 'Customer'} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <IconUser className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A1A]">{review.profiles?.full_name || 'Verified Buyer'}</h4>
                      <span className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <IconStar key={idx} color={idx < review.rating ? '#FBBF24' : '#E8E2DB'} filled={idx < review.rating} className="w-3.5 h-3.5" />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">{review.comment}</p>
                
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((img: string, imgIdx: number) => (
                      <div key={imgIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E8E2DB] shrink-0">
                        <Image src={img} alt="Review photo" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {review.products && (
                  <div className="mt-4 pt-4 border-t border-[#F5F1EC] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F1EC] shrink-0 relative">
                      {review.products.images?.[0] && (
                        <Image src={review.products.images[0]} alt={review.products.name} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold mb-0.5">Reviewed Product</p>
                      <a href={`/shop/${review.products.slug}`} className="text-xs font-semibold hover:text-[#B8763C] transition-colors line-clamp-1">
                        {review.products.name}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
