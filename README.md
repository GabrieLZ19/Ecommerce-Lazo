# LAZO - E-commerce de Ropa 👗

Un e-commerce moderno y funcional para venta de ropa desarrollado con Next.js, React, TypeScript y TailwindCSS.

## 🚀 Características

### Frontend

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS + shadcn/ui
- **Estado**: Zustand para manejo de estado
- **Autenticación**: Supabase Auth
- **Pagos**: Integración con MercadoPago
- **Diseño**: Mobile-first, minimalista y moderno

### Backend

- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage para imágenes
- **API**: Next.js API Routes
- **Pagos**: MercadoPago SDK

## 📁 Estructura del Proyecto

```
LAZO/
├── Frontend/
│   ├── src/
│   │   ├── app/                    # App Router de Next.js
│   │   │   ├── (auth)/            # Rutas de autenticación
│   │   │   ├── (shop)/            # Rutas de la tienda
│   │   │   ├── api/               # API Routes
│   │   │   ├── globals.css        # Estilos globales
│   │   │   ├── layout.tsx         # Layout principal
│   │   │   └── page.tsx           # Página de inicio
│   │   ├── components/            # Componentes reutilizables
│   │   │   ├── ui/                # Componentes UI base
│   │   │   ├── layout/            # Header, Footer, etc.
│   │   │   ├── product/           # Componentes de productos
│   │   │   ├── cart/              # Componentes del carrito
│   │   │   └── auth/              # Componentes de autenticación
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # Utilidades y configuraciones
│   │   ├── store/                 # Stores de Zustand
│   │   └── types/                 # Tipos de TypeScript
│   ├── public/                    # Archivos estáticos
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── tsconfig.json
├── Backend/
│   ├── src/
│   │   ├── controllers/           # Controladores de la API
│   │   ├── models/                # Modelos de datos
│   │   ├── routes/                # Rutas de la API
│   │   ├── middleware/            # Middlewares
│   │   ├── services/              # Servicios (Supabase, MercadoPago)
│   │   └── config/                # Configuraciones
│   ├── supabase/
│   │   ├── migrations/            # Migraciones de BD
│   │   └── seed.sql               # Datos de ejemplo
│   └── .env.example
└── README.md
```

## 🛠 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de MercadoPago

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd LAZO
```

### 2. Configurar Frontend

```bash
cd Frontend
npm install
```

### 3. Variables de entorno

Copia los archivos de ejemplo y configura tus variables:

**Frontend (.env.local):**

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env):**

```bash
cp Backend/.env.example Backend/.env
```

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key
```

### 4. Configurar Base de Datos

#### Ejecutar migraciones en Supabase:

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el SQL Editor
3. Ejecuta el contenido de `Backend/supabase/migrations/001_initial_schema.sql`
4. Ejecuta el contenido de `Backend/supabase/seed.sql` para datos de ejemplo

### 5. Ejecutar el proyecto

```bash
cd Frontend
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## 📱 Funcionalidades

### 🏠 Página de Inicio

- Banner hero con call-to-action
- Productos destacados
- Categorías principales
- Newsletter signup

### 🛍 Catálogo de Productos

- Lista/grid view de productos
- Filtros por categoría, precio, talle
- Ordenamiento por precio, nombre, rating
- Búsqueda de productos
- Paginación

### 👕 Página de Producto

- Galería de imágenes
- Selección de talle y color
- Información detallada
- Productos relacionados
- Reviews y ratings

### 🛒 Carrito de Compras

- Agregar/remover productos
- Actualizar cantidades
- Resumen de compra
- Persistencia en localStorage

### 💳 Checkout

- Formulario de envío
- Selección de método de pago
- Integración con MercadoPago
- Confirmación de pedido

### 👤 Autenticación

- Registro de usuarios
- Login/logout
- Perfil de usuario
- Historial de pedidos

## 🎨 Diseño

### Principios de Diseño

- **Mobile-first**: Optimizado para dispositivos móviles
- **Minimalista**: Diseño limpio y funcional
- **Moderno**: Inspirado en marcas como Zara y H&M
- **Accesible**: Cumple estándares de accesibilidad

### Paleta de Colores

- **Primario**: Negro/Gris oscuro
- **Secundario**: Blanco/Gris claro
- **Accent**: Según la temporada
- **Estado**: Verde (éxito), Rojo (error), Amarillo (warning)

## 🔧 Tecnologías

### Frontend

| Tecnología   | Versión | Uso              |
| ------------ | ------- | ---------------- |
| Next.js      | 14.0.4  | Framework React  |
| React        | 18.2.0  | Librería UI      |
| TypeScript   | 5.3.3   | Tipado estático  |
| TailwindCSS  | 3.4.0   | Estilos          |
| shadcn/ui    | Latest  | Componentes UI   |
| Zustand      | 4.4.7   | Manejo de estado |
| Lucide React | 0.294.0 | Iconos           |

### Backend & Services

| Servicio    | Uso                          |
| ----------- | ---------------------------- |
| Supabase    | Base de datos, Auth, Storage |
| MercadoPago | Pasarela de pagos            |
| Vercel      | Hosting y deployment         |

## 📊 Base de Datos

### Tablas Principales

- **users**: Información de usuarios
- **products**: Catálogo de productos
- **categories**: Categorías de productos
- **sizes**: Talles disponibles
- **colors**: Colores disponibles
- **product_variants**: Variantes de productos (talle/color)
- **orders**: Pedidos
- **order_items**: Items de pedidos
- **addresses**: Direcciones de envío
- **cart_items**: Carrito persistente

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático con cada push

### Variables de Entorno en Producción

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: info@lazo.com.ar
- **Website**: https://lazo.com.ar
- **GitHub**: [tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [MercadoPago](https://www.mercadopago.com.ar/)

---

**¡Gracias por usar LAZO! 🎉**
