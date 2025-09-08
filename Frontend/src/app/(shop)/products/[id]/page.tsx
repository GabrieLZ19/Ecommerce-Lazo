"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { ProductService } from "@/services/product.service";
import { Product, ProductVariant, Size, Color } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { useClientCart } from "@/hooks/useClientCart";
import {
  useCartToast,
  useFavoriteToast,
  useErrorToast,
} from "@/hooks/useToasts";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addItem } = useClientCart();
  const { showCartToast } = useCartToast();
  const { showFavoriteToast } = useFavoriteToast();
  const { showErrorToast } = useErrorToast();

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  // Actualizar variante seleccionada cuando cambian size/color
  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const variant = product.product_variants?.find(
        (v) => v.size_id === selectedSize.id && v.color_id === selectedColor.id
      );
      setSelectedVariant(variant || null);
    }
  }, [product, selectedSize, selectedColor]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      const productData = await ProductService.getProductById(productId);

      if (!productData) {
        setError("Producto no encontrado");
        return;
      }

      setProduct(productData);

      // Seleccionar primera variante disponible automáticamente
      if (
        productData.product_variants &&
        productData.product_variants.length > 0
      ) {
        const firstVariant = productData.product_variants[0];
        setSelectedSize(firstVariant.size || null);
        setSelectedColor(firstVariant.color || null);
        setSelectedVariant(firstVariant);
      }
    } catch (err: any) {
      console.error("Error loading product:", err);
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSizes = (): Size[] => {
    if (!product?.product_variants) return [];
    const sizeMap = new Map<string, Size>();

    product.product_variants.forEach((variant) => {
      if (variant.size && variant.stock > 0) {
        sizeMap.set(variant.size.id, variant.size);
      }
    });

    return Array.from(sizeMap.values());
  };

  const getAvailableColors = (): Color[] => {
    if (!product?.product_variants) return [];
    const colorMap = new Map<string, Color>();

    product.product_variants
      .filter((variant) => !selectedSize || variant.size_id === selectedSize.id)
      .forEach((variant) => {
        if (variant.color && variant.stock > 0) {
          colorMap.set(variant.color.id, variant.color);
        }
      });

    return Array.from(colorMap.values());
  };

  const getTotalStock = (): number => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return (
      product?.product_variants?.reduce(
        (total, variant) => total + variant.stock,
        0
      ) ||
      product?.stock ||
      0
    );
  };

  const getVariantPrice = (): number => {
    if (selectedVariant?.price) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Si hay variantes, verificar que se haya seleccionado size y color
    if (product.product_variants && product.product_variants.length > 0) {
      if (!selectedSize || !selectedColor || !selectedVariant) {
        showErrorToast(
          "Por favor selecciona talla y color",
          "Selección requerida"
        );
        return;
      }

      if (selectedVariant.stock < quantity) {
        showErrorToast(
          "No hay suficiente stock disponible",
          "Stock insuficiente"
        );
        return;
      }
    }

    setIsAddingToCart(true);

    try {
      // Usar variantes seleccionadas o valores por defecto
      const size = selectedSize || {
        id: "default",
        name: "Talle único",
        value: "default",
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const color = selectedColor || {
        id: "default",
        name: "Color único",
        hex: "#000000",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addItem(product, size, color, quantity);

      // Mostrar toast de éxito personalizado
      showCartToast(product.name);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showErrorToast(
        "Error al agregar el producto al carrito",
        "Error inesperado"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const maxStock = getTotalStock();
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleImageNavigation = (direction: "prev" | "next") => {
    if (!product?.images) return;

    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product?.original_price) return 0;
    return Math.round(
      ((product.original_price - product.price) / product.original_price) * 100
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando producto...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Producto no encontrado"}
          </p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-0 h-auto hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a productos
        </Button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <>
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Controles de navegación */}
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={() => handleImageNavigation("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={() => handleImageNavigation("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Destacado
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge variant="destructive">-{discount}%</Badge>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex
                      ? "border-primary"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-muted-foreground mb-2">
              {product.category?.name || "Producto"}
            </p>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.short_description && (
              <p className="text-lg text-muted-foreground">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Rating y reviews */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 font-medium">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">
              ({product.review_count} reseñas)
            </span>
            <span className="text-muted-foreground">
              {product.sold_count} vendidos
            </span>
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(getVariantPrice())}
              </span>
              {product.original_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-green-600 font-medium">
                ¡Ahorrás{" "}
                {formatPrice((product.original_price || 0) - getVariantPrice())}
                !
              </p>
            )}
            {selectedVariant?.sku && (
              <p className="text-sm text-muted-foreground">
                SKU: {selectedVariant.sku}
              </p>
            )}
          </div>

          {/* Variantes de producto */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="space-y-4">
              {/* Tallas */}
              {getAvailableSizes().length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Talla</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableSizes().map((size) => (
                      <Button
                        key={size.id}
                        variant={
                          selectedSize?.id === size.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[3rem]"
                      >
                        {size.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colores */}
              {getAvailableColors().length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {getAvailableColors().map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor?.id === color.id
                            ? "border-primary border-4 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Color seleccionado: {selectedColor.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stock y cantidad */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Stock disponible:</span>
              <span
                className={`font-bold ${
                  getTotalStock() > 10
                    ? "text-green-600"
                    : getTotalStock() > 0
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {getTotalStock() > 0
                  ? `${getTotalStock()} unidades`
                  : "Sin stock"}
              </span>
            </div>

            {getTotalStock() > 0 && (
              <div className="flex items-center space-x-4">
                <span className="font-medium">Cantidad:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= getTotalStock()}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={
                getTotalStock() === 0 ||
                isAddingToCart ||
                (product.product_variants &&
                  product.product_variants.length > 0 &&
                  (!selectedSize || !selectedColor))
              }
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {getTotalStock() === 0
                    ? "Sin stock"
                    : product.product_variants &&
                      product.product_variants.length > 0 &&
                      (!selectedSize || !selectedColor)
                    ? "Selecciona variante"
                    : "Agregar al carrito"}
                </>
              )}
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const newFavoriteState = !isFavorite;
                  setIsFavorite(newFavoriteState);
                  showFavoriteToast(product.name, newFavoriteState);
                }}
                className="flex-1"
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isFavorite ? "En favoritos" : "Agregar a favoritos"}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-3 pt-6 border-t">
            <div className="flex items-center space-x-3 text-sm">
              <Truck className="h-5 w-5 text-green-600" />
              <span>Envío gratis en compras mayores a $50.000</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Garantía oficial del fabricante</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <RotateCcw className="h-5 w-5 text-purple-600" />
              <span>30 días para cambios y devoluciones</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="font-medium mb-3">Características:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Descripción completa */}
      <div className="mt-12 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Descripción</h2>
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Información del producto */}
      <div className="mt-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Información del producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.brand && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Marca:</span>
              <span>{product.brand}</span>
            </div>
          )}
          {product.sku && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">SKU:</span>
              <span>{product.sku}</span>
            </div>
          )}
          {product.weight && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Peso:</span>
              <span>{product.weight} kg</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Stock mínimo:</span>
            <span>{product.min_stock_level || 5} unidades</span>
          </div>
        </div>
      </div>
    </div>
  );
}
