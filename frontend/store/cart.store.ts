import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean

  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void

  subtotal: () => number
  /** Returns subtotal after applying a percentage discount (0–100). */
  discountedSubtotal: (discountPercent: number) => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],
      isOpen: false,

      addItem(product, quantity = 1) {
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id)
          if (existing) {
            existing.quantity += quantity
          } else {
            state.items.push({
              productId: product.id,
              product,
              quantity,
              price: product.price,
            })
          }
          state.isOpen = true
        })
      },

      removeItem(productId) {
        set((state) => {
          state.items = state.items.filter((item) => item.productId !== productId)
        })
      },

      updateQuantity(productId, quantity) {
        set((state) => {
          const item = state.items.find((i) => i.productId === productId)
          if (item) {
            if (quantity <= 0) {
              state.items = state.items.filter((i) => i.productId !== productId)
            } else {
              item.quantity = quantity
            }
          }
        })
      },

      clearCart() {
        set((state) => { state.items = [] })
      },

      toggleCart() {
        set((state) => { state.isOpen = !state.isOpen })
      },

      subtotal() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      discountedSubtotal(discountPercent) {
        const base = get().subtotal()
        if (!discountPercent || discountPercent <= 0) return base
        return base * (1 - Math.min(discountPercent, 100) / 100)
      },

      itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    })),
    {
      name: 'samdoor-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
