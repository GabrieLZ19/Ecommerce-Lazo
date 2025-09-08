-- Insert categories
INSERT INTO public.categories (id, name, slug, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Mujer', 'mujer', 'Ropa y accesorios para mujeres'),
('550e8400-e29b-41d4-a716-446655440002', 'Hombre', 'hombre', 'Ropa y accesorios para hombres'),
('550e8400-e29b-41d4-a716-446655440003', 'Accesorios', 'accesorios', 'Accesorios de moda'),
('550e8400-e29b-41d4-a716-446655440004', 'Vestidos', 'vestidos', 'Vestidos para todas las ocasiones'),
('550e8400-e29b-41d4-a716-446655440005', 'Camisas', 'camisas', 'Camisas y blusas'),
('550e8400-e29b-41d4-a716-446655440006', 'Pantalones', 'pantalones', 'Jeans, pantalones y leggins'),
('550e8400-e29b-41d4-a716-446655440007', 'Sacos', 'sacos', 'Blazers y sacos formales');

-- Update categories with parent relationships
UPDATE public.categories SET parent_id = '550e8400-e29b-41d4-a716-446655440001' WHERE slug IN ('vestidos', 'camisas');
UPDATE public.categories SET parent_id = '550e8400-e29b-41d4-a716-446655440002' WHERE slug IN ('pantalones', 'sacos');

-- Insert sizes
INSERT INTO public.sizes (id, name, value, sort_order) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'XS', 'xs', 1),
('660e8400-e29b-41d4-a716-446655440002', 'S', 's', 2),
('660e8400-e29b-41d4-a716-446655440003', 'M', 'm', 3),
('660e8400-e29b-41d4-a716-446655440004', 'L', 'l', 4),
('660e8400-e29b-41d4-a716-446655440005', 'XL', 'xl', 5),
('660e8400-e29b-41d4-a716-446655440006', 'XXL', 'xxl', 6);

-- Insert colors
INSERT INTO public.colors (id, name, hex) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Negro', '#000000'),
('770e8400-e29b-41d4-a716-446655440002', 'Blanco', '#FFFFFF'),
('770e8400-e29b-41d4-a716-446655440003', 'Gris', '#808080'),
('770e8400-e29b-41d4-a716-446655440004', 'Azul Marino', '#001f3f'),
('770e8400-e29b-41d4-a716-446655440005', 'Beige', '#F5F5DC'),
('770e8400-e29b-41d4-a716-446655440006', 'Rojo', '#FF0000'),
('770e8400-e29b-41d4-a716-446655440007', 'Verde', '#008000'),
('770e8400-e29b-41d4-a716-446655440008', 'Rosa', '#FFC0CB');

-- Insert sample products
INSERT INTO public.products (id, name, description, price, images, category_id, stock, featured) VALUES
('880e8400-e29b-41d4-a716-446655440001', 
 'Vestido Elegante Negro', 
 'Vestido elegante de manga larga perfecto para ocasiones especiales. Confeccionado en tela de alta calidad con un corte favorecedor.',
 89900.00,
 ARRAY['https://images.unsplash.com/photo-1566479179817-c0b2b8fa0842?w=500', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'],
 '550e8400-e29b-41d4-a716-446655440004',
 50,
 true),

('880e8400-e29b-41d4-a716-446655440002',
 'Camisa Casual Blanca',
 'Camisa clásica de algodón 100% perfecta para el día a día. Corte regular y máxima comodidad.',
 45900.00,
 ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', 'https://images.unsplash.com/photo-1564257577-e1e1b6c6f0b6?w=500'],
 '550e8400-e29b-41d4-a716-446655440005',
 75,
 true),

('880e8400-e29b-41d4-a716-446655440003',
 'Jeans Slim Fit',
 'Jeans de corte slim fit en denim de primera calidad. Cómodos y duraderos para uso diario.',
 67900.00,
 ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500'],
 '550e8400-e29b-41d4-a716-446655440006',
 40,
 true),

('880e8400-e29b-41d4-a716-446655440004',
 'Blazer Formal',
 'Blazer formal de corte moderno ideal para el trabajo o eventos formales. Tela de lana mezcla.',
 129900.00,
 ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'],
 '550e8400-e29b-41d4-a716-446655440007',
 25,
 true),

('880e8400-e29b-41d4-a716-446655440005',
 'Blusa Floral',
 'Blusa con estampado floral delicado. Perfecta para la primavera con un toque romántico.',
 39900.00,
 ARRAY['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500'],
 '550e8400-e29b-41d4-a716-446655440005',
 60,
 false),

('880e8400-e29b-41d4-a716-446655440006',
 'Vestido Midi Casual',
 'Vestido midi casual perfecto para el día a día. Cómodo y elegante.',
 55900.00,
 ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
 '550e8400-e29b-41d4-a716-446655440004',
 35,
 false);

-- Insert product variants (combinations of products with sizes and colors)
-- Vestido Elegante Negro
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 5, 'VEN-S-BLK'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 8, 'VEN-M-BLK'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 10, 'VEN-L-BLK'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 7, 'VEN-XL-BLK');

-- Camisa Casual Blanca
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku) VALUES
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 15, 'CCB-S-WHT'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 20, 'CCB-M-WHT'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 18, 'CCB-L-WHT'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 12, 'CCB-S-NVY'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 10, 'CCB-M-NVY');

-- Jeans Slim Fit
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku) VALUES
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 8, 'JSF-M-NVY'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 12, 'JSF-L-NVY'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 10, 'JSF-XL-NVY'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 10, 'JSF-M-BLK');

-- Blazer Formal
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku) VALUES
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 5, 'BLF-M-BLK'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 8, 'BLF-L-BLK'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 6, 'BLF-XL-BLK'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', 6, 'BLF-L-GRY');

-- Blusa Floral
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku) VALUES
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440008', 15, 'BFL-S-PNK'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440008', 20, 'BFL-M-PNK'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440008', 15, 'BFL-L-PNK'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 10, 'BFL-M-WHT');

-- Vestido Midi Casual
INSERT INTO public.product_variants (product_id, size_id, color_id, stock, sku) VALUES
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', 8, 'VMC-S-BGE'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 12, 'VMC-M-BGE'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440005', 10, 'VMC-L-BGE'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', 5, 'VMC-M-GRN');
