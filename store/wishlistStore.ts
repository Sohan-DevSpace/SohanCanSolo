import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  itemIds: string[]
  toggleItem: (id: string) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  hasItem: (id: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      itemIds: [],

      toggleItem: (id) => {
        set((state) => {
          const index = state.itemIds.indexOf(id)
          const updated = [...state.itemIds]
          if (index >= 0) {
            updated.splice(index, 1)
          } else {
            updated.push(id)
          }
          return { itemIds: updated }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          itemIds: state.itemIds.filter((itemId) => itemId !== id),
        }))
      },

      clearWishlist: () => {
        set({ itemIds: [] })
      },

      hasItem: (id) => {
        return get().itemIds.includes(id)
      },
    }),
    {
      name: 'alpona-wishlist',
    }
  )
)
