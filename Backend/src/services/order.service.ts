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

      // Calcular totales desde los items
      const computedSubtotal = orderData.items.reduce(
        (sum, item) =>
          sum + (item.price ?? item.unit_price ?? 0) * item.quantity,
        0
      );

      // Cálculo del shipping server-side
      const computedShipping = this.calculateShippingCost(
        orderData.shipping_method,
        computedSubtotal
      );

      // Si el frontend envía totals, preferimos su shipping pero validamos
      let shipping_cost = computedShipping;
      if (orderData.totals && typeof orderData.totals.shipping === "number") {
        shipping_cost = orderData.totals.shipping;
        if (shipping_cost !== computedShipping) {
          console.warn(
            `[ORDER WARNING] shipping provided by frontend (${shipping_cost}) differs from server calculation (${computedShipping}). Using frontend value but verify.`
          );
        }
      }

      // Tax: preferimos valor calculado por servidor si no viene
      const computedTax = this.calculateTax(computedSubtotal);
      let tax_amount = computedTax;
      if (orderData.totals && typeof orderData.totals.tax === "number") {
        tax_amount = orderData.totals.tax;
        if (Math.abs(tax_amount - computedTax) > 0.5) {
          console.warn(
            `[ORDER WARNING] tax provided by frontend (${tax_amount}) differs from server calculation (${computedTax}). Using frontend value.`
          );
        }
      }

      // Total: prefer frontend total if provided, otherwise calcular
      let total = computedSubtotal + shipping_cost + tax_amount;
      if (orderData.totals && typeof orderData.totals.total === "number") {
        const frontendTotal = orderData.totals.total;
        if (Math.abs(frontendTotal - total) > 1) {
          console.warn(
            `[ORDER WARNING] total provided by frontend (${frontendTotal}) differs from server calculation (${total}). Using frontend total.`
          );
        }
        total = frontendTotal;
      }

      const subtotal = computedSubtotal;
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
          billing_address_snapshot:
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
      const orderItems: any[] = [];
      for (const item of orderData.items) {
        // Normalizar variant_id: tratar cadena vacía como NULL
        let product_variant_id =
          item.variant_id && item.variant_id.trim() !== ""
            ? item.variant_id
            : null;

        // Si no se recibe variant_id, intentar obtener la primera variante disponible
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
          // asegurar NULL en vez de cadena vacía para campos UUID
          product_variant_id: product_variant_id || null,
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

      if (!data) return null;

      // Obtener shipping_address si existe shipping_address_id
      let shipping_address = null;
      try {
        if (data.shipping_address_id) {
          const { data: addr, error: addrErr } = await supabase
            .from("addresses")
            .select("*")
            .eq("id", data.shipping_address_id)
            .single();
          if (!addrErr) shipping_address = addr;
        }
      } catch (addrErr) {
        console.warn("Could not fetch shipping address:", addrErr);
      }

      // Desestructurar para evitar devolver duplicados (order_items, users)
      const { order_items, users, ...rest } = data as any;

      return {
        ...rest,
        items: order_items || [],
        user: users,
        shipping_address,
        // exponer `tax` para compatibilidad con frontend (valor real en tax_amount)
        tax: (rest as any).tax_amount ?? (rest as any).tax ?? 0,
        total_items: (order_items || []).reduce(
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

      // Mapear y enriquecer órdenes: eliminar duplicados y adjuntar shipping_address
      const orders = await Promise.all(
        (data || []).map(async (order: any) => {
          const { order_items, users, shipping_address_id, ...rest } = order;

          let shipping_address = null;
          try {
            if (shipping_address_id) {
              const { data: addr, error: addrErr } = await supabase
                .from("addresses")
                .select("*")
                .eq("id", shipping_address_id)
                .single();
              if (!addrErr) shipping_address = addr;
            }
          } catch (addrErr) {
            console.warn(
              "Could not fetch shipping address for order",
              order.id,
              addrErr
            );
          }

          return {
            ...rest,
            items: order_items || [],
            user: users,
            shipping_address,
            tax: (rest as any).tax_amount ?? (rest as any).tax ?? 0,
            total_items: (order_items || []).reduce(
              (sum: number, item: any) => sum + item.quantity,
              0
            ),
          };
        })
      );

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
          current_payment_id: paymentId,
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
   * Actualizar la referencia al payment actual en la orden (current_payment_id)
   */
  static async updatePaymentReference(orderId: string, paymentId: string) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          current_payment_id: paymentId,
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

      // Mapear y enriquecer órdenes (similar a getUserOrders)
      const orders = await Promise.all(
        (data || []).map(async (order: any) => {
          const { order_items, users, shipping_address_id, ...rest } = order;

          let shipping_address = null;
          try {
            if (shipping_address_id) {
              const { data: addr, error: addrErr } = await supabase
                .from("addresses")
                .select("*")
                .eq("id", shipping_address_id)
                .single();
              if (!addrErr) shipping_address = addr;
            }
          } catch (addrErr) {
            console.warn(
              "Could not fetch shipping address for order",
              order.id,
              addrErr
            );
          }

          return {
            ...rest,
            items: order_items || [],
            user: users,
            shipping_address,
              tax: (rest as any).tax_amount ?? (rest as any).tax ?? 0,
              total_items: (order_items || []).reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
              ),
          };
        })
      );

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
