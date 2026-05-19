"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  Edit,
  ExternalLink,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { OrderService, Order as OrderType } from "@/services/order.service";
import { validators } from "@/lib/validators";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

function ProfilePageContent() {
  const {
    user,
    signOut,
    updateProfile,
    updatePassword,

    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Argentina",
  });

  // Password change state - MEJORADO
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordRequirements, setPasswordRequirements] = useState<any>(null);
  const [passwordStep, setPasswordStep] = useState(1); // 1: Cambiar, 2: Confirmar por email

  // Orders state
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Handle tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "password", "orders"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && user && !ordersLoading) {
      loadOrders();
    }
  }, [activeTab, user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setOrdersLoading(true);
      const userOrders = await OrderService.getOrdersByUser(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        email: user.email || "",
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone || "",
        date_of_birth: user.user_metadata?.date_of_birth || "",
        gender: user.user_metadata?.gender || "",
        address: user.user_metadata?.address || "",
        city: user.user_metadata?.city || "",
        state: user.user_metadata?.state || "",
        postal_code: user.user_metadata?.postal_code || "",
        country: user.user_metadata?.country || "Argentina",
      }));
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        postal_code: profile.postal_code,
        country: profile.country,
      });

      if (error) {
        setError(error);
        return;
      }

      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // MEJORADO: Validar nueva contraseña
  const handleNewPasswordChange = (value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      newPassword: value,
    }));

    const result = validators.password(value);
    setPasswordRequirements(result.requirements);
  };

  // PASO 1: Enviar email de confirmación - SEGURO
  const handleSendConfirmationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validar contraseña actual
    if (!passwordData.currentPassword) {
      setError("Ingresa tu contraseña actual");
      setLoading(false);
      return;
    }

    // Validar nueva contraseña
    const passwordResult = validators.password(passwordData.newPassword);
    if (!passwordResult.valid) {
      setError(
        passwordResult.message || "La contraseña no cumple los requisitos",
      );
      setLoading(false);
      return;
    }

    // Validar coincidencia
    const matchResult = validators.passwordsMatch(
      passwordData.newPassword,
      passwordData.confirmPassword,
    );
    if (!matchResult.valid) {
      setError(matchResult.message || "Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Evitar cambiar por la misma contraseña
    if (passwordData.currentPassword === passwordData.newPassword) {
      setError("La nueva contraseña no puede ser igual a la contraseña actual");
      setLoading(false);
      return;
    }

    try {
      // Usar el servicio (token manejado internamente)
      const { PasswordService } = await import("@/services/password.service");
      const result = await PasswordService.sendPasswordChangeConfirmation(
        user?.email || "",
        passwordData.currentPassword,
        passwordData.newPassword,
      );

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setSuccess(
        "Se ha enviado un email de confirmación a tu correo. Por favor verifica tu bandeja de entrada.",
      );
      setPasswordStep(2);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(
        err.message ||
          "Error al enviar el email de confirmación. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reenviar email de confirmación (sin necesidad de contraseñas)
  const handleResendConfirmationEmail = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Solo reenviamos el email con el usuario autenticado
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/resend-password-change-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: user?.email,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al reenviar el email");
      }

      setSuccess(
        "Email de confirmación reenviado. Revisa tu bandeja de entrada.",
      );
    } catch (err: any) {
      setError(
        err.message || "Error al reenviar el email. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err: any) {
      setError("Error al cerrar sesión");
    }
  };

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y preferencias
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b overflow-x-auto">
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile")}
            className="rounded-b-none whitespace-nowrap"
          >
            <User className="h-4 w-4 mr-2" />
            Información Personal
          </Button>
          <Button
            variant={activeTab === "password" ? "default" : "ghost"}
            onClick={() => setActiveTab("password")}
            className="rounded-b-none whitespace-nowrap"
          >
            <Settings className="h-4 w-4 mr-2" />
            Cambiar Contraseña
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
            className="rounded-b-none whitespace-nowrap"
          >
            <Package className="h-4 w-4 mr-2" />
            Mis Órdenes
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex gap-2">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={profile.first_name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={profile.last_name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    El email no se puede cambiar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          date_of_birth: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) =>
                      setProfile((prev) => ({ ...prev, gender: value }))
                    }
                    disabled={!isEditing || loading}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefiero no decir
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    type="text"
                    value={profile.address || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    disabled={!isEditing || loading}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Calle y número"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      type="text"
                      value={profile.city || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Provincia</Label>
                    <Input
                      id="state"
                      type="text"
                      value={profile.state || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Código Postal</Label>
                    <Input
                      id="postal_code"
                      type="text"
                      value={profile.postal_code || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          postal_code: e.target.value,
                        }))
                      }
                      disabled={!isEditing || loading}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Password Tab - MEJORADO */}
        {activeTab === "password" && (
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordStep === 1 ? (
                // PASO 1: Ingresar contraseñas
                <form
                  onSubmit={handleSendConfirmationEmail}
                  className="space-y-6"
                >
                  {/* Contraseña Actual */}
                  <div>
                    <Label htmlFor="current_password">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        required
                        disabled={loading}
                        placeholder="Tu contraseña actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <Label htmlFor="new_password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handleNewPasswordChange(e.target.value)
                        }
                        required
                        disabled={loading}
                        placeholder="Mínimo 8 caracteres"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Requisitos de contraseña */}
                    {passwordRequirements && (
                      <div className="mt-3 rounded-md bg-muted p-3 space-y-2">
                        <p className="text-xs font-semibold">Requisitos:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex gap-2 items-center">
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
                          <div className="flex gap-2 items-center">
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
                          <div className="flex gap-2 items-center">
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
                          <div className="flex gap-2 items-center">
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

                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <Label htmlFor="confirm_password">
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                        disabled={loading}
                        placeholder="Repite tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordData.newPassword &&
                      passwordData.confirmPassword &&
                      passwordData.newPassword !==
                        passwordData.confirmPassword && (
                        <p className="text-xs text-destructive mt-1 flex gap-1">
                          <X className="h-3 w-3" /> Las contraseñas no coinciden
                        </p>
                      )}
                    {passwordData.newPassword &&
                      passwordData.confirmPassword &&
                      passwordData.newPassword ===
                        passwordData.confirmPassword && (
                        <p className="text-xs text-green-600 mt-1 flex gap-1">
                          <Check className="h-3 w-3" /> Las contraseñas
                          coinciden
                        </p>
                      )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !==
                          passwordData.confirmPassword
                      }
                    >
                      {loading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Enviar Confirmación por Email
                    </Button>
                  </div>
                </form>
              ) : (
                // PASO 2: Confirmación por Email
                <div className="py-12 px-6">
                  <div className="max-w-lg mx-auto">
                    {/* Icono animado */}
                    <div className="flex justify-center mb-8">
                      <div className="p-4 bg-blue-50 rounded-full">
                        <Mail className="h-12 w-12 text-blue-600 animate-pulse" />
                      </div>
                    </div>

                    {/* Título */}
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                      Confirmación Enviada
                    </h3>
                    <p className="text-center text-gray-600 mb-8">
                      Hemos enviado un enlace de confirmación a:
                    </p>
                    <p className="text-center text-lg font-semibold text-blue-600 break-all mb-8">
                      {user?.email}
                    </p>

                    {/* Pasos a seguir */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Pasos a seguir:
                      </h4>
                      <ol className="space-y-4">
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                            1
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700">
                              Abre tu cliente de correo electrónico
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                            2
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700">
                              Busca el correo con asunto "Cambio de Contraseña -
                              LAZO"
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Revisa también la carpeta de spam o correo no
                              deseado
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                            3
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700">
                              Haz clic en el enlace "Confirmar Cambio de
                              Contraseña"
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                            4
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700">
                              Tu contraseña se actualizará automáticamente
                            </p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    {/* Aviso de seguridad */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                      <p className="text-sm text-amber-900">
                        <span className="font-semibold">Nota importante:</span>{" "}
                        El enlace de confirmación expira en 1 hora. Si no
                        realizaste esta solicitud, puedes ignorar este correo.
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setPasswordStep(1);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setPasswordRequirements(null);
                        }}
                        disabled={loading}
                      >
                        Volver Atrás
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleResendConfirmationEmail}
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Reenviar Confirmación
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Órdenes</CardTitle>
              <CardDescription>
                Revisa tus compras anteriores y su estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando órdenes...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">
                    No tienes órdenes aún
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ¡Comienza a comprar en LAZO hoy!
                  </p>
                  <Button asChild>
                    <a href="/products">Ver Productos</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Orden #{order.id}</span>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {order.status === "completed"
                            ? "Completada"
                            : order.status === "pending"
                              ? "Pendiente"
                              : "Cancelada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-AR")}
                      </p>
                      <p className="font-semibold text-lg mt-2">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
