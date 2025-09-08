import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import {
  requireAuth,
  requireAdmin,
  optionalAuth,
} from "../middleware/auth.middleware";

const router = Router();

// Rutas públicas
router.get("/", optionalAuth, ProductController.getProducts);
router.get("/featured", ProductController.getFeaturedProducts);
router.get("/:id", ProductController.getProductById);
router.get("/slug/:slug", ProductController.getProductBySlug);
router.get("/:id/related", ProductController.getRelatedProducts);

// Rutas protegidas (admin)
router.post("/", requireAuth, requireAdmin, ProductController.createProduct);
router.put("/:id", requireAuth, requireAdmin, ProductController.updateProduct);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  ProductController.deleteProduct
);
router.patch(
  "/:id/stock",
  requireAuth,
  requireAdmin,
  ProductController.updateStock
);

export default router;
