import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState, CartItem } from "@/types/cart";
import { Product, Size, Color } from "@/types/product";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemsCount: 0,

      addItem: (product: Product, size: Size, color: Color, quantity = 1) => {
        const existingItemIndex = get().items.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.size.id === size.id &&
            item.color.id === color.id
        );

        if (existingItemIndex >= 0) {
          // Si el item ya existe, incrementar la cantidad
          const updatedItems = [...get().items];
          updatedItems[existingItemIndex].quantity += quantity;

          set((state) => ({
            items: updatedItems,
            total: calculateTotal(updatedItems),
            itemsCount: calculateItemsCount(updatedItems),
          }));
        } else {
          // Si es un item nuevo, agregarlo
          const newItem: CartItem = {
            id: `${product.id}-${size.id}-${color.id}`,
            product,
            size,
            color,
            quantity,
            price: product.price,
          };

          const updatedItems = [...get().items, newItem];

          set((state) => ({
            items: updatedItems,
            total: calculateTotal(updatedItems),
            itemsCount: calculateItemsCount(updatedItems),
          }));
        }
      },

      removeItem: (itemId: string) => {
        const updatedItems = get().items.filter((item) => item.id !== itemId);

        set((state) => ({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemsCount: calculateItemsCount(updatedItems),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set((state) => ({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemsCount: calculateItemsCount(updatedItems),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemsCount: 0,
        });
      },

      getItemTotal: (itemId: string) => {
        const item = get().items.find((item) => item.id === itemId);
        return item ? item.price * item.quantity : 0;
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function calculateItemsCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
