-- Crear tabla de colores
CREATE TABLE IF NOT EXISTS public.colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  hex VARCHAR(7) NOT NULL, -- Color en formato hex como #FF0000
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de tallas/sizes
CREATE TABLE IF NOT EXISTS public.sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(10) NOT NULL, -- XS, S, M, L, XL, etc.
  value VARCHAR(20) NOT NULL, -- Valor numérico o descriptivo
  category VARCHAR(50), -- ropa, calzado, general, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de variantes de productos
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.sizes(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES public.colors(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10, 2), -- Precio específico para esta variante (opcional)
  sku VARCHAR(100), -- SKU específico para la variante
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraint para evitar duplicados
  UNIQUE(product_id, size_id, color_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size_id ON public.product_variants(size_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_color_id ON public.product_variants(color_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_colors_updated_at ON public.colors;
CREATE TRIGGER update_colors_updated_at BEFORE UPDATE ON public.colors
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_sizes_updated_at ON public.sizes;
CREATE TRIGGER update_sizes_updated_at BEFORE UPDATE ON public.sizes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Políticas para colores (lectura pública)
CREATE POLICY "Colors are viewable by everyone" ON public.colors
    FOR SELECT USING (true);

-- Políticas para tallas (lectura pública)
CREATE POLICY "Sizes are viewable by everyone" ON public.sizes
    FOR SELECT USING (true);

-- Políticas para variantes (lectura pública)
CREATE POLICY "Product variants are viewable by everyone" ON public.product_variants
    FOR SELECT USING (true);
