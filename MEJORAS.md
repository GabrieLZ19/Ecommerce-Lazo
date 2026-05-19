# 🎯 LAZO - Plan de Mejora Detallado

## Fase 1: Nueva Base de Datos Supabase (CRÍTICO)

### Paso 1.1: Crear Nuevo Proyecto Supabase

```
1. Ir a https://supabase.com/dashboard
2. Crear nuevo proyecto
3. Guardar las credenciales:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
```

### Paso 1.2: Ejecutar Migraciones

```sql
-- Las migraciones existentes serán ejecutadas automáticamente:
-- 018_add_shipping_method_to_orders.sql
-- 019_assign_default_product_images.sql
```

### Paso 1.3: Configurar RLS (Row Level Security)

**Tabla `products` (Lectura pública)**

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admin write products"
  ON products FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
```

**Tabla `orders` (Solo el dueño y admins)**

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR
         auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR
         auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
```

**Tabla `users` (Solo el propio usuario)**

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## Fase 2: Integración EnvioPack

### Paso 2.1: Crear Servicio de EnvioPack

**Backend/src/services/enviopack.service.ts**

```typescript
import axios from "axios";
import { config } from "../config/environment";

const ENVIOPACK_API = "https://api.enviopack.com";

interface QuoteRequest {
  origin_address: {
    street: string;
    number: string;
    postal_code: string;
    city: string;
    province: string;
  };
  destination_address: {
    street: string;
    number: string;
    postal_code: string;
    city: string;
    province: string;
  };
  packages: Array<{
    weight: number; // kg
    length: number; // cm
    width: number;
    height: number;
  }>;
}

interface ShipmentResponse {
  id: string;
  tracking_number: string;
  estimated_delivery: string;
  cost: number;
  carrier: string;
  status: string;
}

export class EnviopackService {
  private static client = axios.create({
    baseURL: ENVIOPACK_API,
    headers: {
      Authorization: `Bearer ${config.enviopack.apiKey}`,
      "Content-Type": "application/json",
    },
  });

  /**
   * Obtener presupuestos de envío
   */
  static async getQuote(request: QuoteRequest) {
    try {
      const response = await this.client.post("/quotes", request);
      return response.data;
    } catch (error) {
      console.error("EnvioPack Quote Error:", error);
      throw error;
    }
  }

  /**
   * Crear envío
   */
  static async createShipment(shipmentData: any): Promise<ShipmentResponse> {
    try {
      const response = await this.client.post("/shipments", shipmentData);
      return response.data;
    } catch (error) {
      console.error("EnvioPack Create Shipment Error:", error);
      throw error;
    }
  }

  /**
   * Obtener estado de envío
   */
  static async getShipmentStatus(shipmentId: string) {
    try {
      const response = await this.client.get(`/shipments/${shipmentId}`);
      return response.data;
    } catch (error) {
      console.error("EnvioPack Status Error:", error);
      throw error;
    }
  }

  /**
   * Listar provincias
   */
  static async getProvinces() {
    try {
      const response = await this.client.get("/locations/provinces");
      return response.data;
    } catch (error) {
      console.error("EnvioPack Provinces Error:", error);
      throw error;
    }
  }

  /**
   * Listar ciudades de una provincia
   */
  static async getCitiesByProvince(provinceId: string) {
    try {
      const response = await this.client.get(
        `/locations/provinces/${provinceId}/cities`,
      );
      return response.data;
    } catch (error) {
      console.error("EnvioPack Cities Error:", error);
      throw error;
    }
  }

  /**
   * Validar dirección
   */
  static async validateAddress(address: {
    street: string;
    number: string;
    postal_code: string;
    city: string;
    province: string;
  }) {
    try {
      const response = await this.client.post("/addresses/validate", address);
      return response.data;
    } catch (error) {
      console.error("EnvioPack Address Validation Error:", error);
      throw error;
    }
  }
}
```

### Paso 2.2: Crear Rutas de Envío

**Backend/src/routes/shipping.routes.ts**

```typescript
import { Router } from "express";
import { ShippingController } from "../controllers/shipping.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Cálculo de envío (públido)
router.post("/quote", ShippingController.getQuote);

// Validar dirección
router.post("/validate-address", ShippingController.validateAddress);

// Listar provincias
router.get("/provinces", ShippingController.getProvinces);

// Listar ciudades
router.get(
  "/provinces/:provinceId/cities",
  ShippingController.getCitiesByProvince,
);

// Crear envío (requiere autenticación)
router.post(
  "/create-shipment",
  authMiddleware,
  ShippingController.createShipment,
);

// Obtener estado de envío
router.get(
  "/shipments/:shipmentId",
  authMiddleware,
  ShippingController.getShipmentStatus,
);

export default router;
```

### Paso 2.3: Controlador de Envíos

**Backend/src/controllers/shipping.controller.ts**

```typescript
import { Request, Response } from "express";
import { EnviopackService } from "../services/enviopack.service";
import Joi from "joi";

export class ShippingController {
  static async getQuote(req: Request, res: Response) {
    try {
      const schema = Joi.object({
        origin_address: Joi.object().required(),
        destination_address: Joi.object().required(),
        packages: Joi.array().items(Joi.object()).required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const quotes = await EnviopackService.getQuote(value);
      res.json({
        success: true,
        data: quotes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async validateAddress(req: Request, res: Response) {
    try {
      const result = await EnviopackService.validateAddress(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Dirección inválida",
        error: error.message,
      });
    }
  }

  static async getProvinces(req: Request, res: Response) {
    try {
      const provinces = await EnviopackService.getProvinces();
      res.json({
        success: true,
        data: provinces,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCitiesByProvince(req: Request, res: Response) {
    try {
      const { provinceId } = req.params;
      const cities = await EnviopackService.getCitiesByProvince(provinceId);
      res.json({
        success: true,
        data: cities,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async createShipment(req: Request, res: Response) {
    try {
      const { orderId, shipmentData } = req.body;
      const shipment = await EnviopackService.createShipment(shipmentData);

      // Guardar shipment_id en la orden
      // await OrderService.updateOrder(orderId, {
      //   shipment_id: shipment.id
      // });

      res.json({
        success: true,
        data: shipment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getShipmentStatus(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const status = await EnviopackService.getShipmentStatus(shipmentId);
      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
```

### Paso 2.4: Actualizar Configuración

**Backend/src/config/environment.ts** - Agregar:

```typescript
enviopack: {
  apiKey: process.env.ENVIOPACK_API_KEY!,
  apiUrl: process.env.ENVIOPACK_API_URL || 'https://api.enviopack.com',
},
```

### Paso 2.5: Frontend - Componente de Selección de Envío

**Frontend/src/components/checkout/ShippingSelector.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  estimatedDays: number;
  carrier: string;
}

export function ShippingSelector({
  address,
  onShippingSelect,
}: {
  address: any;
  onShippingSelect: (option: ShippingOption) => void;
}) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>('');

  useEffect(() => {
    fetchShippingOptions();
  }, [address]);

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_address: address,
          packages: [
            {
              weight: 1, // Calcular del carrito real
              length: 20,
              width: 15,
              height: 10,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching shipping options:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Método de Envío</Label>
      <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">{option.name}</p>
                <p className="text-sm text-gray-600">
                  ${option.cost} - {option.estimatedDays} días
                </p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button
        onClick={() => {
          const option = options.find((o) => o.id === selectedOption);
          if (option) onShippingSelect(option);
        }}
        disabled={!selectedOption}
      >
        Continuar
      </Button>
    </div>
  );
}
```

---

## Fase 3: Mejoras Backend

### 3.1: Habilitar Rate Limiting

**Backend/src/app.ts** - Descomentar y mejorar:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta nuevamente en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
```

### 3.2: Mejorar Validación

**Backend/src/middleware/validation.middleware.ts** - Crear:

```typescript
import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    req.body = value;
    next();
  };
};
```

### 3.3: Mejorar Manejo de Errores

**Backend/src/utils/ApiError.ts** - Crear:

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[],
  ) {
    super(message);
  }
}
```

---

## Fase 4: Mejoras Frontend

### 4.1: Error Boundary Global

**Frontend/src/components/ErrorBoundary.tsx**

```typescript
'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-900 rounded">
          <h2>Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4.2: Hook de Cálculo de Envío

**Frontend/src/hooks/useShipping.ts**

```typescript
"use client";

import { useState } from "react";

export function useShipping() {
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState("standard");

  const calculateShipping = async (address: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipping/quote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination_address: address }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setShippingCost(data.data[0].cost);
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
    }
  };

  return {
    shippingCost,
    selectedMethod,
    setSelectedMethod,
    calculateShipping,
  };
}
```

---

## 📝 Variables de Entorno Nuevas

### Backend .env

```env
# EnvioPack
ENVIOPACK_API_KEY=tu_api_key_aqui
ENVIOPACK_API_URL=https://api.enviopack.com
```

### Frontend .env.local

```env
NEXT_PUBLIC_ENVIOPACK_ENABLED=true
```

---

## ✅ Checklist de Implementación

### BD Supabase

- [ ] Crear nuevo proyecto
- [ ] Generar credenciales
- [ ] Ejecutar migraciones
- [ ] Configurar RLS policies
- [ ] Verificar datos

### EnvioPack

- [ ] Crear servicio
- [ ] Crear rutas
- [ ] Crear controlador
- [ ] Actualizar config
- [ ] Integrar en checkout frontend
- [ ] Probar con direcciones reales

### Backend

- [ ] Habilitar rate limiting
- [ ] Mejorar validación
- [ ] Implementar error handling
- [ ] Agregar logging
- [ ] Tests de endpoints

### Frontend

- [ ] Error boundary
- [ ] Componente envío
- [ ] Hook de cálculo
- [ ] Validación de dirección
- [ ] Tests de UI

---

## 🧪 Pruebas Recomendadas

```bash
# Backend - Calcular envío
curl -X POST http://localhost:8000/api/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{
    "destination_address": {
      "street": "Calle Test",
      "number": "123",
      "postal_code": "1425",
      "city": "Buenos Aires",
      "province": "Buenos Aires"
    },
    "packages": [{"weight": 1, "length": 20, "width": 15, "height": 10}]
  }'

# Validar dirección
curl -X POST http://localhost:8000/api/shipping/validate-address \
  -H "Content-Type: application/json" \
  -d '{
    "street": "Calle Test",
    "number": "123",
    "postal_code": "1425",
    "city": "Buenos Aires",
    "province": "Buenos Aires"
  }'
```

---

**Versión:** 1.0  
**Última actualización:** 18/05/2026
