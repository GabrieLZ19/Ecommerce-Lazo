-- 014_insert_color_unico.sql
-- Migración para crear el color único si no existe

INSERT INTO public.colors (id, name, hex, created_at, updated_at)
SELECT gen_random_uuid(), 'Color único', '#000000', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.colors WHERE name = 'Color único'
);
