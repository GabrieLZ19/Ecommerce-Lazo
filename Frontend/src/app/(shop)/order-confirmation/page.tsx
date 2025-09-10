"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  Download,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  payment_fee: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  estimated_delivery?: string;
  tracking_number?: string;
  order_items: Array<{
    id: string;
    products?: {
      name?: string;
      images?: string[];
      sku?: string;
    };
    color?: string;
    size?: string;
    quantity?: number;
    price?: number;
    total?: number;
  }>;
  billing_address?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    address_number: string;
    floor?: string;
    apartment?: string;
    city: string;
    province: string;
    postal_code: string;
    notes?: string;
  };
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const orderId = searchParams.get("order_id");
  const paymentStatus = searchParams.get("payment_status");

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      // Obtener datos reales desde el backend
      const orderData = await import("@/services/order.service");
      const realOrder = await orderData.OrderService.getOrderById(orderId!);
      console.log("[ORDER API RESPONSE]", realOrder);

      // Normalizar forma de los datos: algunos endpoints/devs usan `items` y otros `order_items`.
      const normalized: any = {
        ...realOrder,
        // mantener compatibilidad: preferir `order_items`, si no existe usar `items`
        order_items:
          (realOrder as any).order_items || (realOrder as any).items || [],
        // normalizar dirección: preferir billing_address, si no usar shipping_address o billing_address_snapshot
        billing_address:
          (realOrder as any).billing_address ||
          (realOrder as any).shipping_address ||
          (realOrder as any).billing_address_snapshot ||
          null,
      };

      console.log("[ORDER API NORMALIZED]", normalized);
      setOrder(normalized as any);
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Error al cargar los detalles de la orden");
    } finally {
      setLoading(false);
    }
  };

  // Small component kept for local fallbacks but uses SafeImage
  function ProductThumb({ src, alt }: { src?: string | null; alt?: string }) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src || undefined);

    // Simple SVG placeholder data URL (small, no external dependency)
    const placeholder =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial, Helvetica, sans-serif' font-size='18'>Imagen no disponible</text></svg>`
      );

    const handleError = () => {
      setImgSrc(placeholder);
    };

    return (
      <SafeImage
        src={imgSrc || placeholder}
        alt={alt || "Producto"}
        className="object-cover rounded-md"
        sizes="64px"
        onError={handleError}
      />
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string, paymentStatus: string) => {
    if (paymentStatus === "approved") {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        title: "¡Pedido Confirmado!",
        description: "Tu pago fue procesado exitosamente",
      };
    } else if (paymentStatus === "pending") {
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        title: "Pago Pendiente",
        description: "Esperando confirmación del pago",
      };
    } else if (paymentStatus === "rejected") {
      return {
        icon: RefreshCw,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        title: "Pago Rechazado",
        description: "Hubo un problema con el pago",
      };
    } else {
      return {
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        title: "Orden Creada",
        description: "Tu orden ha sido registrada",
      };
    }
  };

  const handleRetryPayment = () => {
    setPaymentLoading(true);
    // Aquí iría la lógica para reintentar el pago
    setTimeout(() => {
      setPaymentLoading(false);
      // Simular redirección a MercadoPago
      window.open("https://mercadopago.com", "_blank");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando detalles de la orden...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Orden no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              {error || "No pudimos encontrar los detalles de tu orden"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status, order.payment_status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${statusInfo.bgColor}`}
          >
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">{statusInfo.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            {statusInfo.description}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <span>Orden #{order.order_number}</span>
            <span>•</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </div>

        {/* Payment Status Actions */}
        {order.payment_status === "rejected" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-red-800 mb-2">
                  El pago no pudo ser procesado
                </h3>
                <p className="text-red-600 mb-4">
                  Puedes intentar con otro método de pago o contactar a tu banco
                </p>
                <Button
                  onClick={handleRetryPayment}
                  disabled={paymentLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Reintentar Pago
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Timeline */}
        {order.payment_status === "approved" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Estado del Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Orden confirmada</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Preparando envío</p>
                    <p className="text-sm text-muted-foreground">En proceso</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-muted-foreground">
                      En camino
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fecha estimada:{" "}
                      {order.estimated_delivery
                        ? new Date(order.estimated_delivery).toLocaleDateString(
                            "es-AR"
                          )
                        : "Sin fecha estimada"}
                    </p>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">
                      Número de seguimiento:
                    </p>
                    <p className="text-blue-600 font-mono">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(order.order_items || []).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <SafeImage
                          src={
                            item.products?.images?.[0] ||
                            "/images/placeholder.png"
                          }
                          alt={item.products?.name || "Producto"}
                          className="object-cover rounded-md"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.products?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.color} • {item.size} • Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.products?.sku || "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>{formatPrice(item.total ?? item.price ?? 0)}</p>
                        <p>{formatPrice(item.price ?? 0)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.billing_address ? (
                  <div>
                    <p>
                      {order.billing_address.first_name}{" "}
                      {order.billing_address.last_name}
                    </p>
                    <p>
                      {order.billing_address.address}{" "}
                      {order.billing_address.address_number}
                      {order.billing_address.floor &&
                        `, Piso ${order.billing_address.floor}`}
                      {order.billing_address.apartment &&
                        `, Dto. ${order.billing_address.apartment}`}
                    </p>
                    <p>
                      {order.billing_address.city},{" "}
                      {order.billing_address.province}
                    </p>
                    <p>CP: {order.billing_address.postal_code}</p>
                    <p>{order.billing_address.email}</p>
                    <p>{order.billing_address.phone}</p>
                    {order.billing_address.notes && (
                      <p>Notas: {order.billing_address.notes}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    No se encontró la dirección de envío para esta orden.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>
                    {order.shipping_cost === 0 ? (
                      <span className="text-green-600 font-medium">Gratis</span>
                    ) : (
                      formatPrice(order.shipping_cost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (21%)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.payment_fee !== 0 && (
                  <div className="flex justify-between">
                    <span>
                      {order.payment_fee > 0 ? "Recargo" : "Descuento"} por pago
                    </span>
                    <span
                      className={
                        order.payment_fee > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {order.payment_fee > 0 ? "+" : ""}
                      {formatPrice(order.payment_fee)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Método de pago:</span>
                    <Badge variant="secondary">
                      {order.payment_method === "mercadopago"
                        ? "MercadoPago"
                        : "Transferencia"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estado del pago:</span>
                    <Badge
                      variant={
                        order.payment_status === "approved"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.payment_status === "approved"
                        ? "Aprobado"
                        : order.payment_status === "pending"
                        ? "Pendiente"
                        : "Rechazado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/profile?tab=orders">
                      <Package className="h-4 w-4 mr-2" />
                      Ver Mis Órdenes
                    </Link>
                  </Button>

                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/products">Seguir Comprando</Link>
                  </Button>

                  {order.payment_status === "approved" && (
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Factura
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si tienes alguna pregunta sobre tu orden, no dudes en
                  contactarnos.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar Soporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
