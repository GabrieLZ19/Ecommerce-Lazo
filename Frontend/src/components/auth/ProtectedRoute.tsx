"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  requireAuth = true,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si requiere autenticación y no hay usuario, redirigir
      if (requireAuth && !user) {
        router.push(redirectTo);
        return;
      }

      // Si no requiere autenticación y hay usuario, redirigir (ej: páginas de login)
      if (!requireAuth && user) {
        router.push("/profile");
        return;
      }

      // Verificar roles si se especificaron
      if (user && allowedRoles.length > 0) {
        const userRole = user.user_metadata?.role || "user";
        if (!allowedRoles.includes(userRole)) {
          router.push("/");
          return;
        }
      }
    }
  }, [user, loading, requireAuth, allowedRoles, redirectTo, router]);

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario, no mostrar nada (se está redirigiendo)
  if (requireAuth && !user) {
    return null;
  }

  // Si no requiere autenticación y hay usuario, no mostrar nada (se está redirigiendo)
  if (!requireAuth && user) {
    return null;
  }

  // Verificar roles
  if (user && allowedRoles.length > 0) {
    const userRole = user.user_metadata?.role || "user";
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}
