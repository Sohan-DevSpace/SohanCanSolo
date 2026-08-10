import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
    }

    // Check expiry
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }

    // Check minimum spend
    if (coupon.min_spend && cartTotal < coupon.min_spend) {
      return NextResponse.json({ error: `Minimum spend of ₹${coupon.min_spend} required` }, { status: 400 })
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type, // 'percentage' or 'fixed'
        discountValue: coupon.discount_value,
      }
    })
  } catch (error: any) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
