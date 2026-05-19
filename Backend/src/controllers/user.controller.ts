import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { supabase } from "../config/supabase";

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
   * Enviar email de confirmación para cambio de contraseña
   */
  static async sendPasswordChangeConfirmation(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { email, currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!email || !currentPassword || !newPassword || !userId) {
        res.status(400).json({
          success: false,
          message:
            "Email, contraseña actual, contraseña nueva y usuario requeridos",
        });
        return;
      }

      // VALIDACIÓN CRÍTICA: Verificar que la contraseña actual es correcta
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

        if (signInError) {
          res.status(401).json({
            success: false,
            message: "La contraseña actual es incorrecta",
          });
          return;
        }
      } catch (error: any) {
        res.status(401).json({
          success: false,
          message: "No se pudo validar tu contraseña. Intenta nuevamente.",
        });
        return;
      }

      // Generar token de confirmación
      const confirmationToken = require("crypto")
        .randomBytes(32)
        .toString("hex");
      const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      // Guardar token en metadata de usuario (temporal)
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            password_change_token: confirmationToken,
            password_change_expiry: tokenExpiry.toISOString(),
            password_change_new: newPassword,
          },
        },
      );

      if (updateError) {
        throw updateError;
      }

      // Construir link de confirmación
      const confirmationLink = `${process.env.FRONTEND_URL}/confirm-password-change?token=${confirmationToken}&userId=${userId}`;

      // Enviar email con servicio de emails
      const { EmailService } = await import("../services/email.service");
      const emailSent = await EmailService.sendPasswordChangeConfirmation(
        email,
        confirmationLink,
        req.user?.name?.split(" ")[0] || "Usuario",
      );

      if (!emailSent) {
        console.warn("Email sending failed, but continuing");
      }

      res.json({
        success: true,
        message:
          "Email de confirmación enviado. Por favor revisa tu bandeja de entrada.",
      });
    } catch (error) {
      console.error("Error sending password change confirmation:", error);
      res.status(500).json({
        success: false,
        message: "Error al enviar email de confirmación",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Reenviar email de confirmación para cambio de contraseña
   */
  static async resendPasswordChangeConfirmation(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const userId = req.user?.id;

      if (!email || !userId) {
        res.status(400).json({
          success: false,
          message: "Email y usuario requeridos",
        });
        return;
      }

      // Obtener el token y contraseña nuevos guardados en metadata
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.admin.getUserById(userId);

      if (userError || !authUser) {
        throw userError;
      }

      const passwordChangeToken = authUser.user_metadata?.password_change_token;
      const newPassword = authUser.user_metadata?.password_change_new;

      if (!passwordChangeToken || !newPassword) {
        res.status(400).json({
          success: false,
          message:
            "No hay solicitud de cambio de contraseña pendiente. Comienza de nuevo.",
        });
        return;
      }

      // Construir link de confirmación
      const confirmationLink = `${process.env.FRONTEND_URL}/confirm-password-change?token=${passwordChangeToken}&userId=${userId}`;

      // Reenviar email con servicio de emails
      const { EmailService } = await import("../services/email.service");
      const emailSent = await EmailService.sendPasswordChangeConfirmation(
        email,
        confirmationLink,
        req.user?.name?.split(" ")[0] || "Usuario",
      );

      if (!emailSent) {
        console.warn("Email sending failed, but continuing");
      }

      res.json({
        success: true,
        message:
          "Email de confirmación reenviado. Por favor revisa tu bandeja de entrada.",
      });
    } catch (error) {
      console.error("Error resending password change confirmation:", error);
      res.status(500).json({
        success: false,
        message: "Error al reenviar email de confirmación",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Confirmar cambio de contraseña (desde el link del email)
   */
  static async confirmPasswordChange(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { token, userId } = req.body;

      if (!token || !userId) {
        res.status(400).json({
          success: false,
          message: "Token y userId son requeridos",
        });
        return;
      }

      // Obtener datos del usuario
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.admin.getUserById(userId);

      if (userError || !user) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      const userData = user.user_metadata;
      const storedToken = userData?.password_change_token;
      const expiry = userData?.password_change_expiry;
      const newPassword = userData?.password_change_new;

      // Validar token
      if (storedToken !== token) {
        res.status(401).json({
          success: false,
          message: "Link de confirmación inválido",
        });
        return;
      }

      // Validar expiración
      if (new Date() > new Date(expiry)) {
        res.status(401).json({
          success: false,
          message: "El link de confirmación ha expirado",
        });
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: newPassword,
          user_metadata: {
            ...userData,
            password_change_token: null,
            password_change_expiry: null,
            password_change_new: null,
          },
        },
      );

      // Verificar resultado de la actualización antes de continuar
      if (updateError) {
        throw updateError;
      }

      // Revocar refresh tokens via Admin REST API (require SERVICE_ROLE_KEY)
      try {
        const adminUrl = `${process.env.SUPABASE_URL}/admin/v1/users/${userId}/revoke-refresh-tokens`;
        const resp = await fetch(adminUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
        });

        if (!resp.ok) {
          console.warn(
            "Servidor: revocar-refresh-tokens falló:",
            await resp.text(),
          );
        } else {
          console.log(
            "Servidor: revocación de refresh tokens solicitada correctamente",
          );
        }
      } catch (err) {
        console.warn(
          "Servidor: error al intentar revocar refresh tokens:",
          err,
        );
      }

      res.json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error: any) {
      console.error("Error confirming password change:", error);
      res.status(500).json({
        success: false,
        message: "Error al confirmar el cambio de contraseña",
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
      res.status(500).json({
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
        parseInt(limit as string),
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
