-- Script para eliminar la columna name de la tabla users
-- Paso 1: Actualizar la función trigger para no usar más la columna name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error pero no fallar el registro de auth
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 2: Eliminar la columna name
ALTER TABLE public.users DROP COLUMN IF EXISTS name;
