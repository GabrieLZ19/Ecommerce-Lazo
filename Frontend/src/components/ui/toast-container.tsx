"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/contexts/toast-context";
import { ToastComponent } from "@/components/ui/toast";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render after hydration is complete
  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
};
