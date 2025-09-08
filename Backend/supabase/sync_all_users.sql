-- Sincronizar todos los usuarios de auth.users a public.users que falten
INSERT INTO public.users (id, email, first_name, last_name, phone, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Verificar el resultado
SELECT 
  'Usuarios en auth.users' as tabla,
  COUNT(*) as cantidad
FROM auth.users

UNION ALL

SELECT 
  'Usuarios en public.users' as tabla,
  COUNT(*) as cantidad
FROM public.users;
