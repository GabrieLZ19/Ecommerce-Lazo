"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, ArrowRight } from "lucide-react";

export default function ConfirmPasswordChangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    confirmChange();
  }, []);

  const confirmChange = async () => {
    try {
      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      if (!token || !userId) {
        setStatus("error");
        setMessage("Token o userId inválido");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/confirm-password-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Error al confirmar");
        return;
      }

      setStatus("success");
      setMessage("¡Contraseña actualizada!");

      // Cerrar sesión local para forzar re-login (evita sesión inconsistente)

      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.warn("signOut error:", signOutError);
        else console.log("Cliente: signOut exitoso");

        // Forzar recarga para que la app re-evalúe el estado de auth
        // (esto evitará re-hidrataciones desde memoria)
        window.location.href = "/login";
        return;
      } catch (err) {
        console.warn("Error during signOut:", err);
      }

      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      setStatus("error");
      setMessage("Error al procesar la confirmación");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-950">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-2xl text-gray-100">
            Confirmación de Cambio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
              </div>
              <p className="text-center text-gray-400">
                Verificando tu confirmación...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30 border border-green-500/50">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  {message}
                </h3>
                <p className="text-sm text-gray-400">
                  Tu contraseña ha sido cambiada exitosamente. Redirigiendo al
                  login...
                </p>
              </div>
              <Button
                asChild
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                <a href="/login">
                  Ir al Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 border border-red-500/50">
                <X className="h-8 w-8 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  Error
                </h3>
                <p className="text-sm text-gray-400 mb-4">{message}</p>
                <p className="text-xs text-gray-500">
                  Si el problema persiste, solicita un nuevo enlace de
                  confirmación.
                </p>
              </div>
              <div className="w-full space-y-2">
                <Button
                  onClick={() => router.push("/profile?tab=password")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Solicitar Nuevo Enlace
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-700 hover:bg-gray-900"
                >
                  <a href="/login">Ir al Login</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
