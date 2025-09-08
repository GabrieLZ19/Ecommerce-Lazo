-- Insertar colores básicos
INSERT INTO public.colors (name, hex) VALUES
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Azul Marino', '#1E3A8A'),
('Rojo', '#DC2626'),
('Verde', '#16A34A'),
('Gris', '#6B7280'),
('Beige', '#D4B5A0'),
('Rosa', '#EC4899'),
('Amarillo', '#EAB308'),
('Morado', '#7C3AED'),
('Azul Claro', '#3B82F6'),
('Verde Oliva', '#84CC16')
ON CONFLICT DO NOTHING;

-- Insertar tallas para ropa (sort_order más bajo = aparece primero)
INSERT INTO public.sizes (name, value, sort_order) VALUES
('XS', 'Extra Small', 1),
('S', 'Small', 2),
('M', 'Medium', 3),
('L', 'Large', 4),
('XL', 'Extra Large', 5),
('XXL', '2X Large', 6)
ON CONFLICT DO NOTHING;

-- Insertar tallas para calzado
INSERT INTO public.sizes (name, value, sort_order) VALUES
('36', '36', 10),
('37', '37', 11),
('38', '38', 12),
('39', '39', 13),
('40', '40', 14),
('41', '41', 15),
('42', '42', 16),
('43', '43', 17),
('44', '44', 18),
('45', '45', 19)
ON CONFLICT DO NOTHING;

-- Insertar talla única para productos sin variantes específicas
INSERT INTO public.sizes (name, value, sort_order) VALUES
('Único', 'Talla única', 100)
ON CONFLICT DO NOTHING;

-- Crear variantes para productos existentes
-- Primero obtenemos los IDs que necesitamos
WITH product_ids AS (
  SELECT id, name FROM public.products LIMIT 5
),
size_ids AS (
  SELECT id, name, sort_order FROM public.sizes
),
color_ids AS (
  SELECT id, name FROM public.colors LIMIT 8
)

-- Insertar variantes para productos de ropa (tallas XS-XXL)
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku)
SELECT 
  p.id as product_id,
  s.id as size_id,
  c.id as color_id,
  CASE 
    WHEN p.name LIKE '%Chaqueta%' THEN floor(random() * 15 + 5)::int -- 5-20 stock
    WHEN p.name LIKE '%Vestido%' THEN floor(random() * 20 + 10)::int -- 10-30 stock
    WHEN p.name LIKE '%Sneakers%' THEN floor(random() * 12 + 8)::int -- 8-20 stock
    ELSE floor(random() * 10 + 5)::int -- 5-15 stock por defecto
  END as stock,
  CONCAT(
    UPPER(LEFT(p.name, 3)), '-',
    s.name, '-',
    UPPER(LEFT(c.name, 3)), '-',
    substring(gen_random_uuid()::text, 1, 8)
  ) as sku
FROM product_ids p
CROSS JOIN size_ids s
CROSS JOIN color_ids c
WHERE 
  -- Chaqueta de cuero: tallas de ropa
  (p.name LIKE '%Chaqueta%' AND s.sort_order BETWEEN 1 AND 6 AND c.name IN ('Negro', 'Gris'))
  OR
  -- Vestido: tallas de ropa  
  (p.name LIKE '%Vestido%' AND s.sort_order BETWEEN 1 AND 6 AND c.name IN ('Rosa', 'Azul Claro', 'Verde', 'Amarillo'))
  OR
  -- Sneakers: tallas de calzado
  (p.name LIKE '%Sneakers%' AND s.sort_order BETWEEN 10 AND 19 AND c.name IN ('Blanco', 'Negro', 'Azul Marino', 'Gris'))
ON CONFLICT (product_id, size_id, color_id) DO NOTHING;

-- Crear variantes para productos electrónicos con talla única
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku)
SELECT DISTINCT
  p.id as product_id,
  s.id as size_id,
  c.id as color_id,
  floor(random() * 20 + 10)::int as stock,
  CONCAT(
    UPPER(LEFT(p.name, 3)), '-',
    'UNI', '-',
    UPPER(LEFT(c.name, 3)), '-',
    substring(gen_random_uuid()::text, 1, 8)
  ) as sku
FROM public.products p
CROSS JOIN (SELECT id FROM public.sizes WHERE name = 'Único' LIMIT 1) s
CROSS JOIN (SELECT id, name FROM public.colors WHERE name IN ('Negro', 'Blanco', 'Gris') LIMIT 3) c
WHERE (p.name LIKE '%iPhone%' OR p.name LIKE '%MacBook%' OR p.name LIKE '%Samsung%' OR p.name LIKE '%Set%' OR p.name LIKE '%Lámpara%' OR p.name LIKE '%Sábanas%' OR p.name LIKE '%Bicicleta%' OR p.name LIKE '%Años%')
  AND NOT EXISTS (
    SELECT 1 FROM public.product_variants pv WHERE pv.product_id = p.id
  )
ON CONFLICT (product_id, size_id, color_id) DO NOTHING;
