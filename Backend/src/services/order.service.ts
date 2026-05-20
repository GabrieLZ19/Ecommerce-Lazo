import { supabase } from "../config/supabase";
import type {
  Order,
  OrderItem,
  Address,
  Database,
} from "../types/database.types";

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
  totals?: {
    subtotal?: number;
    shipping?: number;
    tax?: number;
    payment_fee?: number;
    total?: number;
  };
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
   * Crear una nueva orden completa con dirección y items
   * @param orderData - Datos de la orden desde el frontend
   * @returns Orden creada con detalles
   */
  static async createOrder(
    orderData: CreateOrderData,
  ): Promise<OrderWithDetails> {
    try {
      // Validar entrada
      this.validateOrderData(orderData);

      console.log(
        "Datos recibidos para crear orden:",
        JSON.stringify(orderData, null, 2),
      );

      // Calcular totales desde los items
      const computedSubtotal = this.calculateSubtotal(orderData.items);
      const computedShipping = this.calculateShippingCost(
        orderData.shipping_method,
        computedSubtotal,
      );
      const computedTax = this.calculateTax(computedSubtotal);

      // Reconciliar valores frontend vs servidor
      const shipping_cost = this.reconcileShipping(
        orderData.totals?.shipping,
        computedShipping,
      );
      const tax = this.reconcileTax(orderData.totals?.tax, computedTax);
      const total = this.reconcileTotal(
        orderData.totals?.total,
        computedSubtotal,
        shipping_cost,
        tax,
      );

      console.log("[ORDER DEBUG]", {
        subtotal: computedSubtotal,
        shipping_cost,
        tax,
        total,
      });

      // Obtener datos del usuario
      const userData = await this.getUserData(orderData.user_id);

      // Crear dirección de envío
      const shippingAddressData = this.buildShippingAddress(
        orderData,
        userData,
      );
      const address = await this.createShippingAddress(shippingAddressData);

      // Crear orden
      const order = await this.createOrderRecord(
        orderData,
        {
          subtotal: computedSubtotal,
          shipping_cost,
          tax,
          total,
        },
        address.id,
        shippingAddressData,
      );

      // Crear items de orden
      const items = await this.createOrderItems(order.id, orderData.items);

      // Obtener datos completos del usuario
      const user = await this.getUserInfo(orderData.user_id);

      return {
        ...order,
        items: items || [],
        user,
        total_items: orderData.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      };
    } catch (error) {
      console.error("Error en createOrder:", error);
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Obtener orden por ID con detalles completos
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
            name,
            email,
            phone
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Order not found
        }
        throw error;
      }

      if (!data) return null;

      const { order_items, users, ...rest } = data as any;

      return {
        ...rest,
        items: order_items || [],
        user: users,
        total_items: (order_items || []).reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        ),
      };
    } catch (error) {
      throw new Error(`Failed to get order: ${error}`);
    }
  }

  /**
   * Obtener órdenes de un usuario con paginación
   */
  static async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
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
          ),
          users (
            name,
            email,
            phone
          )
        `,
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const orders = (data || []).map((order: any) => {
        const { order_items, users, ...rest } = order;
        return {
          ...rest,
          items: order_items || [],
          user: users,
          total_items: (order_items || []).reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ),
        };
      });

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

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error}`);
    }
  }

  /**
   * Actualizar estado del pago y guardar ID de MercadoPago
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    mercadopagoOrderId?: string,
  ) {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (mercadopagoOrderId) {
        updateData.mercadopago_order_id = mercadopagoOrderId;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update payment status: ${error}`);
    }
  }

  /**
   * Actualizar referencia del payment (ID de MercadoPago)
   */
  static async updatePaymentReference(
    orderId: string,
    mercadopagoOrderId: string,
  ) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          mercadopago_order_id: mercadopagoOrderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update payment reference: ${error}`);
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

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error}`);
    }
  }

  /**
   * Obtener todas las órdenes con paginación y filtros (admin)
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
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
        { count: "exact" },
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

      if (error) throw error;

      const orders = (data || []).map((order: any) => {
        const { order_items, users, ...rest } = order;
        return {
          ...rest,
          items: order_items || [],
          user: users,
          total_items: (order_items || []).reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ),
        };
      });

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
        0,
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

  // ==================== MÉTODOS PRIVADOS (HELPER) ====================

  /**
   * Validar datos de entrada de la orden
   */
  private static validateOrderData(orderData: CreateOrderData): void {
    if (!orderData.shipping_address?.address?.trim()) {
      throw new Error(
        "El campo 'address' de la dirección de envío es obligatorio.",
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("La orden debe contener al menos un artículo.");
    }
  }

  /**
   * Calcular subtotal desde los items
   */
  private static calculateSubtotal(items: CreateOrderData["items"]): number {
    return items.reduce(
      (sum, item) => sum + (item.price ?? item.unit_price ?? 0) * item.quantity,
      0,
    );
  }

  /**
   * Reconciliar shipping: prefer frontend, pero validar vs server
   */
  private static reconcileShipping(
    frontendShipping: number | undefined,
    serverShipping: number,
  ): number {
    if (frontendShipping === undefined) return serverShipping;

    if (frontendShipping !== serverShipping) {
      console.warn(
        `[ORDER WARNING] shipping mismatch: frontend=${frontendShipping}, server=${serverShipping}. Using frontend.`,
      );
    }
    return frontendShipping;
  }

  /**
   * Reconciliar tax: prefer frontend, pero validar vs server
   */
  private static reconcileTax(
    frontendTax: number | undefined,
    serverTax: number,
  ): number {
    if (frontendTax === undefined) return serverTax;

    if (Math.abs(frontendTax - serverTax) > 0.5) {
      console.warn(
        `[ORDER WARNING] tax mismatch: frontend=${frontendTax}, server=${serverTax}. Using frontend.`,
      );
    }
    return frontendTax;
  }

  /**
   * Reconciliar total: prefer frontend, pero validar vs server
   */
  private static reconcileTotal(
    frontendTotal: number | undefined,
    subtotal: number,
    shipping: number,
    tax: number,
  ): number {
    const serverTotal = subtotal + shipping + tax;

    if (frontendTotal === undefined) return serverTotal;

    if (Math.abs(frontendTotal - serverTotal) > 1) {
      console.warn(
        `[ORDER WARNING] total mismatch: frontend=${frontendTotal}, server=${serverTotal}. Using frontend.`,
      );
    }
    return frontendTotal;
  }

  /**
   * Obtener datos del usuario
   */
  private static async getUserData(userId: string) {
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    if (userFetchError || !userData) {
      throw new Error(`No se pudo obtener el usuario con ID: ${userId}`);
    }

    return userData;
  }

  /**
   * Construir objeto de dirección de envío
   */
  private static buildShippingAddress(
    orderData: CreateOrderData,
    userData: any,
  ): any {
    return {
      user_id: orderData.user_id,
      type: "shipping",
      first_name:
        orderData.shipping_address.first_name ||
        userData.name?.split(" ")[0] ||
        "",
      last_name:
        orderData.shipping_address.last_name ||
        userData.name?.split(" ")[1] ||
        "",
      phone: orderData.shipping_address.phone || "",
      email: orderData.shipping_address.email || "",
      address_line_1: orderData.shipping_address.address || "",
      address_line_2: orderData.shipping_address.address_number || "",
      city: orderData.shipping_address.city,
      state:
        orderData.shipping_address.province ||
        orderData.shipping_address.state ||
        "",
      postal_code: orderData.shipping_address.postal_code,
      country: orderData.shipping_address.country || "AR",
    };
  }

  /**
   * Crear registro de dirección en tabla addresses
   */
  private static async createShippingAddress(shippingAddressData: any) {
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert(shippingAddressData)
      .select()
      .single();

    if (addressError) {
      throw new Error(
        `Failed to create shipping address: ${addressError.message}`,
      );
    }

    return address;
  }

  /**
   * Crear registro de orden
   */
  private static async createOrderRecord(
    orderData: CreateOrderData,
    totals: any,
    shippingAddressId: string,
    shippingAddressSnapshot: any,
  ) {
    const order_number = crypto.randomUUID();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number,
        user_id: orderData.user_id,
        status: "pending",
        payment_status: "pending",
        subtotal: totals.subtotal,
        shipping_cost: totals.shipping_cost,
        tax: totals.tax,
        total: totals.total,
        shipping_address_id: shippingAddressId,
        shipping_address: shippingAddressSnapshot as any,
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

    return order;
  }

  /**
   * Crear items de la orden
   */
  private static async createOrderItems(
    orderId: string,
    items: CreateOrderData["items"],
  ) {
    const orderItems: any[] = [];

    for (const item of items) {
      let product_variant_id =
        item.variant_id && item.variant_id.trim() !== ""
          ? item.variant_id
          : null;

      // Si no tiene variant_id, buscar el primero disponible
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", item.product_id)
        .limit(1);

      if (!variantsError && variantsData && variantsData.length > 0) {
        product_variant_id = (variantsData[0] as any).id;
      }

      const price = item.price ?? item.unit_price ?? 0;
      orderItems.push({
        order_id: orderId,
        product_id: item.product_id,
        product_variant_id: product_variant_id || null,
        product_name: item.product_id, // Será actualizado con join en DB
        quantity: item.quantity,
        unit_price: price,
        size_name: item.size,
        color_name: item.color,
      });
    }

    const { data: items_created, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select(
        `
        *,
        products (
          name,
          images,
          sku
        )
      `,
      );

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    return items_created;
  }

  /**
   * Obtener información completa del usuario
   */
  private static async getUserInfo(userId: string) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, phone")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new Error(`Failed to get user info: ${userError.message}`);
    }

    return user;
  }

  /**
   * Calcular costo de envío basado en método
   */
  private static calculateShippingCost(
    method: string,
    subtotal: number,
  ): number {
    // Envío gratis para compras mayores a $50,000
    if (subtotal >= 50000) return 0;

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
   * Calcular impuestos (IVA 21% en Argentina)
   */
  private static calculateTax(subtotal: number): number {
    return Math.round(subtotal * 0.21 * 100) / 100; // Redondear a 2 decimales
  }
}
