import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import { config } from "./config/environment";
import routes from "./routes";

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: [
      config.frontend.url,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por ventana de tiempo
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta nuevamente en 15 minutos",
  },
});
app.use("/api/", limiter);

// Middlewares de utilidad
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rutas
app.use("/api", routes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lazo E-commerce API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      users: "/api/users",
      orders: "/api/orders",
      health: "/api/health",
    },
  });
});

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Middleware global de manejo de errores
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
      ...(config.isDevelopment && { stack: error.stack }),
    });
  }
);

const PORT = config.port || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(
    `🌍 Entorno: ${config.isDevelopment ? "Desarrollo" : "Producción"}`
  );
  console.log(`📱 Frontend URL: ${config.frontend.url}`);
  console.log(`💾 Supabase URL: ${config.supabase.url}`);
});

export default app;
