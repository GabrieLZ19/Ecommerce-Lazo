-- Crear tabla de categorías
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE public.products (
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
  dimensions JSONB, -- {length, width, height}
  images JSONB DEFAULT '[]'::jsonb, -- Array de URLs de imágenes
  tags TEXT[], -- Array de tags para búsqueda
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_products_name ON public.products USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_products_description ON public.products USING gin(to_tsvector('spanish', description));

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías (solo lectura para todos)
CREATE POLICY "Allow read categories" ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

-- Políticas para productos (solo lectura para todos, escritura para autenticados)
CREATE POLICY "Allow read products" ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
