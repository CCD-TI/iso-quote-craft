CREATE INDEX IF NOT EXISTS idx_quotation_isos_quotation_id ON public.quotation_isos (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at_desc ON public.quotations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_code ON public.quotations (code text_pattern_ops);