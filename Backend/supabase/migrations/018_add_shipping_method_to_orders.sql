-- 018_add_shipping_method_to_orders.sql
-- Agrega la columna `shipping_method` a public.orders si no existe y aplica una restricción CHECK
-- Idempotente: se puede ejecutar múltiples veces sin error.

BEGIN;

-- 1) agregar columna si no existe con valor por defecto 'standard'
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method text DEFAULT 'standard';

-- 2) asegurar que filas existentes no queden NULL
UPDATE public.orders SET shipping_method = 'standard' WHERE shipping_method IS NULL;

-- 3) agregar constraint CHECK si no existe (verificando pg_constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'orders' AND c.conname = 'orders_shipping_method_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_shipping_method_check
      CHECK (shipping_method IN ('standard','express','overnight'));
  END IF;
END
$$;

COMMIT;

-- Nota: si prefieres un ENUM en vez de text + CHECK, crea primero el tipo enum y luego ALTER TABLE para usarlo.
