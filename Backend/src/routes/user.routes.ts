import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Rutas de autenticación
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.post("/forgot-password", UserController.forgotPassword);

// Rutas protegidas
router.get("/profile", requireAuth, UserController.getProfile);
router.put("/profile", requireAuth, UserController.updateProfile);
router.delete("/account", requireAuth, UserController.deleteAccount);
router.patch("/password", requireAuth, UserController.updatePassword);

// Rutas de administrador
router.get("/", requireAuth, requireAdmin, UserController.getUsers);
router.get("/:id", requireAuth, requireAdmin, UserController.getUserById);

export default router;
