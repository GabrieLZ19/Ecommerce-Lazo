/**
 * Servicio de emails - Gmail + Nodemailer (desarrollo)
 */

export class EmailService {
  static async sendPasswordChangeConfirmation(
    email: string,
    confirmationLink: string,
    userName?: string,
  ): Promise<boolean> {
    try {
      // Si está configurado Gmail, usarlo
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        return await this.sendViaGmail(email, confirmationLink, userName);
      }

      // Si no, usar Resend
      return await this.sendViaResend(email, confirmationLink, userName);
    } catch (error) {
      console.error("Error in EmailService:", error);
      return false;
    }
  }

  /**
   * Enviar via Gmail (Nodemailer)
   */
  private static async sendViaGmail(
    email: string,
    confirmationLink: string,
    userName?: string,
  ): Promise<boolean> {
    try {
      const nodemailer = await import("nodemailer");

      const transporter = nodemailer.default.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const htmlContent = this.getPasswordChangeEmailTemplate(
        confirmationLink,
        userName,
      );

      const info = await transporter.sendMail({
        from: `"LAZO" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Cambio de Contraseña - LAZO",
        html: htmlContent,
      });

      console.log("✅ Email enviado via Gmail:");
      console.log(`   Para: ${email}`);
      console.log(`   ID: ${info.messageId}`);
      console.log(`   Hora: ${new Date().toISOString()}`);

      return true;
    } catch (error) {
      console.error("❌ Error enviando email via Gmail:", error);
      return false;
    }
  }

  /**
   * Enviar via Resend (con dominio verificado)
   */
  private static async sendViaResend(
    email: string,
    confirmationLink: string,
    userName?: string,
  ): Promise<boolean> {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const htmlContent = this.getPasswordChangeEmailTemplate(
        confirmationLink,
        userName,
      );

      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Cambio de Contraseña - LAZO",
        html: htmlContent,
      });

      if (response.error) {
        console.error("❌ Error enviando email via Resend:", response.error);
        return false;
      }

      console.log("✅ Email enviado via Resend:");
      console.log(`   Para: ${email}`);
      console.log(`   ID: ${response.data?.id}`);
      console.log(`   Hora: ${new Date().toISOString()}`);

      return true;
    } catch (error) {
      console.error("❌ Error enviando email via Resend:", error);
      return false;
    }
  }

  /**
   * Template HTML para email de confirmación
   */
  /**
   * Template HTML profesional para email con colores oscuros (tema LAZO)
   */
  private static getPasswordChangeEmailTemplate(
    confirmationLink: string,
    userName?: string,
  ): string {
    // Colores oscuros del sitio
    const darkBg = "#1a1a1a"; // Negro muy oscuro
    const darkGray = "#2d2d2d"; // Gris oscuro
    const lightGray = "#f5f5f5"; // Blanco grisáceo
    const textDark = "#1f2937"; // Texto oscuro
    const textLight = "#e5e7eb"; // Texto claro
    const accentColor = "#667eea"; // Accent (igual que en LAZO)
    const successColor = "#10b981"; // Verde

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Cambio de Contraseña - LAZO</title>
</head>
<body style="margin: 20px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: ${textDark}; background-color: ${darkGray};">
    <div style="max-width: 600px; margin: 32px auto; background-color: ${darkBg}; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid ${darkGray};">
        
        <!-- Header -->
        <div style="background-color: #000000; padding: 48px 40px; text-align: center; border-bottom: 3px solid ${accentColor};">
            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">LAZO</h1>
            <p style="margin: 12px 0 0 0; font-size: 14px; font-weight: 500; color: ${lightGray};">Confirmación de Cambio de Contraseña</p>
        </div>

        <!-- Content -->
        <div style="padding: 48px 40px;">
            <!-- Greeting -->
            <h2 style="margin: 0 0 24px 0; font-size: 24px; color: ${lightGray}; font-weight: 600; line-height: 1.3;">
                Hola ${userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "Usuario"}
            </h2>
            
            <!-- Message -->
            <p style="margin: 0 0 16px 0; color: ${textLight}; font-size: 15px; line-height: 1.7;">
                Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en <strong style="color: ${lightGray};">LAZO</strong>.
            </p>

            <p style="margin: 0 0 32px 0; color: ${textLight}; font-size: 15px; line-height: 1.7;">
                Confirma el cambio haciendo clic en el botón de abajo. Este enlace expirará en 1 hora.
            </p>

            <!-- Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${confirmationLink}" style="display: inline-block; background-color: ${accentColor}; color: #ffffff; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5); border: none; cursor: pointer; transition: all 0.3s ease;">
                    Confirmar Cambio de Contraseña
                </a>
            </div>

            <!-- Alternative Link -->
            <div style="background-color: ${darkGray}; padding: 24px; border-radius: 8px; margin: 40px 0; border-left: 4px solid ${accentColor};">
                <p style="margin: 0 0 12px 0; color: ${textLight}; font-size: 13px; font-weight: 500;">O copia este enlace:</p>
                <div style="background-color: ${darkBg}; padding: 12px; border-radius: 6px; word-break: break-all; font-family: 'Monaco', 'Courier New', monospace; font-size: 11px; color: ${accentColor}; border: 1px solid ${darkGray}; line-height: 1.6;">
                    ${confirmationLink}
                </div>
            </div>

            <!-- Security Notice -->
            <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 16px; margin: 40px 0; border-radius: 6px;">
                <p style="margin: 0; color: #fcd34d; font-size: 13px; line-height: 1.6;">
                    <strong style="font-weight: 600; display: block; margin-bottom: 4px;">Importante:</strong>
                    Este enlace expira en 1 hora. Si no solicitaste cambiar tu contraseña, ignora este correo y tu contraseña permanecerá igual.
                </p>
            </div>

            <!-- Trust Badge -->
            <div style="background-color: rgba(16, 185, 129, 0.1); border-left: 4px solid ${successColor}; padding: 16px; margin: 40px 0; border-radius: 6px;">
                <p style="margin: 0; color: #6ee7b7; font-size: 13px; line-height: 1.6;">
                    <strong style="font-weight: 600;">Por tu seguridad:</strong> Nunca compartimos contraseñas por correo electrónico. Si necesitas ayuda, contacta con nuestro equipo.
                </p>
            </div>
        </div>

        <!-- Divider -->
        <div style="height: 1px; background-color: ${darkGray};"></div>

        <!-- Footer -->
        <div style="background-color: #000000; padding: 32px 40px; text-align: center; border-top: 1px solid ${darkGray};">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: ${textLight};">
                <strong style="font-weight: 600; color: #ffffff;">LAZO</strong> - Plataforma de E-commerce
            </p>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af;">
                © 2026 Todos los derechos reservados | <a href="https://lazo.com" style="color: ${accentColor}; text-decoration: none; font-weight: 500;">lazo.com</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: #6b7280;">
                Si tienes preguntas, <a href="https://lazo.com/help" style="color: ${accentColor}; text-decoration: none; font-weight: 500;">contacta con soporte</a>
            </p>
        </div>

    </div>
</body>
</html>
  `;
  }
}
