import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/types/product'

export interface CartItem {
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalItems: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.product.id === item.product.id)
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.product.id === item.product.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),
      clearCart: () => set({ items: [] }),
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'mashuf-cart',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : ({} as any)),
      skipHydration: true, // CRITICAL FIX: جلوگیری از کرش صفحه سیاه
    }
  )
)