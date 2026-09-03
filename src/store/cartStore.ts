import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        const addQty = item.quantity || 1;
        const maxStock = typeof item.stockQuantity === 'number' ? item.stockQuantity : 999;

        if (maxStock <= 0) {
          return; // Cannot add out of stock items
        }

        if (existingItem) {
          const newQty = Math.min(existingItem.quantity + addQty, maxStock);
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty, stockQuantity: maxStock } : i
            ),
            isOpen: true,
          });
        } else {
          const initialQty = Math.min(addQty, maxStock);
          set({ 
            items: [...currentItems, { 
              id: item.id,
              title: item.title,
              price: item.price,
              image: item.image,
              quantity: initialQty,
              stockQuantity: maxStock
            }],
            isOpen: true,
          });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i;
            const maxStock = typeof i.stockQuantity === 'number' ? i.stockQuantity : 999;
            const clampedQty = Math.min(quantity, maxStock);
            return { ...i, quantity: clampedQty };
          }),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'sentinel-ai-cart',
      partialize: (state) => ({ items: state.items }), // don't persist isOpen
    }
  )
);
