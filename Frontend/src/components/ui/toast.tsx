"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ShoppingCart,
  Heart,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Toast } from "@/contexts/toast-context";

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: "bg-green-50 border-green-200",
    icon: "text-green-600",
    text: "text-green-800",
    progress: "bg-green-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-600",
    text: "text-red-800",
    progress: "bg-red-500",
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: "text-yellow-600",
    text: "text-yellow-800",
    progress: "bg-yellow-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-800",
    progress: "bg-blue-500",
  },
};

export const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);

    // Handle progress bar
    if (toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (toast.duration! / 100);
          return Math.max(0, newProgress);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform",
        colors.bg,
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
      role="alert"
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-black/10 w-full">
          <div
            className={cn(
              "h-full transition-all duration-100 ease-linear",
              colors.progress
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className={cn("text-sm font-semibold mb-1", colors.text)}>
                {toast.title}
              </h4>
            )}
            <p className={cn("text-sm", colors.text)}>{toast.message}</p>

            {/* Action button */}
            {toast.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toast.action.onClick}
                  className={cn("text-xs", colors.text)}
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleRemove}
            className={cn(
              "flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors",
              colors.text
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Specialized toast components for common use cases
export const CartToast: React.FC<{
  productName: string;
  onViewCart: () => void;
  onRemove: (id: string) => void;
  id: string;
}> = ({ productName, onViewCart, onRemove, id }) => {
  return (
    <ToastComponent
      toast={{
        id,
        type: "success",
        title: "¡Producto agregado!",
        message: `${productName} fue agregado a tu carrito`,
        duration: 6000,
        action: {
          label: "Ver carrito",
          onClick: onViewCart,
        },
      }}
      onRemove={onRemove}
    />
  );
};

export const FavoriteToast: React.FC<{
  productName: string;
  isAdded: boolean;
  onRemove: (id: string) => void;
  id: string;
}> = ({ productName, isAdded, onRemove, id }) => {
  return (
    <ToastComponent
      toast={{
        id,
        type: isAdded ? "success" : "info",
        title: isAdded ? "¡Agregado a favoritos!" : "Eliminado de favoritos",
        message: `${productName} ${
          isAdded ? "fue agregado a" : "fue eliminado de"
        } tus favoritos`,
        duration: 4000,
      }}
      onRemove={onRemove}
    />
  );
};

export const OrderToast: React.FC<{
  orderNumber: string;
  onViewOrder: () => void;
  onRemove: (id: string) => void;
  id: string;
}> = ({ orderNumber, onViewOrder, onRemove, id }) => {
  return (
    <ToastComponent
      toast={{
        id,
        type: "success",
        title: "¡Pedido confirmado!",
        message: `Tu pedido #${orderNumber} ha sido procesado exitosamente`,
        duration: 8000,
        action: {
          label: "Ver pedido",
          onClick: onViewOrder,
        },
      }}
      onRemove={onRemove}
    />
  );
};
