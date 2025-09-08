"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export const useClientCart = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const cartStore = useCartStore();

  useEffect(() => {
    // Simple client-side check
    setIsHydrated(true);
  }, []);

  // Always return the store data, but with a flag to indicate hydration status
  return {
    ...cartStore,
    isHydrated,
  };
};
