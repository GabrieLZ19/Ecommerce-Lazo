-- Migración compatible con la estructura existente de categories
-- Actualizar tabla categories para agregar columnas faltantes
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Migrar datos de la columna 'image' a 'image_url' si existe
UPDATE public.categories 
SET image_url = image 
WHERE image_url IS NULL AND image IS NOT NULL;

-- Crear tabla products compatible con categories existente
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  weight DECIMAL(8,2),
  dimensions JSONB,
  images JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_description ON public.products USING gin(to_tsvector('spanish', description));

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow read products" ON public.products;

-- Crear políticas
CREATE POLICY "Allow read categories" ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow read products" ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

-- Crear triggers
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
