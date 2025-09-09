-- 012_add_color_size_to_order_items.sql
-- Migración para agregar columnas color y size a la tabla order_items

ALTER TABLE public.order_items
ADD COLUMN color TEXT;

ALTER TABLE public.order_items
ADD COLUMN size TEXT;
