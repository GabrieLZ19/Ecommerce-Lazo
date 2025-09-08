-- Verificar estructura actual de las tablas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de categorías
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' AND table_schema = 'public'
ORDER BY ordinal_position;
