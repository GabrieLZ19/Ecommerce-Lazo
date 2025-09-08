# LAZO E-commerce Backend

Backend API para la tienda de ropa LAZO, construido con Node.js, Express, TypeScript y Supabase.

## 🚀 Características

- **API RESTful** con Express.js y TypeScript
- **Autenticación** con Supabase Auth
- **Base de datos** PostgreSQL con Supabase
- **Pagos** integrados con MercadoPago
- **Arquitectura modular** con servicios, controladores y middleware
- **Validación** de datos con Joi
- **Seguridad** con Helmet, CORS y rate limiting
- **Documentación** automática de API

## 📦 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd Lazo/Backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Environment
NODE_ENV=development
PORT=8000

# Database Configuration
SUPABASE_URL=tu_supabase_url_aqui
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_aqui

# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key_aqui
```

4. **Ejecutar en desarrollo**

```bash
npm run dev
```

5. **Construir para producción**

```bash
npm run build
npm start
```

## 🏗️ Estructura del proyecto

```
src/
├── config/           # Configuración (environment, supabase)
├── controllers/      # Controladores de rutas
├── middleware/       # Middleware personalizado
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio
├── types/            # Tipos de TypeScript
└── app.ts           # Aplicación principal
```

## 📡 API Endpoints

### Autenticación

- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Iniciar sesión
- `POST /api/users/logout` - Cerrar sesión
- `GET /api/users/profile` - Obtener perfil

### Productos

- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/featured` - Productos destacados
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)

### Órdenes

- `POST /api/orders` - Crear orden
- `GET /api/orders/my-orders` - Órdenes del usuario
- `GET /api/orders/:id` - Obtener orden por ID
- `POST /api/orders/:orderId/payment` - Crear preferencia de pago

## 🔧 Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.io)
2. Ejecutar las migraciones de base de datos (ver `/supabase/migrations/`)
3. Configurar políticas RLS (Row Level Security)
4. Obtener las credenciales del panel de Supabase

## 💳 Configuración de MercadoPago

1. Crear cuenta en [MercadoPago](https://developers.mercadopago.com/)
2. Obtener credenciales de test/producción
3. Configurar webhook para notificaciones de pago

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📝 Scripts disponibles

- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Construir para producción
- `npm start` - Ejecutar en producción
- `npm run lint` - Linter de código
- `npm run type-check` - Verificar tipos

## 🔒 Seguridad

- Autenticación JWT con Supabase
- Rate limiting para prevenir abuso
- Validación de entrada con Joi
- Headers de seguridad con Helmet
- CORS configurado correctamente

## 🚀 Despliegue

### Railway/Vercel

1. Conectar repositorio
2. Configurar variables de entorno
3. Desplegar automáticamente

### Docker

```bash
docker build -t lazo-backend .
docker run -p 8000:8000 lazo-backend
```

## 📚 Documentación adicional

- [Esquema de base de datos](./supabase/schema.sql)
- [Migraciones](./supabase/migrations/)
- [Configuración de MercadoPago](./docs/mercadopago.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## ⚡ Estado del proyecto

✅ Autenticación con Supabase
✅ CRUD de productos
✅ Sistema de órdenes
✅ Integración con MercadoPago
🔄 Tests unitarios (en progreso)
🔄 Documentación API (en progreso)
📋 Administración (pendiente)

---

**Desarrollo:** LAZO Team
**Versión:** 1.0.0
