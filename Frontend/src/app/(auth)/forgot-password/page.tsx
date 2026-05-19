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
import { Loader2, Check, X } from "lucide-react";
import { validators } from "@/lib/validators";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const { resetPassword } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const result = validators.email(value);
    setEmailError(result.message || "");

    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = validators.email(email);
    if (!result.valid) {
      setEmailError(result.message || "");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-center text-green-900 flex items-center justify-center gap-2">
                <Check className="h-5 w-5" /> ¡Email Enviado!
              </CardTitle>
              <CardDescription className="text-center text-green-800">
                Si esta cuenta existe en nuestro sistema, recibirás un email
                <br />
                con instrucciones para resetear tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-4">
              <p className="text-sm text-muted-foreground text-center">
                Por favor revisa tu bandeja de entrada y spam.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Volver al Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email para recibir instrucciones
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resetear Contraseña</CardTitle>
            <CardDescription>
              Te enviaremos un link para crear una nueva contraseña
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex gap-2">
                  <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
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
                  onChange={handleEmailChange}
                  required
                  disabled={loading}
                  className={emailError ? "border-destructive" : ""}
                />
                {emailError && (
                  <p className="text-xs text-destructive flex gap-1">
                    <X className="h-3 w-3" /> {emailError}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !!emailError}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Email de Recuperación
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Volver al login
                </Link>
              </div>
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
      <ForgotPasswordContent />
    </ProtectedRoute>
  );
}
