-- Migración para actualizar la estructura existente de productos
-- Agregar columnas faltantes a la tabla products

-- Agregar columnas si no existen
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500),
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- Renombrar columnas si es necesario (verificar nombres actuales primero)
-- Si la columna se llama 'stock' en lugar de 'stock_quantity'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock' AND table_schema = 'public') THEN
        ALTER TABLE public.products RENAME COLUMN stock TO stock_quantity;
    END IF;
END $$;

-- Si la columna se llama 'active' en lugar de 'is_active'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'active' AND table_schema = 'public') THEN
        ALTER TABLE public.products RENAME COLUMN active TO is_active;
    END IF;
END $$;

-- Si la columna se llama 'featured' en lugar de 'is_featured'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'featured' AND table_schema = 'public') THEN
        ALTER TABLE public.products RENAME COLUMN featured TO is_featured;
    END IF;
END $$;

-- Agregar constraint unique para SKU si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_sku_key' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_sku_key UNIQUE (sku);
    END IF;
END $$;

-- Agregar foreign key para category_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_category_id_fkey' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
END $$;

-- Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_description ON public.products USING gin(to_tsvector('spanish', description));

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
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

-- Actualizar productos existentes para asegurar valores por defecto
UPDATE public.products 
SET 
    is_active = COALESCE(is_active, true),
    is_featured = COALESCE(is_featured, false),
    rating = COALESCE(rating, 0),
    review_count = COALESCE(review_count, 0),
    sold_count = COALESCE(sold_count, 0),
    stock_quantity = COALESCE(stock_quantity, 0),
    min_stock_level = COALESCE(min_stock_level, 5),
    images = COALESCE(images, '[]'::jsonb)
WHERE id IS NOT NULL;
