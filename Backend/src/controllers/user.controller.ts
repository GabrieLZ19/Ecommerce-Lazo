import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  /**
   * Verificar si un email ya existe
   */
  static async checkEmailExists(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email es requerido",
        });
        return;
      }

      const exists = await UserService.checkEmailExists(email);

      res.json({
        success: true,
        exists,
        message: exists ? "Email ya registrado" : "Email disponible",
      });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({
        success: false,
        message: "Error al verificar email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Registrar un nuevo usuario
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      // Validar campos requeridos
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          message: "Email, contraseña y nombre son requeridos",
        });
        return;
      }

      const result = await UserService.createUser({
        email,
        password,
        name,
        phone,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Usuario registrado exitosamente",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({
        success: false,
        message: "Error al registrar usuario",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email y contraseña son requeridos",
        });
        return;
      }

      const result = await UserService.signIn(email, password);

      res.json({
        success: true,
        data: result,
        message: "Inicio de sesión exitoso",
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(req: Request, res: Response) {
    try {
      await UserService.signOut();

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({
        success: false,
        message: "Error al cerrar sesión",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const profile = await UserService.getUserById(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: "Perfil no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener perfil",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const updateData = req.body;
      const profile = await UserService.updateUser(userId, updateData);

      res.json({
        success: true,
        data: profile,
        message: "Perfil actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar perfil",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Eliminar cuenta de usuario
   */
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      await UserService.deleteUser(userId);

      res.json({
        success: true,
        message: "Cuenta eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar cuenta",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email es requerido",
        });
        return;
      }

      await UserService.resetPassword(email);

      res.json({
        success: true,
        message: "Se ha enviado un email para restablecer la contraseña",
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({
        success: false,
        message: "Error al solicitar restablecimiento de contraseña",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Actualizar contraseña
   */
  static async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        res.status(400).json({
          success: false,
          message: "Nueva contraseña es requerida",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        });
        return;
      }

      await UserService.updatePassword(newPassword);

      res.json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar contraseña",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Sincronizar perfil desde token de Supabase (usado por OAuth flows)
   */
  static async syncProfile(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
          .status(400)
          .json({ success: false, message: "Authorization token required" });
        return;
      }

      const token = authHeader.substring(7);
      const authUser = await UserService.verifySession(token);

      if (!authUser) {
        res.status(401).json({ success: false, message: "Invalid token" });
        return;
      }

      const profile = await UserService.upsertProfileFromAuth(authUser);

      res.json({ success: true, data: profile });
    } catch (error) {
      console.error("Error syncing profile:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error syncing profile",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  /**
   * Obtener todos los usuarios (admin)
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await UserService.getUsers(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener usuario por ID (admin)
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de usuario es requerido",
        });
        return;
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener usuario",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}
