-- Verificar la estructura exacta de la tabla products
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
ORDER BY ordinal_position;
