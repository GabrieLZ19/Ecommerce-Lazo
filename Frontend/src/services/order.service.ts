import { supabase } from "@/lib/supabase";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  payment_fee: number;
  total: number;
  external_reference?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_image?: string;
  variant_sku?: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface ShippingAddress {
  id: string;
  order_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  address_number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  notes?: string;
}

export interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    color: string;
    size: string;
  }>;
  shipping_address: Omit<ShippingAddress, "id" | "order_id">;
  payment_method: string;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    payment_fee: number;
    total: number;
  };
  notes?: string;
}

export class OrderService {
  /**
   * Iniciar pago MercadoPago llamando al backend Express
   */
  static async startMercadoPagoPayment(orderId: string): Promise<string> {
    // Obtener token JWT de Supabase
    const { supabase } = await import("@/lib/supabase");
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ orderId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error creando preferencia");
    }

    const result = await response.json();
    return result.data.init_point;
  }
  /**
   * Crear una nueva orden
   */
  static async createOrder(
    userId: string,
    orderData: CreateOrderRequest
  ): Promise<Order> {
    // Obtener token JWT de Supabase
    const { supabase } = await import("@/lib/supabase");
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error creando orden");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Obtener orden por ID
   */
  static async getOrderById(orderId: string): Promise<Order> {
    try {
      // Obtener token JWT de Supabase
      const { supabase } = await import("@/lib/supabase");
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error obteniendo orden");
      }

      const result = await response.json();
      // El backend retorna { success, data }
      return result.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Obtener órdenes por usuario
   */
  static async getOrdersByUser(
    userId: string,
    limit: number = 20
  ): Promise<Order[]> {
    try {
      // Obtener token JWT de Supabase
      const { supabase } = await import("@/lib/supabase");
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders?page=1&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error obteniendo órdenes");
      }

      const result = await response.json();
      // El backend retorna { success, data: { orders, ... } }
      return result.data.orders;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  }

  /**
   * Actualizar estado de orden
   */
  static async updateOrderStatus(
    orderId: string,
    status: string,
    paymentStatus?: string
  ): Promise<Order> {
    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado");
      }

      const updateData: any = { status };
      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      const { data: order, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  /**
   * Agregar número de tracking
   */
  static async updateTrackingNumber(
    orderId: string,
    trackingNumber: string
  ): Promise<Order> {
    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado");
      }

      const { error } = await supabase
        .from("orders")
        .update({ tracking_number: trackingNumber })
        .eq("id", orderId);

      if (error) throw error;

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error("Error updating tracking number:", error);
      throw error;
    }
  }

  /**
   * Datos mock para desarrollo
   */
  static getMockOrders(): Order[] {
    return [
      {
        id: "1",
        order_number: "ORD-ABC123",
        user_id: "user1",
        status: "shipped",
        payment_status: "approved",
        payment_method: "mercadopago",
        subtotal: 75000,
        shipping_cost: 0,
        tax: 14500,
        payment_fee: 0,
        total: 89500,
        tracking_number: "TR123456789",
        estimated_delivery: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: "item1",
            order_id: "1",
            product_id: "prod1",
            variant_id: "var1",
            product_name: "Remera Básica Premium",
            product_image: "/images/products/remera-basica.jpg",
            variant_sku: "REM-BAS-NEG-M",
            color: "Negro",
            size: "M",
            quantity: 2,
            unit_price: 25000,
            total_price: 50000,
            created_at: new Date().toISOString(),
          },
          {
            id: "item2",
            order_id: "1",
            product_id: "prod2",
            variant_id: "var2",
            product_name: "Jean Clásico",
            product_image: "/images/products/jean-clasico.jpg",
            variant_sku: "JEA-CLA-AZU-32",
            color: "Azul",
            size: "32",
            quantity: 1,
            unit_price: 25000,
            total_price: 25000,
            created_at: new Date().toISOString(),
          },
        ],
        shipping_address: {
          id: "addr1",
          order_id: "1",
          first_name: "Juan",
          last_name: "Pérez",
          email: "juan@ejemplo.com",
          phone: "+54 9 11 1234-5678",
          address: "Av. Corrientes",
          address_number: "1234",
          floor: "3",
          apartment: "A",
          city: "Buenos Aires",
          province: "Buenos Aires",
          postal_code: "1043",
          country: "AR",
          notes: "Timbre 3A",
        },
      },
      {
        id: "2",
        order_number: "ORD-DEF456",
        user_id: "user1",
        status: "pending",
        payment_status: "pending",
        payment_method: "bank_transfer",
        subtotal: 45000,
        shipping_cost: 5000,
        tax: 9450,
        payment_fee: -4500, // 10% descuento
        total: 54950,
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: "item3",
            order_id: "2",
            product_id: "prod3",
            product_name: "Zapatillas Deportivas",
            product_image: "/images/products/zapatillas.jpg",
            variant_sku: "ZAP-DEP-BLA-42",
            color: "Blanco",
            size: "42",
            quantity: 1,
            unit_price: 45000,
            total_price: 45000,
            created_at: new Date().toISOString(),
          },
        ],
        shipping_address: {
          id: "addr2",
          order_id: "2",
          first_name: "Juan",
          last_name: "Pérez",
          email: "juan@ejemplo.com",
          phone: "+54 9 11 1234-5678",
          address: "Av. Corrientes",
          address_number: "1234",
          city: "Buenos Aires",
          province: "Buenos Aires",
          postal_code: "1043",
          country: "AR",
        },
      },
    ];
  }

  /**
   * Formatear precio
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  }

  /**
   * Formatear fecha
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Obtener badge de estado
   */
  static getStatusBadge(status: string, paymentStatus: string) {
    if (paymentStatus === "approved" && status === "shipped") {
      return { label: "Enviado", variant: "default" as const, color: "blue" };
    } else if (paymentStatus === "approved" && status === "confirmed") {
      return {
        label: "Confirmado",
        variant: "default" as const,
        color: "green",
      };
    } else if (paymentStatus === "pending") {
      return {
        label: "Pago Pendiente",
        variant: "secondary" as const,
        color: "yellow",
      };
    } else if (paymentStatus === "rejected") {
      return {
        label: "Pago Rechazado",
        variant: "destructive" as const,
        color: "red",
      };
    } else {
      return {
        label: "Procesando",
        variant: "secondary" as const,
        color: "gray",
      };
    }
  }
}
