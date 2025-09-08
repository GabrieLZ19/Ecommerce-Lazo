import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Puerto del servidor
  port: process.env.PORT || 3001,

  // Configuración de Supabase
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Configuración de MercadoPago
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY!,
  },

  // URLs y dominios
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
    successUrl:
      process.env.FRONTEND_URL + "/checkout/success" ||
      "http://localhost:3000/checkout/success",
    failureUrl:
      process.env.FRONTEND_URL + "/checkout/failure" ||
      "http://localhost:3000/checkout/failure",
    pendingUrl:
      process.env.FRONTEND_URL + "/checkout/pending" ||
      "http://localhost:3000/checkout/pending",
  },

  // Configuración JWT (si usas autenticación personalizada)
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Configuración de email (opcional)
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Configuración de Cloudinary (opcional para imágenes)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Configuración de desarrollo
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Validar configuraciones críticas
export function validateConfig() {
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "MERCADOPAGO_ACCESS_TOKEN",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("✅ Environment configuration validated");
}
