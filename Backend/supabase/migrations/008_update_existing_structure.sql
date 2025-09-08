-- Migración para agregar columnas faltantes a la estructura existente
-- Agregar columnas que faltan manteniendo las existentes
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500),
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- Agregar constraint unique para SKU si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_sku_key' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_sku_key UNIQUE (sku);
    END IF;
END $$;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_description ON public.products USING gin(to_tsvector('spanish', description));

-- Actualizar tabla categories para agregar image_url si no existe
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Migrar datos de image a image_url si es necesario
UPDATE public.categories 
SET image_url = image 
WHERE image_url IS NULL AND image IS NOT NULL;

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow read products" ON public.products;

-- Crear políticas usando los nombres de columna correctos
CREATE POLICY "Allow read categories" ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow read products" ON public.products
FOR SELECT
TO anon, authenticated
USING (active = true);

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

-- Actualizar productos existentes con valores por defecto
UPDATE public.products 
SET 
    active = COALESCE(active, true),
    featured = COALESCE(featured, false),
    rating = COALESCE(rating, 0),
    review_count = COALESCE(review_count, 0),
    sold_count = COALESCE(sold_count, 0),
    stock = COALESCE(stock, 0),
    min_stock_level = COALESCE(min_stock_level, 5)
WHERE id IS NOT NULL;
