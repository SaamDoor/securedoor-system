-- Remove frames admin module tables and product linkage column.

DROP TABLE IF EXISTS public.frame_product_specs CASCADE;
DROP TABLE IF EXISTS public.frame_price_list CASCADE;

ALTER TABLE public.products
  DROP COLUMN IF EXISTS linked_frame_ids;
