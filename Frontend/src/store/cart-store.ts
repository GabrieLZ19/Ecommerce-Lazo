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
        console.log("[CART] addItem called", {
          product,
          size,
          color,
          quantity,
        });
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
          // Buscar el product_variant_id correcto
          let product_variant_id = "";
          if (product.product_variants && product.product_variants.length > 0) {
            // Si el usuario seleccionó color/talle, buscar el variant exacto
            let foundVariant = product.product_variants.find(
              (v) => v.size_id === size.id && v.color_id === color.id
            );
            // Si no hay coincidencia exacta, usar el primer variant disponible
            if (!foundVariant) {
              foundVariant = product.product_variants[0];
            }
            product_variant_id = foundVariant.id;
          } else {
            // Si el producto no tiene variantes, product_variant_id queda vacío
            console.warn(
              "[CART] product.product_variants está vacío o undefined",
              product
            );
          }
          // Si por alguna razón sigue vacío, forzar el primer variant si existe
          if (
            !product_variant_id &&
            product.product_variants &&
            product.product_variants.length > 0
          ) {
            product_variant_id = product.product_variants[0].id;
          }
          const newItem: CartItem = {
            id: `${product.id}-${size.id}-${color.id}`,
            product,
            size,
            color,
            quantity,
            price: product.price,
            product_variant_id,
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
