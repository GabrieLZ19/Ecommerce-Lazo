"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Heart,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useClientCart } from "@/hooks/useClientCart";
import { useCartToast } from "@/hooks/useToasts";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, total, itemsCount } =
    useClientCart();
  const { showCartToast } = useCartToast();
  const [isClearing, setIsClearing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    setIsClearing(true);
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
    }, 500);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50000 ? 0 : 5000; // Envío gratis en compras mayores a $50.000
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.21; // IVA 21%
  };

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Tu Carrito</h1>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Seguir comprando
            </Button>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-muted-foreground mb-6">
                ¡Agrega algunos productos para comenzar tu compra!
              </p>
              <Button onClick={() => router.push("/products")} size="lg">
                Explorar productos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tu Carrito</h1>
            <p className="text-muted-foreground">
              {itemsCount} {itemsCount === 1 ? "producto" : "productos"} en tu
              carrito
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Seguir comprando
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCart}
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vaciar carrito
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <SafeImage
                        src={
                          item.product.images[0] || "/placeholder-product.jpg"
                        }
                        alt={item.product.name}
                        className="object-cover rounded-md"
                        sizes="96px"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.product.brand}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Variants */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Talla:
                          </span>
                          <Badge variant="outline">{item.size.name}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Color:
                          </span>
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            <span className="text-sm">{item.color.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold">
                            {formatPrice(item.price)}
                          </span>
                          {item.product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(item.product.original_price)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Subtotal del producto:
                          </span>
                          <span className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemsCount} productos)</span>
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
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        total + calculateShipping() + calculateTax()
                      )}
                    </span>
                  </div>

                  {calculateShipping() === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        🎉 ¡Felicidades! Tienes envío gratis
                      </p>
                    </div>
                  )}

                  {calculateShipping() > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 Agrega {formatPrice(50000 - calculateSubtotal())} más
                        para envío gratis
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => router.push("/checkout")}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceder al checkout
                  </Button>
                </CardContent>
              </Card>

              {/* Security & Benefits */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span>Envío gratis en compras +$50.000</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span>30 días para cambios</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    También te puede interesar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Ver productos recomendados
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
