import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { IconExternalLink } from '@/components/shared/PremiumIcons'
import Image from 'next/image'
import Link from 'next/link'
import { CURRENCY_SYMBOL } from '@/constants/config'
import TrackForm from './TrackForm'
import TrackResultClient from './TrackResultClient'
import { Package } from 'lucide-react'
import { IconTruck } from '@/components/shared/PremiumIcons'

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderNumber } = await searchParams
  
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return (
      <div className="relative min-h-screen bg-[#FAF7F4] text-[#1A1A1A] overflow-hidden pt-16 md:pt-24 pb-20 px-4 flex items-center justify-center">
        {/* Cinematic Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] max-w-5xl pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#B8763C]/10 blur-[100px]" />
        </div>
        
        <div className="max-w-md w-full bg-white/60 backdrop-blur-2xl p-10 rounded-[2rem] border border-[#E8E2DB] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 bg-[#FAF7F4] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#B8763C] shadow-inner border border-[#E8E2DB]/50">
            <IconTruck size={32} />
          </div>
          <h2 className="text-3xl font-serif font-light text-primary mb-3">Login Required</h2>
          <p className="text-[#8A8580] mb-8 leading-relaxed">
            To track your orders, view shipping updates, and manage your history, you need to sign in to your Alpona account.
          </p>
          <Link 
            href="/auth/login?next=/order/track" 
            className="group flex items-center justify-center w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-[#B8763C] transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Sign In to Track Order
          </Link>
          <p className="mt-6 text-sm text-[#8A8580]">
            Don't have an account? <Link href="/auth/register" className="text-[#B8763C] font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    )
  }

  let recentOrders: { order_number: string, created_at: string }[] = []
  
  if (user) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('order_number, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) recentOrders = data
  }

  let orderData = null
  let errorMsg = null

  if (orderNumber) {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          designs!order_items_design_id_fkey (image_url),
          products (images)
        )
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error || !order) {
      errorMsg = "We couldn't find an order with that number. Please check and try again."
    } else {
      orderData = order
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FAF7F4] text-[#1A1A1A] overflow-hidden pt-16 md:pt-24 pb-20 px-4">
      {/* Background Decor - Cinematic blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] max-w-5xl pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#B8763C]/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#E8C9A0]/20 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center pb-8 md:pb-10 flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full bg-[#B8763C]/10 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-[#B8763C]/20 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-[#B8763C]/30 flex items-center justify-center text-[#B8763C] shadow-lg border border-[#B8763C]/20 bg-white/50 backdrop-blur-sm">
              <Package className="w-6 h-6 animate-bounce" />
            </div>
          </div>
          <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Where is my stuff?
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-serif tracking-tight text-zinc-900 text-balance mb-5 leading-[1.1]">
            Track Your Order
          </h1>
          <p className="text-[#8A8580] text-sm md:text-base max-w-[420px] mx-auto leading-relaxed">
            Enter your order details below to see the latest updates on your premium apparel shipment.
          </p>
        </div>

        {/* Search Bar / Dropdown Component */}
        <TrackForm initialOrder={orderNumber} recentOrders={recentOrders} />

        {errorMsg && (
          <div className="mt-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-600 text-center text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500">
            {errorMsg}
          </div>
        )}

        {orderData && <TrackResultClient orderData={orderData} />}
      </div>
    </div>
  )
}
