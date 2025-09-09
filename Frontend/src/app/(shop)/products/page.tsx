"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
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
import { Filter, Grid, List, Star, Loader2 } from "lucide-react";
import { ProductService } from "@/services/product.service";
import { Product, Category, ProductFilters } from "@/types/product";

export default function ProductsPage() {
  // Debounce para búsqueda y precio
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Cargar productos y categorías
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      loadData();
    }, 500); // 500ms debounce
  }, [currentPage, sortBy, selectedCategory, priceRange, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar filtros con nombres esperados por el backend
      const filters: any = {};

      if (selectedCategory !== "all") {
        filters.category = selectedCategory;
      }
      if (selectedSizes.length > 0) {
        filters.sizes = selectedSizes;
      }
      if (priceRange[0] > 0) {
        filters.minPrice = priceRange[0];
      }
      if (priceRange[1] < 200000) {
        filters.maxPrice = priceRange[1];
      }
      if (searchTerm.trim() !== "") {
        filters.search = searchTerm.trim();
      }
      // Mapear sortBy y sortOrder para el backend
      let sortByValue = getSortValue(sortBy);
      let sortOrderValue: "asc" | "desc" = "desc";
      if (sortByValue === "price_asc") {
        sortByValue = "price";
        sortOrderValue = "asc";
      } else if (sortByValue === "price_desc") {
        sortByValue = "price";
        sortOrderValue = "desc";
      } else if (sortByValue === "name_asc") {
        sortByValue = "name";
        sortOrderValue = "asc";
      } else if (sortByValue === "name_desc") {
        sortByValue = "name";
        sortOrderValue = "desc";
      } else if (sortByValue === "newest") {
        sortByValue = "created_at";
        sortOrderValue = "desc";
      }
      filters.sortBy = sortByValue;
      filters.sortOrder = sortOrderValue;

      // Cargar productos
      const productsData = await ProductService.getProducts(
        filters,
        currentPage,
        12
      );

      // Extraer productos de la respuesta y asegurar array
      const productsArray = Array.isArray(productsData?.data?.products)
        ? productsData.data.products
        : [];
      setProducts(productsArray);
      setTotalPages(productsData?.data?.totalPages || 1); // Si tienes paginación, ajusta aquí

      // Cargar categorías (solo la primera vez)
      if (categories.length === 0) {
        const categoriesData = await ProductService.getCategories();

        setCategories(categoriesData);
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Error al cargar los productos. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getSortValue = (sortValue: string): ProductFilters["sortBy"] => {
    switch (sortValue) {
      case "price_asc":
        return "price_asc";
      case "price_desc":
        return "price_desc";
      case "rating":
        return "rating";
      case "popular":
        return "popular";
      case "name_asc":
        return "name_asc";
      case "name_desc":
        return "name_desc";
      default: // newest
        return "newest";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  // Filtrar productos del lado del cliente para talles (simplificado)

  // Filtrar por talles si hay seleccionados
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        if (selectedSizes.length > 0 && product.product_variants) {
          return product.product_variants.some(
            (variant) =>
              variant.size && selectedSizes.includes(variant.size.name)
          );
        }
        return true;
      })
    : [];

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Productos</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Cargando productos..."
              : `Mostrando ${filteredProducts.length} productos`}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Search input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="border rounded px-3 py-2 text-sm w-64"
          />
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
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando productos...</span>
            </div>
          ) : (
            <>
              {/* Mensaje si no hay productos */}
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No se encontraron productos con los filtros seleccionados.
                    <br />
                  </p>
                </div>
              )}
              {filteredProducts.length > 0 && (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProducts.map((product) => (
                        <ProductListItem key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500";

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              Destacado
            </Badge>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">
            {product.categories?.name || "Producto"}
          </p>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Stock: {product.stock || 0}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm ml-1">{product.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductListItem({ product }: { product: Product }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500";

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="flex border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="relative w-32 h-40 mr-4">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover rounded"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {product.categories?.name || "Producto"}
              </p>
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {formatPrice(product.price)}
              </div>
              {product.original_price && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center space-x-4 mb-2">
            <div className="text-sm">Stock: {product.stock || 0}</div>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm ml-1">{product.rating}</span>
            </div>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="flex space-x-2">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
