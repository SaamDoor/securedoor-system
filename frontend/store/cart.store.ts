import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartLine {
  productId: string
  slug: string
  name: string
  sku: string
  price: number
  image?: string | null
  quantity: number
  options?: Record<string, string>
}

interface CartStore {
  items: CartLine[]
  hydrated: boolean
  setHydrated: (value: boolean) => void
  addItem: (item: CartLine) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

function optionsKey(options?: Record<string, string>) {
  if (!options) return ''
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|')
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      addItem: (item) => {
        const qty = Math.max(1, Math.floor(item.quantity || 1))
        const existing = get().items.find(
          (line) =>
            line.productId === item.productId &&
            optionsKey(line.options) === optionsKey(item.options),
        )
        if (existing) {
          set({
            items: get().items.map((line) =>
              line.productId === existing.productId &&
              optionsKey(line.options) === optionsKey(existing.options)
                ? { ...line, quantity: line.quantity + qty }
                : line,
            ),
          })
          return
        }
        set({ items: [...get().items, { ...item, quantity: qty }] })
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((line) => line.productId !== productId) }),
      updateQuantity: (productId, quantity) => {
        const next = Math.floor(quantity)
        if (next <= 0) {
          set({ items: get().items.filter((line) => line.productId !== productId) })
          return
        }
        set({
          items: get().items.map((line) =>
            line.productId === productId ? { ...line, quantity: next } : line,
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: () => get().items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    }),
    {
      name: 'mashuf-cart-v2',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage),
      ),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
