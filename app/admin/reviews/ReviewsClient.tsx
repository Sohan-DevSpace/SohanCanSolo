'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Star, Check, X, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface ReviewsClientProps {
  reviews: any[]
}

const statusTabs = [
  { id: 'all', name: 'All' },
  { id: 'pending', name: 'Pending' },
  { id: 'approved', name: 'Approved' },
  { id: 'rejected', name: 'Rejected' },
]

export function ReviewsClient({ reviews: initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setLoading(id)
    const { error } = await supabase.from('reviews').update({ status } as any).eq('id', id)
    setLoading(null)
    if (error) { toast.error(error.message); return }
    setReviews(reviews.map(r => r.id === id ? { ...r, status } : r))
    toast.success(`Review ${status}`)
  }

  const filtered = reviews.filter(r => activeTab === 'all' || r.status === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">Reviews</h1>
          <p className="text-zinc-400 text-sm mt-1">Moderate customer reviews and ratings.</p>
        </div>
      </div>

      <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-4 flex gap-1.5 overflow-x-auto scrollbar-none">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
            }`}
          >
            {tab.name}
            {tab.id !== 'all' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                activeTab === tab.id ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800/50 text-zinc-500'
              }`}>
                {reviews.filter(r => r.status === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((review: any) => (
            <div key={review.id} className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-5 hover:border-white/[0.08] hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group">
              <div className="flex flex-col md:flex-row justify-between gap-5">
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Stars */}
                      <div className="flex gap-0.5 drop-shadow-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-[#B8763C] fill-current drop-shadow-[0_0_8px_rgba(184,118,60,0.4)]' : 'text-zinc-800'}`} />
                        ))}
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-colors ${
                        review.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20' :
                        review.status === 'rejected' ? 'text-rose-400 bg-rose-500/10 ring-1 ring-inset ring-rose-500/20' :
                        'text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 bg-white/[0.02] px-2.5 py-1 rounded-full">
                      {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-[13px] text-zinc-300 leading-relaxed italic border-l-2 border-white/[0.04] pl-3 py-1 group-hover:border-[#B8763C]/30 transition-colors">"{review.comment}"</p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1.5"><span className="uppercase tracking-widest text-[9px] font-bold">Product:</span> <span className="text-zinc-300 font-medium">{review.product?.name || 'Unknown'}</span></span>
                    <span className="w-1 h-1 rounded-full bg-white/[0.06]" />
                    <span className="flex items-center gap-1.5"><span className="uppercase tracking-widest text-[9px] font-bold">By:</span> <span className="text-zinc-300 font-medium">{review.profiles?.full_name || 'Anonymous'}</span></span>
                  </div>

                  {review.images?.length > 0 && (
                    <div className="flex gap-3 mt-3 pt-3 border-t border-white/[0.04]">
                      {review.images.map((img: string, i: number) => (
                        <div key={i} className="relative group/img overflow-hidden rounded-xl border border-white/[0.06] shadow-sm">
                          <img src={img} alt="" className="w-16 h-16 object-cover group-hover/img:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {review.status === 'pending' && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleAction(review.id, 'approved')}
                      disabled={loading === review.id}
                      className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/20 text-xs font-semibold h-9 px-4 active:scale-[0.97] transition-all shadow-sm"
                    >
                      {loading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(review.id, 'rejected')}
                      disabled={loading === review.id}
                      className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 ring-1 ring-inset ring-rose-500/20 text-xs font-semibold h-9 px-4 active:scale-[0.97] transition-all shadow-sm"
                    >
                      <X className="w-4 h-4 mr-1.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#121214]/60 backdrop-blur-md border border-white/[0.04] shadow-sm rounded-2xl p-20 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-600 shadow-inner">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-display font-semibold text-white tracking-tight">No reviews found</h3>
            <p className="text-zinc-500 text-sm mt-1">Customer reviews will appear here for moderation.</p>
          </div>
        </div>
      )}
    </div>
  )
}
