import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { MercadoPagoService } from "../services/mercadopago.service";
import { Order } from "../types/database.types";

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
    res: Response
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
    res: Response
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
        parseInt(limit as string)
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
    res: Response
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
    res: Response
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
    res: Response
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
        reason || "Cancelación solicitada por el usuario"
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
        status as any
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
    res: Response
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
      const items = order.items.map((item) => ({
        id: item.product_id,
        title: item.products?.name || "Producto",
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS",
        picture_url: item.products?.images?.[0] || "",
        description: `${item.products?.name || "Producto"} - ${
          item.size || ""
        } ${item.color || ""}`.trim(),
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
        order.id
      );

      res.json({
        success: true,
        data: {
          preference_id: preference.id,
          init_point: preference.init_point,
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
      // TODO: Implementar handleWebhook en MercadoPagoService
      // const result = await MercadoPagoService.handleWebhook(req.body);
      const result: {
        shouldUpdateOrder: boolean;
        payment: {
          external_reference?: string;
          status?: string;
          id?: number;
        } | null;
      } = { shouldUpdateOrder: false, payment: null };

      if (result.shouldUpdateOrder && result.payment) {
        const orderId = result.payment.external_reference;

        if (orderId) {
          let paymentStatus: "pending" | "paid" | "failed" | "refunded" =
            "pending";

          switch (result.payment.status) {
            case "approved":
              paymentStatus = "paid";
              break;
            case "rejected":
            case "cancelled":
              paymentStatus = "failed";
              break;
            case "refunded":
              paymentStatus = "refunded";
              break;
            default:
              paymentStatus = "pending";
          }

          await OrderService.updatePaymentStatus(
            orderId,
            paymentStatus,
            result.payment.id?.toString()
          );
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
