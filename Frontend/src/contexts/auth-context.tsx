"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

// Importamos supabase condicionalmente
let supabase: any = null;

try {
  const supabaseModule = require("@/lib/supabase");
  supabase = supabaseModule.supabase;
} catch (error) {
  console.warn(
    "Supabase not configured properly. Please set up environment variables."
  );
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithOAuth: (provider: "google" | "facebook") => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  isConfigured: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = !!supabase;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        // Si hay sesión, sincronizar perfil en backend
        if (session?.access_token) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/users/sync-profile`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          } catch (syncErr) {
            console.warn("Failed to sync profile with backend:", syncErr);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
      // Cuando haya una nueva sesión, sincronizar perfil en backend
      if (session?.access_token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync-profile`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (syncErr) {
          console.warn("Failed to sync profile on auth state change:", syncErr);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    if (!supabase) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      console.log("Auth Context - Iniciando signUp con:", {
        email,
        userData,
        supabaseConfigured: !!supabase,
      });

      // Verificar email duplicado a través del backend (más seguro)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/check-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.exists) {
            console.log("Auth Context - Email ya registrado (backend):", email);
            return {
              data: null,
              error: "Este email ya está registrado. Intenta iniciar sesión.",
            };
          }
        }
      } catch (apiError) {
        console.warn(
          "Auth Context - Error verificando email via API:",
          apiError
        );
        // Si falla la API, continuar con el registro (fallback)
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            full_name: `${userData.first_name} ${userData.last_name}`.trim(),
          },
        },
      });

      console.log("Auth Context - Respuesta de Supabase:", { data, error });

      if (error) {
        console.error("Auth Context - Error en signUp:", error);
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("Auth Context - Exception en signUp:", error);
      return {
        data: null,
        error:
          error.message ||
          error.error_description ||
          "Error desconocido en el registro",
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const signInWithOAuth = async (provider: "google" | "facebook") => {
    if (!supabase) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      // Supabase will redirect the user to the provider's consent page
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/`
              : undefined,
        },
      });

      if (error) {
        console.error("Auth Context - signInWithOAuth error:", error);
        return { data: null, error: error.message || error };
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || String(err) };
    }
  };

  const signOut = async () => {
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!supabase) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: profileData,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    isConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
