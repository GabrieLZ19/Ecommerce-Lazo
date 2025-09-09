import { supabase } from "@/lib/supabase";
import { Product, Category, ProductFilters } from "@/types/product";

export class ProductService {
  /**
   * Obtener productos con filtros y paginación
   */
  static async getProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 12
  ) {
    const paramsObj: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        paramsObj[key] = String(value);
      }
    });
    const params = new URLSearchParams(paramsObj);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${params}`
    );
    if (!response.ok) {
      throw new Error("Error fetching products");
    }
    return await response.json();
  }

  /**
   * Obtener producto por ID con variantes
   */
  static async getProductById(id: string): Promise<Product | null> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Error fetching product");
    }
    const result = await response.json();
    // Si la respuesta tiene formato { success, data }, devolver solo data
    if (result && result.data) {
      return result.data;
    }
    return result;
  }

  /**
   * Obtener productos destacados
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/featured?limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Error fetching featured products");
    }
    return await response.json();
  }

  /**
   * Obtener categorías
   */
  static async getCategories(): Promise<Category[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`
    );
    if (!response.ok) {
      throw new Error("Error fetching categories");
    }
    const result = await response.json();
    // Si la respuesta tiene formato { success, data }, devolver solo data
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    // Si la respuesta ya es array
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  }

  /**
   * Buscar productos
   */
  static async searchProducts(
    searchTerm: string,
    limit: number = 10
  ): Promise<Product[]> {
    const params = new URLSearchParams({
      search: searchTerm,
      limit: limit.toString(),
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/search?${params}`
    );
    if (!response.ok) {
      throw new Error("Error searching products");
    }
    return await response.json();
  }

  /**
   * Obtener productos por categoría
   */
  static async getProductsByCategory(
    categoryId: string,
    limit?: number
  ): Promise<Product[]> {
    const params = new URLSearchParams({
      categoryId,
      ...(limit ? { limit: limit.toString() } : {}),
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/by-category?${params}`
    );
    if (!response.ok) {
      throw new Error("Error fetching products by category");
    }
    return await response.json();
  }
}
