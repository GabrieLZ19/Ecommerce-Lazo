-- 015_insert_variant_sneakers_unisex.sql
-- Inserta un variant por defecto para el producto 'Sneakers Deportivos Unisex'

INSERT INTO public.product_variants (id, product_id, size_id, color_id, stock, price, sku, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '86ee42b6-aa45-49cd-b0ac-bf6c3c55b71c',
  (SELECT id FROM public.sizes WHERE value = 'default' LIMIT 1),
  (SELECT id FROM public.colors WHERE name = 'Color único' LIMIT 1),
  60, -- stock
  149.99, -- price
  'SM-SNK-003-WHT-42', -- sku
  NOW(),
  NOW()
);
