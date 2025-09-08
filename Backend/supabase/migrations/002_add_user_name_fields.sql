-- Migración para agregar campos de nombre separados a la tabla users
-- Agregar columnas first_name y last_name
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';

-- Migrar datos existentes del campo name a first_name y last_name
UPDATE public.users 
SET 
  first_name = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 1)
    ELSE name
  END,
  last_name = CASE 
    WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE first_name = '' AND last_name = '';

-- Opcional: Eliminar la columna name si ya no la necesitas
-- ALTER TABLE public.users DROP COLUMN IF EXISTS name;
