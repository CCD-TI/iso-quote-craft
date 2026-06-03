
-- Revoke column-level access to sensitive advisor columns from public roles.
-- The advisor-auth edge function uses service_role and is unaffected.
REVOKE SELECT (password_hash) ON public.advisors FROM anon, authenticated, PUBLIC;
REVOKE UPDATE (password_hash) ON public.advisors FROM anon, authenticated, PUBLIC;
REVOKE INSERT (password_hash) ON public.advisors FROM anon, authenticated, PUBLIC;

-- Harden trigger function with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
