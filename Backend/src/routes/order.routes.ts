import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Rutas de usuario
router.post("/", requireAuth, OrderController.createOrder);
router.get("/my-orders", requireAuth, OrderController.getUserOrders);
router.get("/:id", requireAuth, OrderController.getOrderById);
router.patch("/:id/cancel", requireAuth, OrderController.cancelOrder);

// Rutas de pago
router.post(
  "/:orderId/payment",
  requireAuth,
  OrderController.createPaymentPreference
);

// Webhook de MercadoPago (sin autenticación)
router.post("/webhook/mercadopago", OrderController.handleWebhook);

// Rutas de administrador
router.get("/", requireAuth, requireAdmin, OrderController.getAllOrders);
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  OrderController.updateOrderStatus
);
router.get(
  "/admin/stats",
  requireAuth,
  requireAdmin,
  OrderController.getOrderStats
);

export default router;
