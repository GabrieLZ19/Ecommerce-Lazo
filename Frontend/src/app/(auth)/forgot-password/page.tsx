"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

function ForgotPasswordPageContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await resetPassword(email);

      if (error) {
        setError(error);
        return;
      }

      if (data) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Email enviado</CardTitle>
              <CardDescription>
                Hemos enviado un enlace de restablecimiento de contraseña a{" "}
                <strong>{email}</strong>
                <br />
                <br />
                Revisa tu bandeja de entrada y sigue las instrucciones para
                restablecer tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Enviar a otro email
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email y te enviaremos un enlace para restablecer tu
            contraseña
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>
              Te enviaremos un enlace de restablecimiento a tu email
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar enlace de restablecimiento
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <ForgotPasswordPageContent />
    </ProtectedRoute>
  );
}
