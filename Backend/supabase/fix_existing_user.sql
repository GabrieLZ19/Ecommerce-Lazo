-- Verificar qué datos tiene el raw_user_meta_data del usuario existente
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users 
WHERE email = 'gabriellazo48@gmail.com'
ORDER BY created_at;

-- Actualizar manualmente el usuario existente con los datos correctos
UPDATE public.users 
SET 
  first_name = 'Gabriel',
  last_name = 'Lazo',
  updated_at = NOW()
WHERE email = 'gabriellazo48@gmail.com';

-- Verificar que se actualizó correctamente
SELECT id, email, first_name, last_name, created_at, updated_at
FROM public.users 
WHERE email = 'gabriellazo48@gmail.com';
