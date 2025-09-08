import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}

/**
 * Middleware para verificar autenticación
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token de autorización requerido",
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar el token con Supabase
    const user = await UserService.verifySession(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Token inválido",
      });
      return;
    }

    // Obtener información completa del usuario
    const userProfile = await UserService.getUserById(user.id);

    if (!userProfile) {
      res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    // Agregar usuario al request
    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      isAdmin: userProfile.email === "admin@lazo.com", // Simplificado para demo
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Error de autenticación",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Middleware para verificar permisos de administrador
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({
      success: false,
      message: "Permisos de administrador requeridos",
    });
    return;
  }

  next();
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = await UserService.verifySession(token);

      if (user) {
        const userProfile = await UserService.getUserById(user.id);
        if (userProfile) {
          req.user = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            isAdmin: userProfile.email === "admin@lazo.com",
          };
        }
      }
    }

    next();
  } catch (error) {
    // En modo opcional, continuamos sin autenticación
    next();
  }
};
