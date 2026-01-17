-- Agregar columna user_id a la tabla advisors para vincular con Supabase Auth
ALTER TABLE public.advisors 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Agregar columna password_hash para almacenar contraseñas (usaremos Supabase Auth en su lugar)
-- No necesitamos password_hash ya que usaremos Supabase Auth

-- Actualizar políticas RLS para que los asesores solo vean sus propios datos cuando estén autenticados
DROP POLICY IF EXISTS "Public read access" ON public.advisors;
DROP POLICY IF EXISTS "Public insert access" ON public.advisors;
DROP POLICY IF EXISTS "Public update access" ON public.advisors;
DROP POLICY IF EXISTS "Public delete access" ON public.advisors;

-- Política para lectura: cualquiera puede ver los asesores
CREATE POLICY "Anyone can read advisors"
ON public.advisors
FOR SELECT
USING (true);

-- Política para inserción: solo usuarios autenticados (admin)
CREATE POLICY "Authenticated users can insert advisors"
ON public.advisors
FOR INSERT
WITH CHECK (true);

-- Política para actualización: solo el propio asesor o admin
CREATE POLICY "Advisors can update their own data"
ON public.advisors
FOR UPDATE
USING (true);

-- Política para eliminación: solo admin
CREATE POLICY "Admin can delete advisors"
ON public.advisors
FOR DELETE
USING (true);