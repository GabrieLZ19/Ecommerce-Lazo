# 🚀 LAZO - Guía de Acción Inmediata

## ¿Qué Acabo de Hacer?

He realizado un análisis **COMPLETO** de tu proyecto LAZO e-commerce y creado documentación profesional:

### 📄 Documentos Creados

1. **`.agent.md`** (9KB)
   - Contexto completo del proyecto
   - Arquitectura detallada
   - Stack tecnológico
   - Base de datos
   - Problemas identificados
   - Migraciones existentes

2. **`MEJORAS.md`** (15KB)
   - Plan detallado en 4 fases
   - Código listo para copiar/pegar
   - Implementación de EnvioPack
   - Mejoras backend y frontend
   - Ejemplos de controladores y servicios

3. **`RESUMEN.md`** (Ejecutivo)
   - Visión rápida de todo
   - Timeline de implementación
   - Próximos pasos claros

4. **`ROADMAP_ACCION.md`** (Este archivo)
   - Checklist paso a paso
   - Comandos exactos
   - Validaciones

---

## 🎯 PRIMERA SEMANA: Acciones Prioritarias

### DÍA 1: Nueva Base de Datos Supabase ⚡

#### Paso 1.1: Crear Nuevo Proyecto

```bash
# 1. Ir a https://supabase.com/dashboard
# 2. Clic en "New project"
# 3. Completar:
#    - Name: lazo-production
#    - Database password: [contraseña fuerte]
#    - Region: sudamerica (AWS São Paulo)
# 4. Esperar 2-3 minutos
```

#### Paso 1.2: Guardar Credenciales

```bash
# Ir a Project Settings → API Keys
# Copiar:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...

# Guardar en archivo TEMPORAL (seguro)
# NO commitear a git
```

#### Paso 1.3: Verificar Conexión Backend

```bash
# Actualizar Backend/.env
SUPABASE_URL=<nuevo>
SUPABASE_ANON_KEY=<nuevo>
SUPABASE_SERVICE_ROLE_KEY=<nuevo>

cd Backend
npm run dev

# Debe aparecer: 🚀 Servidor corriendo en puerto 8000
# Probar: curl http://localhost:8000/api/health
# Respuesta esperada: {"success":true,"message":"API funcionando..."}
```

#### Paso 1.4: Ejecutar Migraciones

```bash
# Option A: Vía Supabase SQL Editor
# 1. Dashboard → SQL Editor
# 2. Nueva query
# 3. Copiar contenido de: Backend/supabase/migrations/018_*.sql
# 4. Ejecutar
# 5. Repetir con 019_*.sql

# Option B: Vía Supabase CLI
supabase link --project-ref <project-ref>
supabase migration up

# Validar migraciones ejecutadas:
# Dashboard → SQL Editor → SELECT * FROM migration_logs;
```

#### Paso 1.5: Configurar RLS (Seguridad)

```sql
-- Copiar y ejecutar en SQL Editor:

-- 1. Tabla PRODUCTS (lectura pública)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- 2. Tabla ORDERS (solo el dueño)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Tabla USERS (privado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Validar:
-- SELECT schemaname, tablename, (rowsecurity) as rls FROM pg_tables
--   WHERE schemaname='public';
```

#### ✅ Checklist Día 1

- [ ] Nuevo proyecto Supabase creado
- [ ] Credenciales guardadas en .env
- [ ] Backend conectado y respondiendo
- [ ] Migraciones ejecutadas
- [ ] RLS configurado
- [ ] `curl http://localhost:8000/api/health` funciona

---

### DÍA 2-3: Frontend Conectado

#### Paso 2.1: Actualizar Frontend

```bash
# Actualizar Frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=<nueva-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<nueva-key>
NEXT_PUBLIC_API_URL=http://localhost:8000

# Reiniciar frontend
cd Frontend
npm run dev
```

#### Paso 2.2: Probar Autenticación

```bash
# Ir a http://localhost:3000/auth/login
# 1. Click en "Register"
# 2. Completar: email, contraseña
# 3. Confirmar email en dashboard Supabase
# 4. Intentar login
# 5. Debe redirigir a inicio

# Validar en dashboard:
# Authentication → Users → Debe aparecer tu usuario
```

#### Paso 2.3: Probar Flujo de Compra

```bash
# 1. Ir a Products
# 2. Clickear un producto
# 3. Agregar al carrito
# 4. Ir a Cart
# 5. Checkout (sin pagar, solo probar flujo)

# Validar en Supabase:
# Database → orders → Debe haber una orden pendiente
```

#### ✅ Checklist Días 2-3

- [ ] Frontend .env.local actualizado
- [ ] Autenticación funcionando
- [ ] Usuario registrado en base de datos
- [ ] Compra de prueba completada
- [ ] Orden visible en base de datos

---

### DÍA 4-5: Integración EnvioPack

#### Paso 3.1: Obtener API Key de EnvioPack

```bash
# 1. Ir a https://www.enviopack.com/
# 2. Registrarse/Loguearse
# 3. Ir a Configuración → API Keys
# 4. Crear nueva key de desarrollo
# 5. Copiar API_KEY
```

#### Paso 3.2: Instalar Dependencia

```bash
cd Backend
npm install axios

# En package.json debe aparecer:
# "axios": "^1.6.0"
```

#### Paso 3.3: Crear Servicio EnvioPack

```bash
# Copiar contenido de MEJORAS.md → Fase 2.1
# Crear archivo: Backend/src/services/enviopack.service.ts
# (El código ya está listo en MEJORAS.md)

# Actualizar Backend/.env
ENVIOPACK_API_KEY=<tu-key>
```

#### Paso 3.4: Crear Rutas de Envío

```bash
# Copiar código de MEJORAS.md → Fase 2.2
# Crear archivo: Backend/src/routes/shipping.routes.ts

# Agregar en Backend/src/routes/index.ts:
import shippingRoutes from './shipping.routes';
router.use('/shipping', shippingRoutes);
```

#### Paso 3.5: Crear Controlador

```bash
# Copiar código de MEJORAS.md → Fase 2.3
# Crear archivo: Backend/src/controllers/shipping.controller.ts
```

#### Paso 3.6: Probar Endpoints

```bash
# Test 1: Obtener provincias
curl http://localhost:8000/api/shipping/provinces

# Test 2: Calcular envío
curl -X POST http://localhost:8000/api/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{
    "origin_address": {
      "street": "Calle",
      "number": "123",
      "postal_code": "1425",
      "city": "CABA",
      "province": "Buenos Aires"
    },
    "destination_address": {
      "street": "Calle",
      "number": "456",
      "postal_code": "5000",
      "city": "Córdoba",
      "province": "Córdoba"
    },
    "packages": [{"weight": 1, "length": 20, "width": 15, "height": 10}]
  }'

# Validar respuesta con diferentes costos
```

#### ✅ Checklist Días 4-5

- [ ] API Key EnvioPack obtenida
- [ ] axios instalado
- [ ] EnviopackService creado
- [ ] Rutas de envío creadas
- [ ] Controlador creado
- [ ] Tests de endpoints exitosos

---

### DÍA 6-7: Frontend + Checkout

#### Paso 4.1: Crear Hook useShipping

```bash
# Copiar código de MEJORAS.md → Fase 4.2
# Crear archivo: Frontend/src/hooks/useShipping.ts
```

#### Paso 4.2: Crear Componente ShippingSelector

```bash
# Copiar código de MEJORAS.md → Fase 2.5
# Crear archivo: Frontend/src/components/checkout/ShippingSelector.tsx
```

#### Paso 4.3: Integrar en Checkout

```bash
# Editar: Frontend/src/app/(shop)/checkout/page.tsx
# Agregar:

import { ShippingSelector } from '@/components/checkout/ShippingSelector';

export default function CheckoutPage() {
  const [selectedShipping, setSelectedShipping] = useState(null);

  return (
    <div>
      {/* ... form de dirección ... */}
      <ShippingSelector
        address={formData}
        onShippingSelect={setSelectedShipping}
      />
      {/* ... resumen de pedido ... */}
    </div>
  );
}
```

#### Paso 4.4: Probar Flujo Completo

```bash
# 1. Agregar producto al carrito
# 2. Ir a checkout
# 3. Llenar dirección
# 4. Ver opciones de envío
# 5. Seleccionar uno
# 6. Ver total actualizado con envío
```

#### ✅ Checklist Días 6-7

- [ ] Hook useShipping creado
- [ ] Componente ShippingSelector creado
- [ ] Integrado en checkout
- [ ] Flujo completo funciona
- [ ] Cálculo de envío visible

---

## 🔧 SEMANA 2: Mejoras y Polish

### Backend Improvements

```bash
# Paso 1: Habilitar Rate Limiting
# En Backend/src/app.ts, descomentar la sección de rate limiting

# Paso 2: Mejorar validación
# Crear Backend/src/middleware/validation.middleware.ts (ver MEJORAS.md)
# Usar en cada ruta importante

# Paso 3: Error handling
# Crear Backend/src/utils/ApiError.ts (ver MEJORAS.md)
```

### Frontend Improvements

```bash
# Paso 1: Error Boundary
# Crear Frontend/src/components/ErrorBoundary.tsx (ver MEJORAS.md)
# Envolver en layout.tsx

# Paso 2: Validación dirección
# Agregar validación más strict en checkout

# Paso 3: Mejor UX
# Toast mensajes de error/éxito
# Loading states
```

---

## 📋 Validación Final (Semana 3)

### Checklist Completo

```
BACKEND:
- [ ] API health check responde
- [ ] Autenticación funciona
- [ ] CRUD productos funciona
- [ ] Órdenes se crean correctamente
- [ ] Envíos calculan correctamente
- [ ] MercadoPago integrado
- [ ] Webhooks funcionan
- [ ] Rate limiting activo
- [ ] Error handling mejorado

FRONTEND:
- [ ] Login/Register funcionan
- [ ] Productos se cargan
- [ ] Carrito funciona
- [ ] Checkout completo
- [ ] Cálculo de envío visible
- [ ] Pago con MercadoPago
- [ ] Error boundaries funcionan
- [ ] Mobile responsive
- [ ] Performance aceptable

BASE DE DATOS:
- [ ] RLS configurado
- [ ] Migraciones aplicadas
- [ ] Índices creados
- [ ] Backups automatizados
- [ ] Usuarios en tabla
- [ ] Órdenes guardadas
- [ ] Envíos registrados

DOCUMENTACIÓN:
- [ ] .agent.md completo
- [ ] MEJORAS.md con código
- [ ] README.md actualizado
- [ ] .env.example actualizado
- [ ] API documentada (Swagger opcional)
```

---

## 🆘 Si Algo Sale Mal

### Error de Conexión Supabase

```bash
# 1. Verificar variables de entorno
cat Backend/.env | grep SUPABASE

# 2. Verificar dashboard de Supabase
# → Settings → API Keys → Copiar nuevamente

# 3. Reiniciar servidor
npm run dev
```

### EnvioPack Error 401

```bash
# 1. Verificar API Key
echo $ENVIOPACK_API_KEY

# 2. Verificar que sea la key correcta (no confundir con secret)

# 3. Contactar soporte de EnvioPack
```

### MercadoPago No Funciona

```bash
# 1. Verificar access token
# https://www.mercadopago.com.ar/developers/panel/credentials

# 2. Verificar que sea la key correcta (no public key)

# 3. Actualizar .env
```

---

## 📊 Timeline Visual

```
SEMANA 1:
├── Día 1-2: Nueva BD Supabase ⚡
├── Día 3: Conectar Frontend
├── Día 4-5: Integrar EnvioPack 🚚
└── Día 6-7: Checkout + Testing

SEMANA 2:
├── Backend Improvements 🛠️
├── Frontend Polish ✨
└── Testing & Validación

SEMANA 3:
├── Performance Tuning
├── Documentación
└── Deployment Preparation 🚀

TOTAL: 15-18 días de trabajo
```

---

## 🎓 Recursos Útiles

### Documentación Oficial

- https://supabase.com/docs/guides/database/overview
- https://docs.enviopack.com/api-envios
- https://www.mercadopago.com.ar/developers/en/reference/

### Por Consultar

- Discord de Supabase
- Community de Next.js
- Stack Overflow (tags: nodejs, express, supabase)

---

## 💬 Próximos Pasos

**OPCIÓN A:** Yo te ayudo a crear la BD Supabase ahora mismo (30 minutos)

**OPCIÓN B:** Yo te ayudo a integrar EnvioPack completo (2-3 horas)

**OPCIÓN C:** Yo hago un refactor completo del código (día completo)

**OPCIÓN D:** Tú implementas siguiendo esta guía y yo reviso

---

**¿Cuál prefieres hacer primero?**

🎯 Mi recomendación: Opción A + B (BD + EnvioPack) antes de cualquier otra cosa

---

**Documento creado:** 18 de mayo de 2026  
**Versión:** 1.0  
**Estado:** 🟢 LISTO PARA ACCIÓN
