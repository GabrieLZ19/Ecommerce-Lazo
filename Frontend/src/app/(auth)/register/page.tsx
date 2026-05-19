"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff, Loader2, Check, X, ChevronRight } from "lucide-react";
import { validators } from "@/lib/validators";

function RegisterPageContent() {
  const [step, setStep] = useState(1); // 1: Datos básicos, 2: Contraseña
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [passwordRequirements, setPasswordRequirements] = useState<any>(null);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "phone") {
      processedValue = value.replace(/[^0-9\s\-\+]/g, "");
      if (processedValue.length > 20) {
        processedValue = processedValue.slice(0, 20);
      }
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    let fieldError = "";
    switch (name) {
      case "firstName":
      case "lastName": {
        const result = validators.name(processedValue);
        fieldError = result.message || "";
        break;
      }
      case "email": {
        const result = validators.email(processedValue);
        fieldError = result.message || "";
        break;
      }
      case "phone": {
        const result = validators.phone(processedValue);
        fieldError = result.message || "";
        break;
      }
      case "password": {
        const result = validators.password(processedValue);
        fieldError = result.message || "";
        setPasswordRequirements(result.requirements);
        break;
      }
      case "confirmPassword": {
        const result = validators.passwordsMatch(
          formData.password,
          processedValue,
        );
        fieldError = result.message || "";
        break;
      }
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    if (error) {
      setError("");
    }
  };

  const validateStep1 = () => {
    const errors: { [key: string]: string } = {};

    let result = validators.name(formData.firstName);
    if (!result.valid) errors.firstName = result.message || "";

    result = validators.name(formData.lastName);
    if (!result.valid) errors.lastName = result.message || "";

    result = validators.email(formData.email);
    if (!result.valid) errors.email = result.message || "";

    if (formData.phone) {
      result = validators.phone(formData.phone);
      if (!result.valid) errors.phone = result.message || "";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};

    let result = validators.password(formData.password);
    if (!result.valid) errors.password = result.message || "";

    result = validators.passwordsMatch(
      formData.password,
      formData.confirmPassword,
    );
    if (!result.valid) errors.confirmPassword = result.message || "";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setError("");
      setStep(2);
    } else {
      setError("Por favor completa los campos requeridos correctamente");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateStep2()) {
      setError("Por favor corrige los errores antes de continuar");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });

      if (error) {
        let errorMessage = error;
        if (
          error.includes("User already registered") ||
          error.includes("already")
        ) {
          errorMessage =
            "Este email ya está registrado. Intenta iniciar sesión.";
        } else if (error.includes("Invalid email")) {
          errorMessage = "El formato del email no es válido.";
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-center text-green-900 flex items-center justify-center gap-2">
                <Check className="h-5 w-5" /> ¡Cuenta creada!
              </CardTitle>
              <CardDescription className="text-center text-green-800">
                Se ha enviado un email de confirmación.
                <br />
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Ir al Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center  py-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">LAZO</h1>
          <p className="text-sm text-muted-foreground">
            Crea tu cuenta y comienza a comprar
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>Paso {step} de 2</CardDescription>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                {step}/2
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </CardHeader>

          {step === 1 ? (
            // PASO 1: Datos básicos
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextStep();
              }}
            >
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex gap-2">
                    <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Nombre y Apellido en grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs">
                      Nombre
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={`text-sm ${fieldErrors.firstName ? "border-destructive" : ""}`}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-xs text-destructive">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs">
                      Apellido
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Pérez"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={`text-sm ${fieldErrors.lastName ? "border-destructive" : ""}`}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-xs text-destructive">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={`text-sm ${fieldErrors.email ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs">
                    Teléfono (Opcional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+54 11 1234-5678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`text-sm ${fieldErrors.phone ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full gap-2">
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          ) : (
            // PASO 2: Contraseña
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex gap-2">
                    <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={`text-sm pr-10 ${fieldErrors.password ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.password}
                    </p>
                  )}

                  {/* Requisitos compactos */}
                  {passwordRequirements && (
                    <div className="mt-2 rounded-md bg-muted p-2 space-y-1">
                      <p className="text-xs font-semibold">Requisitos:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex gap-1 items-center">
                          {passwordRequirements.hasMinLength ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={
                              passwordRequirements.hasMinLength
                                ? "text-green-600"
                                : ""
                            }
                          >
                            8 caracteres
                          </span>
                        </div>
                        <div className="flex gap-1 items-center">
                          {passwordRequirements.hasUpperCase ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={
                              passwordRequirements.hasUpperCase
                                ? "text-green-600"
                                : ""
                            }
                          >
                            Mayúscula
                          </span>
                        </div>
                        <div className="flex gap-1 items-center">
                          {passwordRequirements.hasLowerCase ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={
                              passwordRequirements.hasLowerCase
                                ? "text-green-600"
                                : ""
                            }
                          >
                            Minúscula
                          </span>
                        </div>
                        <div className="flex gap-1 items-center">
                          {passwordRequirements.hasNumber ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={
                              passwordRequirements.hasNumber
                                ? "text-green-600"
                                : ""
                            }
                          >
                            Número
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className={`text-sm pr-10 ${fieldErrors.confirmPassword ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    loading ||
                    !!fieldErrors.password ||
                    !!fieldErrors.confirmPassword
                  }
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Cuenta
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Link a Login */}
        <div className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <RegisterPageContent />
    </ProtectedRoute>
  );
}
