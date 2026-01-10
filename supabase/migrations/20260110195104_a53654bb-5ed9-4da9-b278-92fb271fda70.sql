-- Tabla de Normas ISO
CREATE TABLE public.iso_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  certification_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  follow_up_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  recertification_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Asesores
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Cuentas Bancarias
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_number TEXT NOT NULL,
  cci TEXT,
  currency TEXT NOT NULL DEFAULT 'soles',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Pasos de Certificación
CREATE TABLE public.certification_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Cotizaciones
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Datos del cliente
  client_ruc TEXT,
  client_razon_social TEXT,
  client_representante TEXT,
  client_celular TEXT,
  client_correo TEXT,
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE SET NULL,
  -- Montos
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  igv NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Estado
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de ISOs seleccionados por cotización
CREATE TABLE public.quotation_isos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  iso_id UUID NOT NULL REFERENCES public.iso_standards(id) ON DELETE CASCADE,
  certification BOOLEAN NOT NULL DEFAULT false,
  certification_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  follow_up BOOLEAN NOT NULL DEFAULT false,
  follow_up_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  recertification BOOLEAN NOT NULL DEFAULT false,
  recertification_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para archivos adjuntos (metadata, el archivo va a storage)
CREATE TABLE public.attached_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas (acceso público por ahora, sin auth)
ALTER TABLE public.iso_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_isos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attached_files ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para app interna sin auth)
CREATE POLICY "Public read access" ON public.iso_standards FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.iso_standards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.iso_standards FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.iso_standards FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.advisors FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.advisors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.advisors FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.advisors FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.bank_accounts FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.bank_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.bank_accounts FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.bank_accounts FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.certification_steps FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.certification_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.certification_steps FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.certification_steps FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.quotations FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.quotations FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.quotation_isos FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.quotation_isos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.quotation_isos FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.quotation_isos FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.attached_files FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.attached_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.attached_files FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.attached_files FOR DELETE USING (true);

-- Crear bucket para archivos adjuntos
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Políticas de storage
CREATE POLICY "Public read attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Public upload attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Public update attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'attachments');
CREATE POLICY "Public delete attachments" ON storage.objects FOR DELETE USING (bucket_id = 'attachments');

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_iso_standards_updated_at BEFORE UPDATE ON public.iso_standards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON public.advisors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certification_steps_updated_at BEFORE UPDATE ON public.certification_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attached_files_updated_at BEFORE UPDATE ON public.attached_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();