import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface AvailableCoupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minSpend: number
  description: string
  applicable: boolean
  calculatedDiscount: number
  shortfall: number
}

const DEFAULT_COUPONS = [
  {
    code: 'WELCOME10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minSpend: 499,
    description: '10% OFF on all custom apparel',
  },
  {
    code: 'ALPONA20',
    discountType: 'percentage' as const,
    discountValue: 20,
    minSpend: 1499,
    description: '20% OFF on luxury atelier orders above ₹1,499',
  },
  {
    code: 'FESTIVE100',
    discountType: 'fixed' as const,
    discountValue: 100,
    minSpend: 899,
    description: 'Flat ₹100 instant discount on orders above ₹899',
  },
  {
    code: 'ATELIER15',
    discountType: 'percentage' as const,
    discountValue: 15,
    minSpend: 999,
    description: '15% OFF for atelier custom designs',
  }
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cartTotal = parseFloat(searchParams.get('cartTotal') || '0')

    // Fetch active coupons from Supabase
    const { data: dbCoupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')

    let activeCouponsList: Array<{
      code: string
      discountType: 'percentage' | 'fixed'
      discountValue: number
      minSpend: number
      description?: string
    }> = []

    if (!error && dbCoupons && dbCoupons.length > 0) {
      const now = new Date()
      activeCouponsList = dbCoupons
        .filter((c: any) => {
          const isActive = c.is_active !== false && c.status !== 'inactive'
          const validUntil = c.expiry_date || c.valid_until
          const notExpired = !validUntil || new Date(validUntil) > now
          const usageLimit = c.usage_limit
          const usedCount = c.usage_count || c.used_count || 0
          const notLimitReached = !usageLimit || usedCount < usageLimit
          return isActive && notExpired && notLimitReached
        })
        .map((c: any) => ({
          code: c.code,
          discountType: (c.type || c.discount_type || 'percentage') as 'percentage' | 'fixed',
          discountValue: Number(c.value || c.discount_value || 0),
          minSpend: Number(c.min_purchase_amount || c.min_spend || 0),
          description: c.description || (c.type === 'percentage' ? `${c.value}% OFF` : `Flat ₹${c.value} OFF`)
        }))
    }

    // Merge with default coupons if DB returns few coupons
    if (activeCouponsList.length === 0) {
      activeCouponsList = DEFAULT_COUPONS
    }

    // Calculate savings for each coupon
    const processedCoupons: AvailableCoupon[] = activeCouponsList.map((coupon) => {
      const minSpend = coupon.minSpend || 0
      const applicable = cartTotal >= minSpend
      let calculatedDiscount = 0

      if (applicable && cartTotal > 0) {
        if (coupon.discountType === 'percentage') {
          calculatedDiscount = Math.round((cartTotal * coupon.discountValue) / 100)
        } else {
          calculatedDiscount = Math.min(cartTotal, coupon.discountValue)
        }
      }

      const shortfall = applicable ? 0 : Math.max(0, minSpend - cartTotal)

      return {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minSpend,
        description: coupon.description || (coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `Flat ₹${coupon.discountValue} OFF`),
        applicable,
        calculatedDiscount,
        shortfall
      }
    })

    // Sort: Applicable first, then by calculated discount descending
    processedCoupons.sort((a, b) => {
      if (a.applicable && !b.applicable) return -1
      if (!a.applicable && b.applicable) return 1
      return b.calculatedDiscount - a.calculatedDiscount
    })

    // Pick best coupon (highest discount among applicable)
    const applicableCoupons = processedCoupons.filter(c => c.applicable && c.calculatedDiscount > 0)
    const bestCoupon = applicableCoupons.length > 0 ? applicableCoupons[0] : null

    return NextResponse.json(
      {
        success: true,
        coupons: processedCoupons,
        bestCoupon
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error: any) {
    console.error('Available coupons error:', error)
    return NextResponse.json({ success: false, coupons: [], bestCoupon: null }, { status: 500 })
  }
}
