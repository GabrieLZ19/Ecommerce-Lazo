"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, Grid, List, Star } from "lucide-react";

// Tipos locales para productos
interface MockProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  onSale: boolean;
}

// Mock data - en producción vendría de Supabase
const mockProducts = [
  {
    id: "1",
    name: "Vestido Elegante Negro",
    price: 89900,
    originalPrice: 120000,
    image: "https://images.unsplash.com/photo-1566479179817-c0b2b8fa0842?w=500",
    category: "Vestidos",
    rating: 4.8,
    reviews: 124,
    colors: ["#000000", "#808080"],
    sizes: ["S", "M", "L", "XL"],
    isNew: false,
    onSale: true,
  },
  {
    id: "2",
    name: "Camisa Casual Blanca",
    price: 45900,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
    category: "Camisas",
    rating: 4.7,
    reviews: 89,
    colors: ["#FFFFFF", "#001f3f"],
    sizes: ["S", "M", "L"],
    isNew: true,
    onSale: false,
  },
  {
    id: "3",
    name: "Jeans Slim Fit",
    price: 67900,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    category: "Pantalones",
    rating: 4.9,
    reviews: 156,
    colors: ["#001f3f", "#000000"],
    sizes: ["M", "L", "XL"],
    isNew: false,
    onSale: false,
  },
  {
    id: "4",
    name: "Blazer Formal",
    price: 129900,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    category: "Sacos",
    rating: 4.6,
    reviews: 73,
    colors: ["#000000", "#808080"],
    sizes: ["M", "L", "XL"],
    isNew: false,
    onSale: false,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["all", "Vestidos", "Camisas", "Pantalones", "Sacos"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory)
      return false;
    if (product.price < priceRange[0] || product.price > priceRange[1])
      return false;
    if (
      selectedSizes.length > 0 &&
      !selectedSizes.some((size) => product.sizes.includes(size))
    )
      return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "rating":
        return b.rating - a.rating;
      default: // newest
        return 0;
    }
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Productos</h1>
          <p className="text-muted-foreground">
            Mostrando {sortedProducts.length} de {products.length} productos
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más reciente</SelectItem>
              <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
              <SelectItem value="name_desc">Nombre: Z-A</SelectItem>
              <SelectItem value="rating">Mejor valorados</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div
          className={`lg:w-64 space-y-6 ${
            showFilters ? "block" : "hidden"
          } lg:block`}
        >
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-4">Filtros</h3>

            {/* Category Filter */}
            <div className="space-y-2 mb-6">
              <h4 className="font-medium">Categoría</h4>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Todas las categorías" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2 mb-6">
              <h4 className="font-medium">Rango de precio</h4>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={200000}
                min={0}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2">
              <h4 className="font-medium">Talles</h4>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={
                      selectedSizes.includes(size) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedSizes((prev) =>
                        prev.includes(size)
                          ? prev.filter((s) => s !== size)
                          : [...prev, size]
                      );
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No se encontraron productos con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: MockProduct }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="card-product">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <Badge className="absolute top-2 left-2 badge-default">Nuevo</Badge>
          )}
          {product.onSale && (
            <Badge className="absolute top-2 right-2 badge-destructive">
              -{calculateDiscount(product.originalPrice!, product.price)}%
            </Badge>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews})
              </span>
            </div>
            <div className="flex space-x-1">
              {product.colors
                .slice(0, 3)
                .map((color: string, index: number) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductListItem({ product }: { product: MockProduct }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="flex border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="relative w-32 h-40 mr-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {product.category}
              </p>
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">
                {product.rating} ({product.reviews} reseñas)
              </span>
            </div>
            <div className="flex space-x-1">
              {product.colors.map((color: string, index: number) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            {product.sizes.map((size: string) => (
              <Badge key={size} variant="outline" className="text-xs">
                {size}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
