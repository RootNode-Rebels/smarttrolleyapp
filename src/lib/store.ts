import { create } from 'zustand'

export type CartItem = {
  barcode: string
  name: string
  price: number
  qty: number
  imageUrl?: string | null
}

interface CartState {
  cart: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (barcode: string) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  addItem: (item) => {
    set((state) => {
      const existing = state.cart.find((i) => i.barcode === item.barcode)
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.barcode === item.barcode ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return { cart: [...state.cart, { ...item, qty: 1 }] }
    })
  },
  removeItem: (barcode) => {
    set((state) => ({
      cart: state.cart.filter((i) => i.barcode !== barcode),
    }))
  },
  clearCart: () => set({ cart: [] }),
  getTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.qty, 0)
  },
}))
