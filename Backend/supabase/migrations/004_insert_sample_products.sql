-- Insertar categorías de ejemplo
INSERT INTO public.categories (name, description, image_url) VALUES
('Electrónicos', 'Dispositivos electrónicos y gadgets tecnológicos', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
('Ropa', 'Vestimenta para hombre, mujer y niños', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
('Hogar', 'Artículos para el hogar y decoración', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Deportes', 'Equipamiento deportivo y fitness', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Libros', 'Libros físicos y digitales', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Belleza', 'Productos de belleza y cuidado personal', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400');

-- Insertar productos de ejemplo
INSERT INTO public.products (
  name, description, short_description, price, original_price, 
  category_id, brand, sku, stock_quantity, images, tags, 
  is_featured, rating, review_count, sold_count
) VALUES
-- Electrónicos
(
  'iPhone 15 Pro Max', 
  'El iPhone más avanzado hasta la fecha con chip A17 Pro, cámara de 48MP y diseño de titanio. Incluye Dynamic Island, Face ID y iOS 17 con las últimas funcionalidades.',
  'iPhone 15 Pro Max con chip A17 Pro y cámara de 48MP',
  1299.99, 1399.99,
  (SELECT id FROM public.categories WHERE name = 'Electrónicos'),
  'Apple', 'IPH15PM-256-BLU', 25,
  '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500"]',
  ARRAY['smartphone', 'apple', 'iphone', 'móvil', 'tecnología'],
  true, 4.8, 156, 89
),
(
  'MacBook Air M3', 
  'Laptop ultradelgada con chip M3 de Apple, pantalla Liquid Retina de 13.6 pulgadas, hasta 18 horas de batería y diseño sin ventilador para un funcionamiento silencioso.',
  'MacBook Air con chip M3 y pantalla de 13.6 pulgadas',
  1199.99, 1299.99,
  (SELECT id FROM public.categories WHERE name = 'Electrónicos'),
  'Apple', 'MBA-M3-256-SLV', 15,
  '["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500"]',
  ARRAY['laptop', 'macbook', 'apple', 'computadora', 'm3'],
  true, 4.7, 203, 145
),
(
  'Samsung Galaxy S24 Ultra', 
  'Smartphone premium con S Pen integrado, cámara de 200MP, pantalla Dynamic AMOLED 2X de 6.8 pulgadas y batería de 5000mAh con carga rápida.',
  'Galaxy S24 Ultra con S Pen y cámara de 200MP',
  1199.99, null,
  (SELECT id FROM public.categories WHERE name = 'Electrónicos'),
  'Samsung', 'SGS24U-512-BLK', 18,
  '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500"]',
  ARRAY['smartphone', 'samsung', 'galaxy', 'android', 's-pen'],
  false, 4.6, 89, 67
),

-- Ropa
(
  'Chaqueta de Cuero Premium', 
  'Chaqueta de cuero genuino de alta calidad, perfecta para cualquier ocasión. Diseño clásico con detalles modernos, forro interior suave y múltiples bolsillos.',
  'Chaqueta de cuero genuino con diseño clásico',
  299.99, 399.99,
  (SELECT id FROM public.categories WHERE name = 'Ropa'),
  'LeatherCraft', 'LC-JKT-001-BLK-L', 30,
  '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500"]',
  ARRAY['chaqueta', 'cuero', 'moda', 'outerwear', 'premium'],
  true, 4.5, 124, 78
),
(
  'Vestido Floral de Verano', 
  'Hermoso vestido con estampado floral, confeccionado en tela ligera y transpirable. Perfecto para días soleados con corte favorecedor y largo midi.',
  'Vestido floral ligero perfecto para verano',
  79.99, 99.99,
  (SELECT id FROM public.categories WHERE name = 'Ropa'),
  'SummerVibes', 'SV-DRS-002-FLR-M', 45,
  '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500", "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500"]',
  ARRAY['vestido', 'floral', 'verano', 'midi', 'femenino'],
  false, 4.3, 67, 92
),
(
  'Sneakers Deportivos Unisex', 
  'Zapatillas deportivas de alta gama con tecnología de amortiguación avanzada, parte superior transpirable y suela antideslizante para máximo rendimiento.',
  'Sneakers unisex con tecnología de amortiguación',
  149.99, null,
  (SELECT id FROM public.categories WHERE name = 'Ropa'),
  'SportMax', 'SM-SNK-003-WHT-42', 60,
  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500"]',
  ARRAY['sneakers', 'deportivos', 'unisex', 'running', 'cómodos'],
  true, 4.7, 189, 156
),

-- Hogar
(
  'Set de Sábanas de Bambú', 
  'Juego completo de sábanas fabricadas con fibra de bambú 100% natural. Increíblemente suaves, hipoalergénicas y con propiedades antibacterianas naturales.',
  'Sábanas de bambú suaves e hipoalergénicas',
  89.99, 119.99,
  (SELECT id FROM public.categories WHERE name = 'Hogar'),
  'EcoHome', 'EH-SHT-001-NAV-Q', 35,
  '["https://images.unsplash.com/photo-1631049421450-348c9b5f8edb?w=500", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500"]',
  ARRAY['sábanas', 'bambú', 'ecológico', 'suave', 'hipoalergénico'],
  false, 4.6, 145, 89
),
(
  'Lámpara LED Inteligente', 
  'Lámpara de mesa con tecnología LED y conectividad WiFi. Control por app móvil, 16 millones de colores, temporizador y compatibilidad con Alexa y Google Home.',
  'Lámpara LED inteligente con control WiFi',
  59.99, 79.99,
  (SELECT id FROM public.categories WHERE name = 'Hogar'),
  'SmartLight', 'SL-LED-002-RGB', 40,
  '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500", "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500"]',
  ARRAY['lámpara', 'led', 'inteligente', 'wifi', 'rgb'],
  true, 4.4, 98, 134
),

-- Deportes
(
  'Bicicleta de Montaña Professional', 
  'Bicicleta de montaña de alto rendimiento con cuadro de aluminio, suspensión delantera, 21 velocidades Shimano y frenos de disco hidráulicos.',
  'Bicicleta de montaña con suspensión y 21 velocidades',
  599.99, 749.99,
  (SELECT id FROM public.categories WHERE name = 'Deportes'),
  'MountainPro', 'MP-MTB-001-BLU-L', 12,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500", "https://images.unsplash.com/photo-1544191696-15693072b5b7?w=500"]',
  ARRAY['bicicleta', 'montaña', 'shimano', 'suspensión', 'outdoor'],
  true, 4.8, 67, 23
),
(
  'Set de Pesas Ajustables', 
  'Juego de mancuernas ajustables de 5 a 25 kg cada una. Sistema de ajuste rápido, agarre ergonómico y base de almacenamiento incluida.',
  'Mancuernas ajustables de 5-25kg con base',
  199.99, null,
  (SELECT id FROM public.categories WHERE name = 'Deportes'),
  'FitnessPro', 'FP-DBL-001-BLK', 20,
  '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"]',
  ARRAY['pesas', 'mancuernas', 'ajustables', 'fitness', 'home-gym'],
  false, 4.5, 112, 78
),

-- Libros
(
  'Cien Años de Soledad - Gabriel García Márquez', 
  'Obra maestra del realismo mágico que narra la historia de la familia Buendía a lo largo de varias generaciones en el pueblo ficticio de Macondo.',
  'Clásico del realismo mágico latinoamericano',
  18.99, 24.99,
  (SELECT id FROM public.categories WHERE name = 'Libros'),
  'Editorial Sudamericana', 'ES-CAS-001-ESP', 50,
  '["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"]',
  ARRAY['literatura', 'clásico', 'garcía-márquez', 'realismo-mágico', 'español'],
  true, 4.9, 892, 456
),

-- Belleza
(
  'Set de Cuidado Facial Completo', 
  'Kit completo para el cuidado facial que incluye limpiador, tónico, serum de vitamina C, crema hidratante y protector solar SPF 50. Para todo tipo de piel.',
  'Kit completo de cuidado facial con vitamina C',
  79.99, 99.99,
  (SELECT id FROM public.categories WHERE name = 'Belleza'),
  'GlowSkin', 'GS-SKC-001-KIT', 25,
  '["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500", "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500"]',
  ARRAY['skincare', 'facial', 'vitamina-c', 'hidratante', 'spf'],
  true, 4.6, 234, 167
);
