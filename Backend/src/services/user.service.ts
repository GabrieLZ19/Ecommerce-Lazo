import { supabase } from "../config/supabase";
import type { User, Database } from "../types/database.types";

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  address?: {
    street: string;
    number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface UserProfile extends User {
  orders_count?: number;
  total_spent?: number;
}

export class UserService {
  /**
   * Verificar si un email ya existe
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = No rows found
        throw error;
      }

      return !!data; // Retorna true si encontró el email, false si no
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw new Error("Error al verificar email");
    }
  }

  /**
   * Crear un nuevo usuario
   */
  static async createUser(userData: CreateUserData) {
    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
          },
        },
      });

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Crear perfil de usuario en la tabla users
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation error: ${profileError.message}`);
      }

      return {
        user: authData.user,
        profile: profileData,
        session: authData.session,
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          orders (
            id,
            total,
            status
          )
        `
        )
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Usuario no encontrado
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Calcular estadísticas del usuario
      const orders = data.orders || [];
      const orders_count = orders.length;
      const total_spent = orders
        .filter((order: any) => order.status === "completed")
        .reduce((sum: number, order: any) => sum + order.total, 0);

      return {
        ...data,
        orders_count,
        total_spent,
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`);
    }
  }

  /**
   * Obtener usuario por email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Usuario no encontrado
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  static async updateUser(userId: string, updateData: UpdateUserData) {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(userId: string) {
    try {
      // Primero eliminar el perfil
      const { error: profileError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (profileError) {
        throw new Error(`Failed to delete profile: ${profileError.message}`);
      }

      // Luego eliminar de Auth (requiere privilegios admin)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(`Failed to delete auth user: ${authError.message}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  /**
   * Iniciar sesión
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Sign in error: ${error.message}`);
      }

      // Obtener perfil del usuario
      const profile = await this.getUserById(data.user.id);

      return {
        user: data.user,
        session: data.session,
        profile,
      };
    } catch (error) {
      throw new Error(`Failed to sign in: ${error}`);
    }
  }

  /**
   * Cerrar sesión
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to sign out: ${error}`);
    }
  }

  /**
   * Restablecer contraseña
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        throw new Error(`Reset password error: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to reset password: ${error}`);
    }
  }

  /**
   * Actualizar contraseña
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(`Update password error: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update password: ${error}`);
    }
  }

  /**
   * Verificar token de sesión
   */
  static async verifySession(token: string) {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error) {
        throw new Error(`Session verification error: ${error.message}`);
      }

      return data.user;
    } catch (error) {
      throw new Error(`Failed to verify session: ${error}`);
    }
  }

  /**
   * Upsert user profile from Supabase Auth user object
   */
  static async upsertProfileFromAuth(authUser: any) {
    try {
      if (!authUser || !authUser.id) {
        throw new Error("Invalid auth user");
      }

      const profile = {
        id: authUser.id,
        email: authUser.email,
        name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          null,
        phone: authUser.user_metadata?.phone || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("users")
        .upsert([profile], { onConflict: "id" })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to upsert profile from auth: ${error}`);
    }
  }

  /**
   * Obtener usuarios con paginación (admin)
   */
  static async getUsers(page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        users: data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }
}
