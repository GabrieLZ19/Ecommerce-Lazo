"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  Truck,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useClientCart } from "@/hooks/useClientCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/toast-context";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressNumber: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fee: number; // Percentage fee
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "mercadopago",
    name: "MercadoPago",
    description: "Tarjetas de crédito y débito",
    icon: <CreditCard className="h-5 w-5" />,
    fee: 0,
  },
  {
    id: "bank_transfer",
    name: "Transferencia Bancaria",
    description: "10% de descuento",
    icon: <CreditCard className="h-5 w-5" />,
    fee: -10,
  },
];

const argentineProvinces = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, itemsCount, clearCart } = useClientCart();
  const { success: showSuccess, error: showError } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("mercadopago");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    addressNumber: "",
    floor: "",
    apartment: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  // Actualizar formulario con datos del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
        city: user.user_metadata?.city || "",
        province: user.user_metadata?.state || "",
        postalCode: user.user_metadata?.postal_code || "",
      }));
    }
    setIsLoadingUserData(false);
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50000 ? 0 : 5000;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.21;
  };

  const getPaymentMethodFee = () => {
    const method = paymentMethods.find((m) => m.id === selectedPaymentMethod);
    if (!method) return 0;

    const subtotal = calculateSubtotal();
    return (subtotal * method.fee) / 100;
  };

  const calculateFinalTotal = () => {
    return (
      calculateSubtotal() +
      calculateShipping() +
      calculateTax() +
      getPaymentMethodFee()
    );
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "addressNumber",
      "city",
      "province",
      "postalCode",
    ];

    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        showError(`El campo ${field} es obligatorio`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      showError("Por favor ingresa un email válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Aquí iría la integración con MercadoPago
      const orderData = {
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: `${item.product.id}-${item.color.id}-${item.size.id}`,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        shipping_address: shippingAddress,
        payment_method: selectedPaymentMethod,
        totals: {
          subtotal: calculateSubtotal(),
          shipping: calculateShipping(),
          tax: calculateTax(),
          payment_fee: getPaymentMethodFee(),
          total: calculateFinalTotal(),
        },
      };

      console.log("Order data:", orderData);

      // Simular procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (selectedPaymentMethod === "bank_transfer") {
        // Para transferencia bancaria, mostrar datos y marcar como pendiente
        showSuccess(
          "Orden creada exitosamente. Te enviaremos los datos bancarios por email."
        );
        clearCart();
        router.push("/profile?tab=orders");
      } else {
        // Para MercadoPago, redirigir a la URL de pago
        showSuccess("Redirigiendo a MercadoPago...");
        // Aquí iría la redirección real a MercadoPago
        // window.location.href = mercadopagoUrl;
        clearCart();
        router.push("/profile?tab=orders");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      showError("Error al procesar la orden. Por favor intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Button variant="ghost" onClick={() => router.push("/cart")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al carrito
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Dirección de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      Nombre *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Juan"
                      disabled={isLoadingUserData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Apellido *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Pérez"
                      disabled={isLoadingUserData}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">
                      Email *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="juan@ejemplo.com"
                      disabled={isLoadingUserData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      Teléfono *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+54 9 11 1234-5678"
                      disabled={isLoadingUserData}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="address">
                      Dirección *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Av. Corrientes"
                      disabled={isLoadingUserData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressNumber">Número *</Label>
                    <Input
                      id="addressNumber"
                      value={shippingAddress.addressNumber}
                      onChange={(e) =>
                        handleInputChange("addressNumber", e.target.value)
                      }
                      placeholder="1234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="floor">Piso</Label>
                    <Input
                      id="floor"
                      value={shippingAddress.floor}
                      onChange={(e) =>
                        handleInputChange("floor", e.target.value)
                      }
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apartment">Departamento</Label>
                    <Input
                      id="apartment"
                      value={shippingAddress.apartment}
                      onChange={(e) =>
                        handleInputChange("apartment", e.target.value)
                      }
                      placeholder="A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">
                      Ciudad *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="Buenos Aires"
                      disabled={isLoadingUserData}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">
                      Código Postal *
                      {isLoadingUserData && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      placeholder="1234"
                      disabled={isLoadingUserData}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="province">
                    Provincia *
                    {isLoadingUserData && (
                      <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                    )}
                  </Label>
                  <Select
                    value={shippingAddress.province}
                    onValueChange={(value) =>
                      handleInputChange("province", value)
                    }
                    disabled={isLoadingUserData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {argentineProvinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    value={shippingAddress.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("notes", e.target.value)
                    }
                    placeholder="Instrucciones especiales de entrega..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Método de pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {method.icon}
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {method.fee !== 0 && (
                          <Badge
                            variant={method.fee > 0 ? "destructive" : "default"}
                          >
                            {method.fee > 0 ? "+" : ""}
                            {method.fee}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="sticky top-4">
              {/* Products Summary */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Tu pedido ({itemsCount} productos)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={
                              item.product.images[0] ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.color.name} • {item.size.name} • Qty:{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de precios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>
                      {calculateShipping() === 0 ? (
                        <span className="text-green-600 font-medium">
                          Gratis
                        </span>
                      ) : (
                        formatPrice(calculateShipping())
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%)</span>
                    <span>{formatPrice(calculateTax())}</span>
                  </div>
                  {getPaymentMethodFee() !== 0 && (
                    <div className="flex justify-between">
                      <span>
                        {getPaymentMethodFee() > 0 ? "Recargo" : "Descuento"}{" "}
                        por pago
                      </span>
                      <span
                        className={
                          getPaymentMethodFee() > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {getPaymentMethodFee() > 0 ? "+" : ""}
                        {formatPrice(getPaymentMethodFee())}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total a pagar</span>
                    <span>{formatPrice(calculateFinalTotal())}</span>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Confirmar pedido
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Al confirmar tu pedido, aceptas nuestros términos y
                    condiciones
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
