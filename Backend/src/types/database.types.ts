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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          address?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          address?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          }
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          sale_price: number | null;
          sku: string;
          stock_quantity: number;
          category_id: string;
          brand: string | null;
          images: string[];
          sizes: string[];
          colors: string[];
          tags: string[];
          is_active: boolean;
          is_featured: boolean;
          active: boolean;
          weight: number | null;
          dimensions: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          sale_price?: number | null;
          sku: string;
          stock_quantity?: number;
          category_id: string;
          brand?: string | null;
          images?: string[];
          sizes?: string[];
          colors?: string[];
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          active?: boolean;
          weight?: number | null;
          dimensions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          sale_price?: number | null;
          sku?: string;
          stock_quantity?: number;
          category_id?: string;
          brand?: string | null;
          images?: string[];
          sizes?: string[];
          colors?: string[];
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          active?: boolean;
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
          }
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
          payment_method: string;
          payment_id: string | null;
          subtotal: number;
          shipping_cost: number;
          tax_amount: number;
          total_amount: number;
          shipping_address: Json;
          billing_address: Json;
          shipping_method: string;
          tracking_number: string | null;
          notes: string | null;
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
          payment_method: string;
          payment_id?: string | null;
          subtotal: number;
          shipping_cost: number;
          tax_amount: number;
          total_amount: number;
          shipping_address: Json;
          billing_address: Json;
          shipping_method: string;
          tracking_number?: string | null;
          notes?: string | null;
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
          payment_method?: string;
          payment_id?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          tax_amount?: number;
          total_amount?: number;
          shipping_address?: Json;
          billing_address?: Json;
          shipping_method?: string;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          size: string | null;
          color: string | null;
          created_at: string;
          products?: {
            name: string;
            images: string[];
            sku: string;
          };
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          size?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          size?: string | null;
          color?: string | null;
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
          }
        ];
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
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export type CreateUser = Database["public"]["Tables"]["users"]["Insert"];
export type CreateCategory =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CreateProduct = Database["public"]["Tables"]["products"]["Insert"];
export type CreateOrder = Database["public"]["Tables"]["orders"]["Insert"];
export type CreateOrderItem =
  Database["public"]["Tables"]["order_items"]["Insert"];

export type UpdateUser = Database["public"]["Tables"]["users"]["Update"];
export type UpdateCategory =
  Database["public"]["Tables"]["categories"]["Update"];
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];
export type UpdateOrder = Database["public"]["Tables"]["orders"]["Update"];
export type UpdateOrderItem =
  Database["public"]["Tables"]["order_items"]["Update"];
