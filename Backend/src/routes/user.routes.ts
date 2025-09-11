import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Rutas públicas (sin autenticación)
router.post("/check-email", UserController.checkEmailExists); // Nueva ruta para validar email
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.post("/forgot-password", UserController.forgotPassword);
// Ruta para sincronizar perfil desde token (útil después de login OAuth en frontend)
router.post("/sync-profile", UserController.syncProfile);

// Rutas protegidas
router.get("/profile", requireAuth, UserController.getProfile);
router.put("/profile", requireAuth, UserController.updateProfile);
router.delete("/account", requireAuth, UserController.deleteAccount);
router.patch("/password", requireAuth, UserController.updatePassword);

// Rutas de administrador
router.get("/", requireAuth, requireAdmin, UserController.getUsers);
router.get("/:id", requireAuth, requireAdmin, UserController.getUserById);

export default router;
