export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  category_id?: string;
  category?: Category;
  categories?: Category;
  brand?: string;
  sku?: string;
  stock: number;
  min_stock_level?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images: string[];
  tags?: string[];
  active: boolean;
  featured: boolean;
  rating: number;
  review_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  // Relaciones con variantes
  product_variants?: ProductVariant[];
}

export interface Size {
  id: string;
  name: string;
  value: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string;
  color_id: string;
  stock: number;
  price?: number;
  sku?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  size?: Size;
  color?: Color;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category_id?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  is_featured?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  sizes?: string[];
}
