-- Verificar todos los usuarios con el mismo email
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'gabriellazo48@gmail.com'
ORDER BY created_at;

-- Verificar usuarios en public.users
SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at
FROM public.users 
WHERE email = 'gabriellazo48@gmail.com'
ORDER BY created_at;
