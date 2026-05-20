import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { MercadoPagoService } from "../services/mercadopago.service";
import { config } from "../config/environment";
import { supabase } from "../config/supabase";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}

export class OrderController {
  /**
   * Crear una nueva orden
   */
  static async createOrder(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const orderData = {
        ...req.body,
        user_id: userId,
      };

      const order = await OrderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        data: order,
        message: "Orden creada exitosamente",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear orden",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener órdenes del usuario
   */
  static async getUserOrders(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const { page = 1, limit = 10 } = req.query;

      const result = await OrderService.getUserOrders(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting user orders:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener órdenes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener orden por ID
   */
  static async getOrderById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de orden es requerido",
        });
        return;
      }

      const order = await OrderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Orden no encontrada",
        });
        return;
      }

      // Verificar que la orden pertenece al usuario o es admin
      if (order.user_id !== userId && !req.user?.isAdmin) {
        res.status(403).json({
          success: false,
          message: "No tienes permisos para ver esta orden",
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener orden",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Actualizar estado de una orden (solo admin)
   */
  static async updateOrderStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de orden es requerido",
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: "Estado es requerido",
        });
        return;
      }

      const order = await OrderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order,
        message: "Estado de orden actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar estado de orden",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Cancelar una orden
   */
  static async cancelOrder(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de orden es requerido",
        });
        return;
      }

      const existingOrder = await OrderService.getOrderById(id);

      if (!existingOrder) {
        res.status(404).json({
          success: false,
          message: "Orden no encontrada",
        });
        return;
      }

      if (existingOrder.user_id !== userId && !req.user?.isAdmin) {
        res.status(403).json({
          success: false,
          message: "No tienes permisos para cancelar esta orden",
        });
        return;
      }

      const order = await OrderService.cancelOrder(
        id,
        reason || "Cancelación solicitada por el usuario",
      );

      res.json({
        success: true,
        data: order,
        message: "Orden cancelada exitosamente",
      });
    } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({
        success: false,
        message: "Error al cancelar orden",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener todas las órdenes (admin)
   */
  static async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const result = await OrderService.getAllOrders(
        parseInt(page as string),
        parseInt(limit as string),
        status as any,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting all orders:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener órdenes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener estadísticas de órdenes (admin)
   */
  static async getOrderStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await OrderService.getOrderStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting order stats:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Crear preferencia de pago con MercadoPago
   */
  static async createPaymentPreference(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "ID de orden es requerido",
        });
        return;
      }

      const order = await OrderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Orden no encontrada",
        });
        return;
      }

      if (order.user_id !== userId) {
        res.status(403).json({
          success: false,
          message: "No tienes permisos para procesar esta orden",
        });
        return;
      }

      // Preparar items para MercadoPago
      const items = order.items.map((item: any) => ({
        id: item.product_id,
        title: item.products?.name || item.product_name || "Producto",
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "ARS",
        picture_url: item.products?.images?.[0] || "",
        description:
          `${item.products?.name || item.product_name || "Producto"} - ${
            item.size_name || ""
          } ${item.color_name || ""}`.trim(),
      }));

      // Preparar información del comprador
      let firstName = "";
      let lastName = "";
      if ("first_name" in order.user && "last_name" in order.user) {
        firstName = (order.user as any).first_name || "";
        lastName = (order.user as any).last_name || "";
      } else if (order.user.name) {
        const nameParts = order.user.name.split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      }
      const payer = {
        name: firstName,
        surname: lastName,
        email: order.user.email,
        phone: order.user.phone
          ? {
              area_code: "11",
              number: order.user.phone,
            }
          : {
              area_code: "11",
              number: "1234567890",
            },
      };

      const preference = await MercadoPagoService.createPreference(
        items,
        payer,
        order.id,
      );

      // Si estamos en desarrollo/no producción, usar sandbox_init_point si está disponible
      const init_point =
        config.isProduction === true
          ? preference.init_point
          : preference.sandbox_init_point || preference.init_point;

      res.json({
        success: true,
        data: {
          preference_id: preference.id,
          init_point,
        },
      });
    } catch (error) {
      console.error("Error creating payment preference:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear preferencia de pago",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Webhook de MercadoPago
   */

  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log("[Webhook MP] Headers:", req.headers);
      console.log("[Webhook MP] Body:", req.body);

      // Obtener headers para validación
      const signature = req.headers["x-signature"] as string;
      const requestId = req.headers["x-request-id"] as string;

      // Validar webhook (opcional, pero recomendado)
      if (signature && requestId && req.body?.data?.id) {
        const isValid = MercadoPagoService.validateWebhookSignature(
          req.body.data.id,
          signature,
          requestId,
        );
        if (!isValid) {
          console.warn("[Webhook MP] Firma inválida");
          res.status(401).json({ success: false, error: "Invalid signature" });
          return;
        }
      }

      // Procesar webhook
      const result = await MercadoPagoService.handleWebhook(req.body);

      if (result.shouldUpdateOrder && result.payment) {
        const orderId = result.payment.external_reference;
        const paymentStatus = result.payment.status;

        if (!orderId) {
          res.status(400).json({
            success: false,
            message: "external_reference no encontrada",
          });
          return;
        }

        // Mapear estado de MP a estado de orden
        let orderPaymentStatus: "pending" | "paid" | "failed" | "refunded" =
          "pending";
        let orderStatus: "pending" | "confirmed" | "cancelled" = "pending";

        switch (paymentStatus) {
          case "approved":
            orderPaymentStatus = "paid";
            orderStatus = "confirmed";
            break;
          case "rejected":
          case "cancelled":
            orderPaymentStatus = "failed";
            orderStatus = "cancelled";
            break;
          case "refunded":
            orderPaymentStatus = "refunded";
            orderStatus = "cancelled";
            break;
          default:
            orderPaymentStatus = "pending";
            orderStatus = "pending";
        }

        console.log(
          `[Webhook MP] Actualizando orden ${orderId}: payment_status=${orderPaymentStatus}, status=${orderStatus}`,
        );

        // Actualizar estado de pago
        await OrderService.updatePaymentStatus(
          orderId,
          orderPaymentStatus,
          result.payment.id?.toString(),
        );

        // Si pago fue aprobado, decrementar stock
        if (orderStatus === "confirmed") {
          try {
            const order = await OrderService.getOrderById(orderId);

            if (order && order.items) {
              for (const item of order.items) {
                if (item.product_variant_id) {
                  // Llamar RPC para decrementar stock
                  const { data, error: updateError } = await supabase.rpc(
                    "decrement_stock",
                    {
                      variant_id: item.product_variant_id,
                      quantity: item.quantity,
                    },
                  );

                  if (updateError) {
                    console.error(
                      `[Webhook MP] Error decrementando stock para variante ${item.product_variant_id}:`,
                      updateError,
                    );
                  } else {
                    console.log(
                      `[Webhook MP] ✅ Stock decrementado: ${item.product_name} -${item.quantity}`,
                    );
                  }
                } else {
                  console.warn(
                    `[Webhook MP] ⚠️ Variante no encontrada para: ${item.product_name}`,
                  );
                }
              }
            }
          } catch (stockError) {
            console.error(
              "[Webhook MP] ❌ Error actualizando stock:",
              stockError,
            );
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({
        success: false,
        message: "Error al procesar webhook",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
