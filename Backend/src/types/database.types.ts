export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          address: Json | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          address?: Json | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          address?: Json | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: "shipping" | "billing" | "return";
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string | null;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "shipping" | "billing" | "return";
          first_name: string;
          last_name: string;
          phone?: string | null;
          email?: string | null;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state?: string | null;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "shipping" | "billing" | "return";
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          email?: string | null;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string | null;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          parent_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      colors: {
        Row: {
          id: string;
          name: string;
          hex_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hex_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          hex_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      sizes: {
        Row: {
          id: string;
          name: string;
          code: string;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          sort_order?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          sku: string | null;
          stock_quantity: number | null;
          category_id: string;
          brand: string | null;
          images: string[] | null;
          sizes: string[] | null;
          colors: string[] | null;
          tags: string[] | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          weight: number | null;
          dimensions: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          sku?: string | null;
          stock_quantity?: number | null;
          category_id: string;
          brand?: string | null;
          images?: string[] | null;
          sizes?: string[] | null;
          colors?: string[] | null;
          tags?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          weight?: number | null;
          dimensions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          sku?: string | null;
          stock_quantity?: number | null;
          category_id?: string;
          brand?: string | null;
          images?: string[] | null;
          sizes?: string[] | null;
          colors?: string[] | null;
          tags?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          weight?: number | null;
          dimensions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size_id: string;
          color_id: string;
          stock_quantity: number | null;
          sku: string | null;
          price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size_id: string;
          color_id: string;
          stock_quantity?: number | null;
          sku?: string | null;
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size_id?: string;
          color_id?: string;
          stock_quantity?: number | null;
          sku?: string | null;
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_size_id_fkey";
            columns: ["size_id"];
            referencedRelation: "sizes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_color_id_fkey";
            columns: ["color_id"];
            referencedRelation: "colors";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          shipping_method: string | null;
          payment_method: string | null;
          subtotal: number | null;
          shipping_cost: number | null;
          tax: number | null;
          payment_fee: number | null;
          total: number;
          shipping_address: Json;
          billing_address: Json | null;
          shipping_address_id: string | null;
          billing_address_id: string | null;
          notes: string | null;
          mercadopago_order_id: string | null;
          enviopack_shipment_id: string | null;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          shipping_method?: string | null;
          payment_method?: string | null;
          subtotal?: number | null;
          shipping_cost?: number | null;
          tax?: number | null;
          payment_fee?: number | null;
          total: number;
          shipping_address: Json;
          billing_address?: Json | null;
          shipping_address_id?: string | null;
          billing_address_id?: string | null;
          notes?: string | null;
          mercadopago_order_id?: string | null;
          enviopack_shipment_id?: string | null;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          shipping_method?: string | null;
          payment_method?: string | null;
          subtotal?: number | null;
          shipping_cost?: number | null;
          tax?: number | null;
          payment_fee?: number | null;
          total?: number;
          shipping_address?: Json;
          billing_address?: Json | null;
          shipping_address_id?: string | null;
          billing_address_id?: string | null;
          notes?: string | null;
          mercadopago_order_id?: string | null;
          enviopack_shipment_id?: string | null;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey";
            columns: ["shipping_address_id"];
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_billing_address_id_fkey";
            columns: ["billing_address_id"];
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_variant_id: string | null;
          product_name: string;
          product_sku: string | null;
          size_name: string | null;
          color_name: string | null;
          quantity: number;
          unit_price: number;
          created_at: string;
          products?: {
            // ← AGREGAR ESTO
            name: string;
            images: string[] | null;
            sku: string | null;
          };
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_variant_id?: string | null;
          product_name: string;
          product_sku?: string | null;
          size_name?: string | null;
          color_name?: string | null;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_variant_id?: string | null;
          product_name?: string;
          product_sku?: string | null;
          size_name?: string | null;
          color_name?: string | null;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey";
            columns: ["product_variant_id"];
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      shipping_calculations: {
        Row: {
          id: string;
          order_id: string | null;
          origin_address: Json;
          destination_address: Json;
          shipping_method: string | null;
          estimated_cost: number | null;
          estimated_days: number | null;
          carrier: string | null;
          response_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          origin_address: Json;
          destination_address: Json;
          shipping_method?: string | null;
          estimated_cost?: number | null;
          estimated_days?: number | null;
          carrier?: string | null;
          response_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          origin_address?: Json;
          destination_address?: Json;
          shipping_method?: string | null;
          estimated_cost?: number | null;
          estimated_days?: number | null;
          carrier?: string | null;
          response_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipping_calculations_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          id: string;
          table_name: string | null;
          record_id: string | null;
          action: string | null;
          user_id: string | null;
          changes: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name?: string | null;
          record_id?: string | null;
          action?: string | null;
          user_id?: string | null;
          changes?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string | null;
          record_id?: string | null;
          action?: string | null;
          user_id?: string | null;
          changes?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Tipos de conveniencia
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Color = Database["public"]["Tables"]["colors"]["Row"];
export type Size = Database["public"]["Tables"]["sizes"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type ShippingCalculation =
  Database["public"]["Tables"]["shipping_calculations"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];

export type CreateUser = Database["public"]["Tables"]["users"]["Insert"];
export type CreateAddress = Database["public"]["Tables"]["addresses"]["Insert"];
export type CreateCategory =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CreateColor = Database["public"]["Tables"]["colors"]["Insert"];
export type CreateSize = Database["public"]["Tables"]["sizes"]["Insert"];
export type CreateProduct = Database["public"]["Tables"]["products"]["Insert"];
export type CreateProductVariant =
  Database["public"]["Tables"]["product_variants"]["Insert"];
export type CreateOrder = Database["public"]["Tables"]["orders"]["Insert"];
export type CreateOrderItem =
  Database["public"]["Tables"]["order_items"]["Insert"];
export type CreateShippingCalculation =
  Database["public"]["Tables"]["shipping_calculations"]["Insert"];
export type CreateAuditLog =
  Database["public"]["Tables"]["audit_log"]["Insert"];

export type UpdateUser = Database["public"]["Tables"]["users"]["Update"];
export type UpdateAddress = Database["public"]["Tables"]["addresses"]["Update"];
export type UpdateCategory =
  Database["public"]["Tables"]["categories"]["Update"];
export type UpdateColor = Database["public"]["Tables"]["colors"]["Update"];
export type UpdateSize = Database["public"]["Tables"]["sizes"]["Update"];
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];
export type UpdateProductVariant =
  Database["public"]["Tables"]["product_variants"]["Update"];
export type UpdateOrder = Database["public"]["Tables"]["orders"]["Update"];
export type UpdateOrderItem =
  Database["public"]["Tables"]["order_items"]["Update"];
export type UpdateShippingCalculation =
  Database["public"]["Tables"]["shipping_calculations"]["Update"];
export type UpdateAuditLog =
  Database["public"]["Tables"]["audit_log"]["Update"];
