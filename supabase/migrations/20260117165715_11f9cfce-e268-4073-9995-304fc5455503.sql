-- Agregar campo is_admin para distinguir administradores
ALTER TABLE public.advisors 
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;