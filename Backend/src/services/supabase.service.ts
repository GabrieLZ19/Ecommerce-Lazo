import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

// Configuración del cliente Supabase para el servidor
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Función helper para normalizar productos
const normalizeProduct = (product: any) => ({
  ...product,
  stock: product.stock_quantity,
  active: product.is_active,
  featured: product.is_featured,
  product_variants: product.product_variants?.map((variant: any) => ({
    ...variant,
    stock: variant.stock_quantity,
  })),
});

// Servicios de productos
export class ProductService {
  static async getProducts(
    page: number = 1,
    limit: number = 12,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      brand?: string;
      sizes?: string[];
      colors?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      featured?: boolean;
    },
  ) {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sale_price,
        sku,
        stock_quantity,
        category_id,
        brand,
        images,
        sizes,
        colors,
        tags,
        is_active,
        is_featured,
        weight,
        dimensions,
        created_at,
        updated_at,
        categories(*),
        product_variants(id, product_id, size_id, color_id, stock_quantity, sku, color:colors(id, name, hex_code), size:sizes(id, name, code, sort_order))
      `,
        { count: "exact" },
      )
      .eq("is_active", true);

    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    if (filters?.brand) {
      query = query.eq("brand", filters.brand);
    }

    if (filters?.featured) {
      query = query.eq("is_featured", true);
    }

    const sortBy = filters?.sortBy || "created_at";
    const sortOrder = filters?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    const normalizedData = data?.map(normalizeProduct) || [];

    return {
      products: normalizedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  static async getAllProducts(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sale_price,
        sku,
        stock_quantity,
        category_id,
        brand,
        images,
        sizes,
        colors,
        tags,
        is_active,
        is_featured,
        weight,
        dimensions,
        created_at,
        updated_at,
        categories(*),
        product_variants(id, product_id, size_id, color_id, stock_quantity, sku, color:colors(id, name, hex_code), size:sizes(id, name, code, sort_order))
      `,
      )
      .eq("is_active", true);

    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.featured) {
      query = query.eq("is_featured", true);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    return data?.map(normalizeProduct) || [];
  }

  static async getProductById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sale_price,
        sku,
        stock_quantity,
        category_id,
        brand,
        images,
        sizes,
        colors,
        tags,
        is_active,
        is_featured,
        weight,
        dimensions,
        created_at,
        updated_at,
        categories(*),
        product_variants(id, product_id, size_id, color_id, stock_quantity, sku, color:colors(id, name, hex_code), size:sizes(id, name, code, sort_order))
      `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching product: ${error.message}`);
    }

    return normalizeProduct(data);
  }

  static async getProductBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sale_price,
        sku,
        stock_quantity,
        category_id,
        brand,
        images,
        sizes,
        colors,
        tags,
        is_active,
        is_featured,
        weight,
        dimensions,
        created_at,
        updated_at,
        categories(*),
        product_variants(id, product_id, size_id, color_id, stock_quantity, sku, color:colors(id, name, hex_code), size:sizes(id, name, code, sort_order))
      `,
      )
      .eq("sku", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching product: ${error.message}`);
    }

    return normalizeProduct(data);
  }

  static async createProduct(
    productData: Database["public"]["Tables"]["products"]["Insert"],
  ) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }

    return data;
  }

  static async updateProduct(
    id: string,
    updates: Database["public"]["Tables"]["products"]["Update"],
  ) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }

    return data;
  }

  static async deleteProduct(id: string) {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }

    return true;
  }

  static async getFeaturedProducts(limit = 8) {
    return this.getAllProducts({ featured: true, limit });
  }

  static async getRelatedProducts(productId: string, limit = 4) {
    const currentProduct = await this.getProductById(productId);
    if (!currentProduct) {
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sale_price,
        sku,
        stock_quantity,
        category_id,
        brand,
        images,
        sizes,
        colors,
        tags,
        is_active,
        is_featured,
        weight,
        dimensions,
        created_at,
        updated_at,
        categories(*)
      `,
      )
      .eq("is_active", true)
      .eq("category_id", (currentProduct as any).category_id)
      .neq("id", productId)
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching related products: ${error.message}`);
    }

    return data?.map(normalizeProduct) || [];
  }

  static async updateStock(
    id: string,
    quantity: number,
    operation: "add" | "subtract" | "set",
  ) {
    const product = await this.getProductById(id);
    if (!product) {
      return null;
    }

    let newStock = (product as any).stock;

    switch (operation) {
      case "add":
        newStock += quantity;
        break;
      case "subtract":
        newStock = Math.max(0, newStock - quantity);
        break;
      case "set":
        newStock = Math.max(0, quantity);
        break;
    }

    return this.updateProduct(id, { stock_quantity: newStock });
  }

  static async searchProducts(searchTerm: string, limit = 20) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sale_price,
        sku,
        stock_quantity,
        category_id,
        brand,
        images,
        sizes,
        colors,
        tags,
        is_active,
        is_featured,
        weight,
        dimensions,
        created_at,
        updated_at,
        categories(*)
      `,
      )
      .eq("is_active", true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }

    return data?.map(normalizeProduct) || [];
  }
}

// Servicios de categorías
export class CategoryService {
  static async getAllCategories() {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data;
  }

  static async getCategoryBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      throw new Error(`Error fetching category: ${error.message}`);
    }

    return data;
  }
}
