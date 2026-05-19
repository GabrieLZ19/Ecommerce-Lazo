import { supabase } from "@/lib/supabase";

export class PasswordService {
  /**
   * Enviar email de confirmación para cambio de contraseña
   * El token se maneja internamente, NO se expone
   */
  static async sendPasswordChangeConfirmation(
    email: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener sesión de forma segura (sin exponerla)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No hay sesión activa");
      }

      // Hacer la llamada API CON el token (sin exponerlo en el cliente)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/send-password-change-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email,
            currentPassword,
            newPassword,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al enviar el email de confirmación",
        );
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Error desconocido",
      };
    }
  }
}
