"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/toast-context";
import { OrderService, Order } from "@/services/order.service";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <CheckoutSuccessContent />
    </ProtectedRoute>
  );
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { error: showError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "pending" | "error">(
    "pending",
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const externalReference = searchParams.get("external_reference");
        const orderId =
          externalReference || localStorage.getItem("last_order_id");

        if (!orderId) {
          setStatus("error");
          showError("No se encontró información del pago");
          setLoading(false);
          return;
        }

        let attempts = 0;
        const maxAttempts = 5; // 5 segundos máximo de polling
        let hasOrder = false;

        const tryFetch = async () => {
          try {
            const fetchedOrder = await OrderService.getOrderById(orderId);

            if (!fetchedOrder) {
              if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryFetch, 1000);
                return;
              }
              // Si no encuentra la orden después de 5s, error
              setStatus("error");
              setLoading(false);
              return;
            }

            hasOrder = true;
            setOrder(fetchedOrder);

            // Mostrar estado actual (pending o paid)
            if (fetchedOrder.payment_status === "paid") {
              setStatus("success");
            } else {
              setStatus("pending");
            }

            setLoading(false);
          } catch (error) {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(tryFetch, 1000);
            } else {
              // Después de 5s, si no hay orden, mostrar error
              if (!hasOrder) {
                setStatus("error");
                showError("Error al cargar la orden");
              }
              setLoading(false);
            }
          }
        };

        tryFetch();
      } catch (error) {
        setStatus("error");
        showError("Error");
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrder();
    }
  }, [user?.id, showError]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-600">Pago confirmado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pago pendiente</Badge>;
      case "error":
        return <Badge className="bg-red-600">Error en el pago</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de tu orden...</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto border-red-200">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle>Error en tu compra</CardTitle>
                <p className="text-sm text-red-600 mt-2">
                  Hubo un problema procesando tu orden
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-6">
              Por favor intenta nuevamente o contacta con nosotros si persisten
              los problemas.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/products")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Volver a comprar
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/profile?tab=orders")}
              >
                Ver mis pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {status === "success" ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <AlertCircle className="h-16 w-16 text-yellow-600" />
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {status === "success"
              ? "¡Gracias por tu compra!"
              : "Compra en proceso"}
          </h1>

          <p className="text-gray-600 text-lg">
            {status === "success"
              ? "Tu orden ha sido confirmada exitosamente."
              : "Tu orden está pendiente de confirmación de pago."}
          </p>
        </div>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Resumen de orden
              </CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Número de orden</p>
                <p className="font-mono font-bold">{order.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha</p>
                <p>{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Método de pago</p>
                <p className="capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-600">Método de envío</p>
                <p className="capitalize">
                  {order.shipping_method || "Standard"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div>
              <h3 className="flex items-center font-semibold mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                Dirección de envío
              </h3>
              <div className="bg-gray-50 p-4 rounded text-sm space-y-1">
                <p>
                  {order.shipping_address?.first_name}{" "}
                  {order.shipping_address?.last_name}
                </p>
                <p>{order.shipping_address?.address}</p>
                {order.shipping_address?.apartment && (
                  <p>Depto: {order.shipping_address.apartment}</p>
                )}
                <p>
                  {order.shipping_address?.city},{" "}
                  {order.shipping_address?.province}
                </p>
                <p>{order.shipping_address?.postal_code}</p>
                <p className="pt-2 text-gray-600">
                  📞 {order.shipping_address?.phone}
                </p>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Productos</h3>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded"
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                      {item.product_image && (
                        <SafeImage
                          src={item.product_image}
                          alt={item.product_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.size} - {item.color}
                      </p>
                      <p className="text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.unit_price)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impuestos</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/profile?tab=orders")}
            className="px-8"
          >
            <Package className="h-4 w-4 mr-2" />
            Ver mis pedidos
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/products")}
            className="px-8"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Seguir comprando
          </Button>
        </div>

        {/* Info Message */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              📧 Se ha enviado un email de confirmación a{" "}
              <strong>{order.shipping_address?.email}</strong> con todos los
              detalles de tu orden. Podrás seguir el estado de tu envío desde tu
              perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
