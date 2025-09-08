import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";

export const useCartToast = () => {
  const { success } = useToast();
  const router = useRouter();

  const showCartToast = (productName: string) => {
    success(`${productName} agregado al carrito`, {
      title: "¡Producto agregado!",
      duration: 6000,
      action: {
        label: "Ver carrito",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return { showCartToast };
};

export const useFavoriteToast = () => {
  const { success, info } = useToast();

  const showFavoriteToast = (productName: string, isAdded: boolean) => {
    if (isAdded) {
      success(`${productName} agregado a favoritos`, {
        title: "¡Agregado a favoritos!",
        duration: 4000,
      });
    } else {
      info(`${productName} eliminado de favoritos`, {
        title: "Eliminado de favoritos",
        duration: 3000,
      });
    }
  };

  return { showFavoriteToast };
};

export const useOrderToast = () => {
  const { success } = useToast();
  const router = useRouter();

  const showOrderToast = (orderNumber: string) => {
    success(`Tu pedido #${orderNumber} ha sido procesado`, {
      title: "¡Pedido confirmado!",
      duration: 8000,
      action: {
        label: "Ver pedido",
        onClick: () => router.push(`/profile/orders/${orderNumber}`),
      },
    });
  };

  return { showOrderToast };
};

export const useErrorToast = () => {
  const { error } = useToast();

  const showErrorToast = (message: string, title?: string) => {
    error(message, {
      title: title || "Error",
      duration: 7000,
    });
  };

  return { showErrorToast };
};

export const useSuccessToast = () => {
  const { success } = useToast();

  const showSuccessToast = (
    message: string,
    title?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    success(message, {
      title: title || "¡Éxito!",
      duration: 5000,
      action,
    });
  };

  return { showSuccessToast };
};
