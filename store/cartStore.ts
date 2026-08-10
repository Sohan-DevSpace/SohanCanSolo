import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  designId?: string
  designName?: string
  designImage?: string
  designIdBack?: string
  designNameBack?: string
  designImageBack?: string
  variantId: string
  size: string
  color: string
  colorHex: string
  price: number
  quantity: number
}

export interface Coupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
}

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number // subtotal
  appliedCoupon: Coupon | null
  discountAmount: number
  finalTotal: number // total after discount
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
}

// Helper to recalculate derived state
const calculateTotals = (items: CartItem[], coupon: Coupon | null) => {
  const totals = items.reduce(
    (acc, item) => {
      acc.itemCount += item.quantity
      acc.total += item.price * item.quantity
      return acc
    },
    { itemCount: 0, total: 0 }
  )

  let discountAmount = 0
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (totals.total * coupon.discountValue) / 100
    } else {
      discountAmount = coupon.discountValue
    }
  }

  // Ensure discount doesn't exceed total
  discountAmount = Math.min(discountAmount, totals.total)
  const finalTotal = totals.total - discountAmount

  return { ...totals, discountAmount, finalTotal }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,
      appliedCoupon: null,
      discountAmount: 0,
      finalTotal: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((i) => i.id === newItem.id)
          const updatedItems = [...state.items]

          if (existingItemIndex >= 0 && updatedItems[existingItemIndex]) {
            const existing = updatedItems[existingItemIndex]!
            updatedItems[existingItemIndex] = {
              ...existing,
              quantity: existing.quantity + newItem.quantity,
            }
          } else {
            updatedItems.push(newItem)
          }

          return {
            items: updatedItems,
            ...calculateTotals(updatedItems, state.appliedCoupon),
          }
        })
      },

      removeItem: (id) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id)
          return {
            items: updatedItems,
            ...calculateTotals(updatedItems, state.appliedCoupon),
          }
        })
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          )
          return {
            items: updatedItems,
            ...calculateTotals(updatedItems, state.appliedCoupon),
          }
        })
      },

      clearCart: () => {
        set({ 
          items: [], 
          itemCount: 0, 
          total: 0, 
          appliedCoupon: null,
          discountAmount: 0,
          finalTotal: 0
        })
      },

      applyCoupon: (coupon) => {
        set((state) => {
          return {
            appliedCoupon: coupon,
            ...calculateTotals(state.items, coupon),
          }
        })
      },

      removeCoupon: () => {
        set((state) => {
          return {
            appliedCoupon: null,
            ...calculateTotals(state.items, null),
          }
        })
      },
    }),
    {
      name: 'alpona-cart', // key in localStorage
    }
  )
)
