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
    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq("active", true);

      // Aplicar filtros
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.is_featured !== undefined) {
        query = query.eq("featured", filters.is_featured);
      }

      if (filters.min_price) {
        query = query.gte("price", filters.min_price);
      }

      if (filters.max_price) {
        query = query.lte("price", filters.max_price);
      }

      if (filters.brand) {
        query = query.eq("brand", filters.brand);
      }

      // Aplicar ordenamiento
      switch (filters.sort_by) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "popular":
          query = query.order("sold_count", { ascending: false });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID con variantes
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          product_variants(
            *,
            size:sizes(*),
            color:colors(*)
          )
        `
        )
        .eq("id", id)
        .eq("active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Producto no encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  /**
   * Obtener productos destacados
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq("active", true)
        .eq("featured", true)
        .order("sold_count", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  }

  /**
   * Obtener categorías
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Buscar productos
   */
  static async searchProducts(
    searchTerm: string,
    limit: number = 10
  ): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq("active", true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("rating", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  /**
   * Obtener productos por categoría
   */
  static async getProductsByCategory(
    categoryId: string,
    limit?: number
  ): Promise<Product[]> {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq("active", true)
        .eq("category_id", categoryId)
        .order("rating", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }
}
