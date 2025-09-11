-- Migration: assign default product images to products without images
BEGIN;

WITH to_update AS (
  SELECT id, row_number() OVER (ORDER BY id) - 1 as rn
  FROM public.products
  WHERE images IS NULL OR array_length(images,1) = 0
)
UPDATE public.products p
SET images = CASE (to_update.rn % 4)
  WHEN 0 THEN ARRAY['/images/products/product-1.svg']
  WHEN 1 THEN ARRAY['/images/products/product-2.svg']
  WHEN 2 THEN ARRAY['/images/products/product-3.svg']
  WHEN 3 THEN ARRAY['/images/products/product-4.svg']
  END
FROM to_update
WHERE p.id = to_update.id;

COMMIT;
