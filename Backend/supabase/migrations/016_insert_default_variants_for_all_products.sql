-- 016_insert_default_variants_for_all_products.sql
-- Crea un variant por defecto para cada producto que no tenga ninguno

INSERT INTO public.product_variants (id, product_id, size_id, color_id, stock, price, sku, created_at, updated_at)
SELECT gen_random_uuid(), p.id, s.id, c.id, p.stock, p.price, p.sku, NOW(), NOW()
FROM public.products p
JOIN public.sizes s ON s.value = 'default'
JOIN public.colors c ON c.name = 'Color único'
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_variants v WHERE v.product_id = p.id
);
