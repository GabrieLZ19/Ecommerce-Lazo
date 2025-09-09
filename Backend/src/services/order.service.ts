import { supabase } from "../config/supabase";
import type { Order, OrderItem, Database } from "../types/database.types";

export interface CreateOrderData {
  user_id: string;
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    price?: number;
    unit_price?: number;
    size?: string;
    color?: string;
  }>;
  shipping_address: {
    address?: string;
    address_number?: string;
    street?: string;
    number?: string;
    city: string;
    state?: string;
    province?: string;
    postal_code: string;
    country?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    floor?: string;
    apartment?: string;
  };
  billing_address?: {
    street: string;
    number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_method: "standard" | "express" | "overnight";
  payment_method: "mercadopago" | "cash" | "transfer";
  notes?: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  total_items: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export class OrderService {
  /**
   * Crear una nueva orden
   */
  static async createOrder(
    orderData: CreateOrderData
  ): Promise<OrderWithDetails> {
    try {
      // Log de la información recibida desde el frontend
      console.log(
        "Datos recibidos para crear orden:",
        JSON.stringify(orderData, null, 2)
      );

      // Validar que street (address_line_1) no sea vacío o nulo
      if (
        !orderData.shipping_address.address ||
        orderData.shipping_address.address.trim() === ""
      ) {
        throw new Error(
          "El campo 'address' (address_line_1) de la dirección de envío es obligatorio y no puede estar vacío."
        );
      }

      // Calcular totales
      const subtotal = orderData.items.reduce(
        (sum, item) =>
          sum + (item.price ?? item.unit_price ?? 0) * item.quantity,
        0
      );
      const shipping_cost = this.calculateShippingCost(
        orderData.shipping_method,
        subtotal
      );
      const tax_amount = this.calculateTax(subtotal);
      const total = subtotal + shipping_cost + tax_amount;
      console.log("[ORDER DEBUG] subtotal:", subtotal);
      console.log("[ORDER DEBUG] shipping_cost:", shipping_cost);
      console.log("[ORDER DEBUG] tax_amount:", tax_amount);
      console.log("[ORDER DEBUG] total:", total);

      // Generar número de orden
      const order_number = crypto.randomUUID();

      // Obtener datos del usuario para nombre y apellido
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", orderData.user_id)
        .single();

      if (userFetchError || !userData) {
        throw new Error(
          `No se pudo obtener el usuario para la dirección de envío.`
        );
      }

      // Mapear los datos de dirección a los nombres correctos para la tabla addresses
      const shippingAddress = {
        user_id: orderData.user_id,
        type: "shipping",
        first_name:
          orderData.shipping_address.first_name || userData.first_name,
        last_name: orderData.shipping_address.last_name || userData.last_name,
        phone: orderData.shipping_address.phone || "",
        address_line_1: orderData.shipping_address.address,
        address_line_2: orderData.shipping_address.address_number || "",
        city: orderData.shipping_address.city,
        state:
          orderData.shipping_address.province ||
          orderData.shipping_address.state,
        postal_code: orderData.shipping_address.postal_code,
        country: orderData.shipping_address.country || "AR",
      };

      // Insertar la dirección y obtener el id
      const { data: address, error: addressError } = await supabase
        .from("addresses")
        .insert(shippingAddress)
        .select()
        .single();

      if (addressError) {
        throw new Error(
          `Failed to create shipping address: ${addressError.message}`
        );
      }

      // Crear la orden con shipping_address_id
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number,
          user_id: orderData.user_id,
          status: "pending",
          payment_status: "pending",
          subtotal,
          shipping_cost,
          tax_amount,
          total,
          shipping_address_id: address.id,
          billing_address:
            orderData.billing_address || orderData.shipping_address,
          shipping_method: orderData.shipping_method,
          payment_method: orderData.payment_method,
          notes: orderData.notes,
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Crear los items de la orden
      const orderItems = [];
      for (const item of orderData.items) {
        let product_variant_id = item.variant_id;
        // Si no se recibe variant_id, buscar el primer variant disponible en la base
        if (!product_variant_id) {
          const { data: variants, error: variantError } = await supabase
            .from("product_variants")
            .select("id")
            .eq("product_id", item.product_id)
            .limit(1);
          if (variantError) {
            console.warn(
              "No se pudo obtener variantes para el producto",
              item.product_id,
              variantError
            );
          }
          if (
            Array.isArray(variants) &&
            variants.length > 0 &&
            variants[0]?.id
          ) {
            product_variant_id = variants[0].id;
          }
        }
        const price = item.price ?? item.unit_price ?? 0;
        const total = price * item.quantity;
        orderItems.push({
          order_id: order.id,
          product_id: item.product_id,
          product_variant_id,
          quantity: item.quantity,
          price,
          total,
          size: item.size,
          color: item.color,
        });
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems).select(`
        *,
        products (
          name,
          images,
          sku
        )
      `);

      if (itemsError) {
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Obtener información del usuario
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("first_name, last_name, email, phone")
        .eq("id", orderData.user_id)
        .single();

      if (userError) {
        throw new Error(`Failed to get user info: ${userError.message}`);
      }

      return {
        ...order,
        items: items || [],
        user,
        total_items: orderData.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Obtener orden por ID
   */
  static async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              name,
              images,
              sku
            )
          ),
          users (
            first_name,
            last_name,
            email,
            phone
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        ...data,
        items: data.order_items || [],
        user: data.users,
        total_items: (data.order_items || []).reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ),
      };
    } catch (error) {
      throw new Error(`Failed to get order: ${error}`);
    }
  }

  /**
   * Obtener órdenes de un usuario
   */
  static async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              name,
              images,
              sku
            )
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const orders = (data || []).map((order: any) => ({
        ...order,
        items: order.order_items || [],
        total_items: (order.order_items || []).reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ),
      }));

      return {
        orders,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new Error(`Failed to get user orders: ${error}`);
    }
  }

  /**
   * Actualizar estado de la orden
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error}`);
    }
  }

  /**
   * Actualizar estado del pago
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentId?: string
  ) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update payment status: ${error}`);
    }
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(orderId: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          notes: reason ? `Cancelled: ${reason}` : "Cancelled by user",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error}`);
    }
  }

  /**
   * Obtener todas las órdenes con paginación (admin)
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus
  ) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase.from("orders").select(
        `
          *,
          order_items (
            *,
            products (
              name,
              images,
              sku
            )
          ),
          users (
            name,
            email,
            phone
          )
        `,
        { count: "exact" }
      );

      if (status) {
        query = query.eq("status", status);
      }

      if (paymentStatus) {
        query = query.eq("payment_status", paymentStatus);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const orders = (data || []).map((order: any) => ({
        ...order,
        items: order.order_items || [],
        user: order.users,
        total_items: (order.order_items || []).reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ),
      }));

      return {
        orders,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new Error(`Failed to get orders: ${error}`);
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static async getOrderStats() {
    try {
      const { data: totalOrders, error: totalError } = await supabase
        .from("orders")
        .select("id", { count: "exact" });

      const { data: completedOrders, error: completedError } = await supabase
        .from("orders")
        .select("total", { count: "exact" })
        .eq("status", "delivered");

      const { data: pendingOrders, error: pendingError } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      if (totalError || completedError || pendingError) {
        throw new Error("Failed to get order statistics");
      }

      const totalRevenue = (completedOrders || []).reduce(
        (sum: number, order: any) => sum + order.total,
        0
      );

      return {
        total_orders: totalOrders?.length || 0,
        completed_orders: completedOrders?.length || 0,
        pending_orders: pendingOrders?.length || 0,
        total_revenue: totalRevenue,
      };
    } catch (error) {
      throw new Error(`Failed to get order stats: ${error}`);
    }
  }

  /**
   * Generar número de orden único
   */
  private static async generateOrderNumber(): Promise<string> {
    // Ya no se usa, el número de orden ahora es UUID
    return crypto.randomUUID();
  }

  /**
   * Calcular costo de envío
   */
  private static calculateShippingCost(
    method: string,
    subtotal: number
  ): number {
    if (subtotal >= 50000) return 0; // Envío gratis para compras mayores a $50,000

    switch (method) {
      case "standard":
        return 2500;
      case "express":
        return 4500;
      case "overnight":
        return 8000;
      default:
        return 2500;
    }
  }

  /**
   * Calcular impuestos
   */
  private static calculateTax(subtotal: number): number {
    return subtotal * 0.21; // IVA 21% en Argentina
  }
}
