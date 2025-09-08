-- Configurar políticas de seguridad para la tabla users

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (lectura) a usuarios autenticados y anónimos para validación
CREATE POLICY "Allow select for email validation" ON public.users
FOR SELECT
TO anon, authenticated
USING (true);

-- Política para permitir INSERT solo durante el registro (via trigger)
CREATE POLICY "Allow insert via trigger" ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para permitir UPDATE solo al propio usuario
CREATE POLICY "Allow update own profile" ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';
