"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

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

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items_count: number;
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

  // Password change state
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

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(passwordData.newPassword);

      if (error) {
        setError(error);
        return;
      }

      setSuccess("Contraseña cambiada correctamente");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña");
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const },
      processing: { label: "Procesando", variant: "default" as const },
      shipped: { label: "Enviado", variant: "default" as const },
      delivered: { label: "Entregado", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <div className="flex space-x-1 mb-8 border-b">
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile")}
            className="rounded-b-none"
          >
            <User className="h-4 w-4 mr-2" />
            Información Personal
          </Button>
          <Button
            variant={activeTab === "password" ? "default" : "ghost"}
            onClick={() => setActiveTab("password")}
            className="rounded-b-none"
          >
            <Settings className="h-4 w-4 mr-2" />
            Cambiar Contraseña
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
            className="rounded-b-none"
          >
            <Package className="h-4 w-4 mr-2" />
            Mis Órdenes
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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

        {/* Password Tab */}
        {activeTab === "password" && (
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
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

                <div>
                  <Label htmlFor="new_password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
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
                </div>

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
                      minLength={6}
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
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Cambiar Contraseña
                  </Button>
                </div>
              </form>
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
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">
                    No tienes órdenes aún
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cuando realices tu primera compra, aparecerá aquí
                  </p>
                  <Button onClick={() => router.push("/products")}>
                    Explorar Productos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <Package className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">Orden #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)} • {order.items_count}{" "}
                            productos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(order.total)}</p>
                        {getStatusBadge(order.status)}
                      </div>
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
