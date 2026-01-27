-- Add display_order column to iso_standards table
ALTER TABLE public.iso_standards 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing records with an initial order based on code
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) as rn
  FROM public.iso_standards
)
UPDATE public.iso_standards 
SET display_order = ordered.rn
FROM ordered 
WHERE public.iso_standards.id = ordered.id;