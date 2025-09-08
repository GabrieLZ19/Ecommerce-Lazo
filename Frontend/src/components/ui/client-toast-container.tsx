"use client";

import dynamic from "next/dynamic";

// Dynamically import ToastContainer with no SSR
const ToastContainer = dynamic(
  () =>
    import("@/components/ui/toast-container").then((mod) => ({
      default: mod.ToastContainer,
    })),
  {
    ssr: false,
  }
);

export const ClientToastContainer = () => {
  return <ToastContainer />;
};
