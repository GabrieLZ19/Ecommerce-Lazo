-- 017_normalize_schema_and_payments.sql
-- Normaliza productos, añade tabla payments, ajusta tipos monetarios y crea índices útiles.
-- Hacer backup antes de aplicar. Probar en staging.

BEGIN;

-- Asegurar extensión para gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Corregir tipo de images en products a text[] (seguro si ya es text[] no hace nada)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'images'
  ) THEN
    -- intentar convertir a text[] de forma segura
    BEGIN
      ALTER TABLE public.products
        ALTER COLUMN images TYPE text[] USING (
          CASE
            WHEN images IS NULL THEN ARRAY[]::text[]
            ELSE images::text[]
          END
        );
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir products.images: %', SQLERRM;
    END;
  END IF;
END$$;

-- 2) Eliminar columnas duplicadas en products si existen
ALTER TABLE public.products
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_featured,
  DROP COLUMN IF EXISTS image_url;

-- 3) Renombrar billing_address a billing_address_snapshot si existe (mantener snapshot inmutable)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'billing_address'
  ) THEN
    EXECUTE 'ALTER TABLE public.orders RENAME COLUMN billing_address TO billing_address_snapshot';
  END IF;
END$$;

-- Asegurar tipo jsonb para el snapshot
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'billing_address_snapshot'
  ) THEN
    BEGIN
      ALTER TABLE public.orders
        ALTER COLUMN billing_address_snapshot TYPE jsonb USING billing_address_snapshot::jsonb;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'billing_address_snapshot conversion skipped: %', SQLERRM;
    END;
  END IF;
END$$;

-- 4) Crear tabla payments para trazabilidad (no duplicar pagos en orders)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_payment_id text,
  provider_preference_id text,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'ARS',
  status text NOT NULL,
  raw_response jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 5) Establecer precisión para montos en orders
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='total') THEN
    BEGIN
      ALTER TABLE public.orders
        ALTER COLUMN total TYPE numeric(12,2) USING total::numeric(12,2);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir orders.total: %', SQLERRM;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='subtotal') THEN
    BEGIN
      ALTER TABLE public.orders
        ALTER COLUMN subtotal TYPE numeric(12,2) USING subtotal::numeric(12,2);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir orders.subtotal: %', SQLERRM;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_cost') THEN
    BEGIN
      ALTER TABLE public.orders
        ALTER COLUMN shipping_cost TYPE numeric(12,2) USING shipping_cost::numeric(12,2);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir orders.shipping_cost: %', SQLERRM;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='tax_amount') THEN
    BEGIN
      ALTER TABLE public.orders
        ALTER COLUMN tax_amount TYPE numeric(12,2) USING tax_amount::numeric(12,2);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir orders.tax_amount: %', SQLERRM;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_fee') THEN
    BEGIN
      ALTER TABLE public.orders
        ALTER COLUMN payment_fee TYPE numeric(12,2) USING payment_fee::numeric(12,2);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir orders.payment_fee: %', SQLERRM;
    END;
  END IF;
END$$;

-- 6) Crear índices recomendados si no existen
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- 7) Crear tipo ENUM para order_status si no existe y convertir la columna
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='status'
  ) THEN
    BEGIN
      -- Intentar convertir solo si los valores actuales son compatibles
      PERFORM 1 FROM public.orders LIMIT 1;
      -- Convertir columna a enum si la conversión es segura
      BEGIN
        ALTER TABLE public.orders ALTER COLUMN status TYPE order_status USING status::order_status;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'No se pudo convertir orders.status a order_status enum: %', SQLERRM;
      END;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'orders.status check skipped: %', SQLERRM;
    END;
  END IF;
END$$;

COMMIT;

-- Notas:
-- 1) Antes de aplicar en producción, realizar backup completo y probar en staging.
-- 2) Evaluar migración de datos: mover valores antiguos (ej. payments guardados en orders) a nueva tabla payments si corresponde.
-- 3) Revisar la lógica de la app para usar billing_address_snapshot y la tabla payments a futuro.
