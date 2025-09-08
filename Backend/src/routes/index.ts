import { Router } from "express";
import productRoutes from "./product.routes";
import userRoutes from "./user.routes";
import orderRoutes from "./order.routes";

const router = Router();

// API routes
router.use("/products", productRoutes);
router.use("/users", userRoutes);
router.use("/orders", orderRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

export default router;
