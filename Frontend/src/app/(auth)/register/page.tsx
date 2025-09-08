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
import { Eye, EyeOff, Loader2 } from "lucide-react";

function RegisterPageContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const { signUp } = useAuth();
  const router = useRouter();

  // Función para validar teléfono en tiempo real
  // Validación en tiempo real de campos
  const validateField = (name: string, value: string) => {
    const errors: { [key: string]: string } = {};

    switch (name) {
      case "firstName":
        if (!value.trim()) {
          errors.firstName = "El nombre es obligatorio";
        } else if (value.trim().length < 2) {
          errors.firstName = "El nombre debe tener al menos 2 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          errors.firstName = "El nombre solo puede contener letras";
        }
        break;

      case "lastName":
        if (!value.trim()) {
          errors.lastName = "El apellido es obligatorio";
        } else if (value.trim().length < 2) {
          errors.lastName = "El apellido debe tener al menos 2 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          errors.lastName = "El apellido solo puede contener letras";
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = "El email es obligatorio";
        } else if (!emailRegex.test(value)) {
          errors.email = "Ingresa un email válido";
        }
        break;

      case "phone":
        const cleanPhone = value.replace(/\D/g, "");
        if (value && cleanPhone.length > 0 && cleanPhone.length < 8) {
          errors.phone = "El teléfono debe tener al menos 8 dígitos";
        } else if (value && cleanPhone.length > 10) {
          errors.phone = "El teléfono no puede tener más de 10 dígitos";
        }
        break;

      case "password":
        if (!value) {
          errors.password = "La contraseña es obligatoria";
        } else if (value.length < 6) {
          errors.password = "La contraseña debe tener al menos 6 caracteres";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/.test(value)) {
          errors.password =
            "La contraseña debe tener al menos una mayúscula o un número";
        }
        break;

      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Confirma tu contraseña";
        } else if (value !== formData.password) {
          errors.confirmPassword = "Las contraseñas no coinciden";
        }
        break;
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Validación específica para teléfono (solo permitir números y algunos caracteres especiales)
    if (name === "phone") {
      // Permitir solo números, espacios, guiones y el signo +
      const phoneRegex = /[^0-9\s\-\+]/g;
      processedValue = value.replace(phoneRegex, "");

      // Limitar longitud
      if (processedValue.length > 20) {
        processedValue = processedValue.slice(0, 20);
      }
    }

    // Actualizar el valor
    setFormData({
      ...formData,
      [name]: processedValue,
    });

    // Validar en tiempo real
    const fieldValidationErrors = validateField(name, processedValue);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldValidationErrors[name] || "",
    }));

    // Limpiar error general si se está corrigiendo
    if (error) {
      setError("");
    }
  };

  // Validación completa del formulario
  const validateForm = () => {
    const allErrors: { [key: string]: string } = {};

    // Validar todos los campos
    Object.keys(formData).forEach((field) => {
      const fieldErrors = validateField(
        field,
        formData[field as keyof typeof formData]
      );
      Object.assign(allErrors, fieldErrors);
    });

    // Validaciones adicionales
    if (formData.password !== formData.confirmPassword) {
      allErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setFieldErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar formulario completo
    if (!validateForm()) {
      setError("Por favor corrige los errores antes de continuar");
      setLoading(false);
      return;
    }

    try {
      console.log("Iniciando registro con:", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      const { data, error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });

      console.log("Respuesta de signUp:", { data, error });

      if (error) {
        // Manejar errores específicos de Supabase
        let errorMessage = error;

        if (error.includes("User already registered")) {
          errorMessage =
            "Este email ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.";
        } else if (error.includes("email") && error.includes("already")) {
          errorMessage =
            "Este email ya está en uso. Intenta con otro email o inicia sesión.";
        } else if (error.includes("Invalid email")) {
          errorMessage = "El formato del email no es válido.";
        } else if (error.includes("Password")) {
          errorMessage = "La contraseña no cumple con los requisitos mínimos.";
        } else if (error.includes("rate limit")) {
          errorMessage =
            "Demasiados intentos. Espera unos minutos antes de intentar nuevamente.";
        }

        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("Registro exitoso:", data);
        setSuccess(true);
        // Redirigir después de un momento
        setTimeout(() => {
          router.push("/login");
        }, 3000);
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
            <CardHeader>
              <CardTitle className="text-center">¡Cuenta creada!</CardTitle>
              <CardDescription className="text-center">
                Se ha enviado un email de confirmación a tu correo.
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
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos para crear tu cuenta en LAZO
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Crea tu cuenta para comenzar a comprar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={fieldErrors.firstName ? "border-red-500" : ""}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-sm text-red-500">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={fieldErrors.lastName ? "border-red-500" : ""}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-sm text-red-500">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={fieldErrors.phone ? "border-red-500" : ""}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-500">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={fieldErrors.password ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cuenta
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Inicia sesión aquí
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
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
