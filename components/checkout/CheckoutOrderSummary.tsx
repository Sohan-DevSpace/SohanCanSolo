'use client'

import Image from 'next/image'
import { CURRENCY_SYMBOL } from '@/constants/config'
import { CartItem } from '@/store/cartStore'

interface CheckoutOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  isExpressShipping: boolean
  isGiftWrap: boolean
  isBoxPacking: boolean
  paymentMethod: 'prepaid' | 'cod'
  prepaidDiscount: number
  codHandlingFee: number
  finalTotal: number
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shippingFee,
  isExpressShipping,
  isGiftWrap,
  isBoxPacking,
  paymentMethod,
  prepaidDiscount,
  codHandlingFee,
  finalTotal,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-white border border-[#E8E2DB] rounded-3xl p-6 shadow-sm space-y-6">
      <h3 className="text-base font-bold font-serif text-[#1A1A1A]">Order Summary</h3>

      {/* Items List */}
      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={`${item.id}-${item.size}-${idx}`} className="flex gap-3 items-center">
            <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#FAF7F4] shrink-0 border border-[#E8E2DB]">
              <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{item.productName}</h4>
              <p className="text-[11px] text-[#8C857C]">
                Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
              </p>
              <div className="text-xs font-extrabold text-[#1A1A1A] mt-0.5">
                {CURRENCY_SYMBOL}{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-[#E8E2DB] text-xs">
        <div className="flex justify-between text-[#8C857C]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#1A1A1A]">{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-[#8C857C]">
          <span>Shipping</span>
          <span className="font-semibold text-emerald-700">{shippingFee === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${shippingFee}`}</span>
        </div>

        {isExpressShipping && (
          <div className="flex justify-between text-[#8C857C]">
            <span>Express Delivery & Rush Priority</span>
            <span className="font-semibold text-[#1A1A1A]">{CURRENCY_SYMBOL}100</span>
          </div>
        )}

        {isGiftWrap && (
          <div className="flex justify-between text-[#8C857C]">
            <span>Gift Wrap & Box Packing</span>
            <span className="font-semibold text-[#1A1A1A]">{CURRENCY_SYMBOL}59</span>
          </div>
        )}

        {!isGiftWrap && isBoxPacking && (
          <div className="flex justify-between text-[#8C857C]">
            <span>Box Packing</span>
            <span className="font-semibold text-[#1A1A1A]">{CURRENCY_SYMBOL}29</span>
          </div>
        )}

        {paymentMethod === 'prepaid' && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Prepaid Instant Discount</span>
            <span>-{CURRENCY_SYMBOL}{prepaidDiscount}</span>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="flex justify-between text-[#8C857C]">
            <span>COD Handling Fee</span>
            <span className="font-semibold text-[#1A1A1A]">{CURRENCY_SYMBOL}{codHandlingFee}</span>
          </div>
        )}

        <div className="flex justify-between text-sm font-extrabold text-[#1A1A1A] pt-3 border-t border-[#E8E2DB]">
          <span>Total Payable</span>
          <span>{CURRENCY_SYMBOL}{finalTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
