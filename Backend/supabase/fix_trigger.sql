-- Primero, eliminamos el trigger existente si hay problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreamos la función trigger con manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, first_name, last_name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      ''
    ),
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

-- Recreamos el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Script para migrar usuarios existentes de auth.users a public.users
INSERT INTO public.users (id, email, name, first_name, last_name, phone, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name', 
    CONCAT(
      COALESCE(au.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(au.raw_user_meta_data->>'last_name', '')
    ),
    ''
  ),
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
