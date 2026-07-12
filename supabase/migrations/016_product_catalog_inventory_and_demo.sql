-- Complete category taxonomy, directional inventory, dimensions, and demo product.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_left INT NOT NULL DEFAULT 0 CHECK (stock_left >= 0),
  ADD COLUMN IF NOT EXISTS stock_right INT NOT NULL DEFAULT 0 CHECK (stock_right >= 0),
  ADD COLUMN IF NOT EXISTS allow_custom_dimensions BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dimension_options TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

CREATE OR REPLACE FUNCTION app_private.sync_directional_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.stock := NEW.stock_left + NEW.stock_right;
  NEW.stock_status := CASE
    WHEN NEW.stock > 0 THEN 'in_stock'::public.stock_status
    ELSE 'out_of_stock'::public.stock_status
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_directional_product_stock ON public.products;
CREATE TRIGGER trg_sync_directional_product_stock
  BEFORE INSERT OR UPDATE OF stock_left, stock_right ON public.products
  FOR EACH ROW EXECUTE FUNCTION app_private.sync_directional_product_stock();

-- Keep existing stock usable by assigning it to right-opening stock once.
UPDATE public.products
SET stock_right = stock
WHERE stock > 0 AND stock_left = 0 AND stock_right = 0;

-- Main categories.
INSERT INTO public.product_categories (name, slug, description, "order", is_active) VALUES
  ('چهارچوب فلزی', 'چهارچوب-فلزی', 'چهارچوب‌های فلزی فرانسوی و مکزیکی در ابعاد استاندارد و سفارشی', 10, TRUE),
  ('درب ضد سرقت', 'درب-ضد-سرقت', 'درب‌های ضد سرقت با رویه فلزی یا چوبی', 20, TRUE),
  ('درب اتاقی', 'درب-اتاقی', 'درب‌های اتاقی ملامینه، ABS و PVC', 30, TRUE),
  ('درب آهنی', 'درب-آهنی', 'درب‌های حیاطی، انباری و ویلایی', 40, TRUE),
  ('درب ضد حریق', 'درب-ضد-حریق', 'درب‌های مقاوم در برابر حریق در طرح‌ها و رنگ‌های مختلف', 50, TRUE),
  ('دستگیره هوشمند', 'دستگیره-هوشمند', 'انواع دستگیره و قفل هوشمند', 60, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "order" = EXCLUDED."order",
  is_active = TRUE;

-- Subcategories.
INSERT INTO public.product_categories (parent_id, name, slug, description, "order", is_active)
SELECT parent.id, child.name, child.slug, child.description, child.sort_order, TRUE
FROM (
  VALUES
    ('چهارچوب-فلزی', 'چهارچوب فرانسوی', 'چهارچوب-فرانسوی', 'ابعاد استاندارد یا سفارشی', 11),
    ('چهارچوب-فلزی', 'چهارچوب مکزیکی', 'چهارچوب-مکزیکی', 'ابعاد استاندارد یا سفارشی', 12),
    ('درب-ضد-سرقت', 'رویه فلزی', 'درب-ضد-سرقت-رویه-فلزی', 'مدل‌های ضد سرقت با رویه فلزی', 21),
    ('درب-ضد-سرقت', 'رویه چوبی', 'درب-ضد-سرقت-رویه-چوبی', 'مدل‌های ضد سرقت با رویه چوبی', 22),
    ('درب-اتاقی', 'درب اتاقی ملامینه', 'درب-اتاقی-ملامینه', 'رویه ملامینه', 31),
    ('درب-اتاقی', 'درب اتاقی ABS', 'درب-اتاقی-abs', 'مقاوم در برابر رطوبت', 32),
    ('درب-اتاقی', 'درب اتاقی PVC', 'درب-اتاقی-pvc', 'رویه PVC', 33),
    ('درب-آهنی', 'درب حیاطی', 'درب-حیاطی', 'درب آهنی مناسب حیاط', 41),
    ('درب-آهنی', 'درب انباری', 'درب-انباری', 'درب آهنی مناسب انباری', 42),
    ('درب-آهنی', 'درب ویلایی', 'درب-ویلایی', 'درب آهنی مناسب ویلا', 43)
) AS child(parent_slug, name, slug, description, sort_order)
JOIN public.product_categories parent ON parent.slug = child.parent_slug
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "order" = EXCLUDED."order",
  is_active = TRUE;

-- A real demo product owned by the requested super-admin account.
INSERT INTO public.products (
  sku, name, slug, short_description, description, price, category_id,
  stock_left, stock_right, low_stock_threshold, width, height, depth,
  dimension_unit, dimension_options, allow_custom_dimensions,
  is_active, is_featured, is_new, created_by
)
SELECT
  'MSH-DEMO-001',
  'درب ضد سرقت دمو مشعوف',
  'درب-ضد-سرقت-دمو-مشعوف',
  'محصول آزمایشی برای بررسی کامل بارگذاری، انتخاب جهت بازشو و ابعاد',
  'درب ضد سرقت دمو با ساختار فولادی، رویه چوبی، امکان انتخاب چپ‌بازشو یا راست‌بازشو و سفارش در ابعاد استاندارد یا سفارشی.',
  38500000,
  category.id,
  5,
  7,
  3,
  115,
  210,
  18,
  'cm',
  ARRAY['۱۰۵ × ۲۱۰ سانتی‌متر', '۱۱۰ × ۲۱۰ سانتی‌متر', '۱۱۵ × ۲۱۰ سانتی‌متر'],
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  admin_user.id
FROM public.product_categories category
CROSS JOIN public.users admin_user
WHERE category.slug = 'درب-ضد-سرقت-رویه-چوبی'
  AND admin_user.email = 'ph_09003286539@mashuf.com'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_id = EXCLUDED.category_id,
  stock_left = EXCLUDED.stock_left,
  stock_right = EXCLUDED.stock_right,
  dimension_options = EXCLUDED.dimension_options,
  allow_custom_dimensions = EXCLUDED.allow_custom_dimensions,
  is_active = TRUE;

INSERT INTO public.product_images (product_id, url, alt, is_primary, "order")
SELECT product.id, '/products/MSH-1001/main.webp', 'درب ضد سرقت دمو مشعوف', TRUE, 0
FROM public.products product
WHERE product.sku = 'MSH-DEMO-001'
  AND NOT EXISTS (
    SELECT 1 FROM public.product_images image
    WHERE image.product_id = product.id
  );

INSERT INTO public.product_specifications (product_id, label, value, unit, "group", "order")
SELECT product.id, spec.label, spec.value, spec.unit, spec.group_name, spec.sort_order
FROM public.products product
CROSS JOIN (
  VALUES
    ('ساختار داخلی', 'ورق فولادی سرتاسری', NULL, 'ساختار و امنیت', 1),
    ('رویه', 'چوبی مقاوم', NULL, 'پوشش', 2),
    ('ضخامت', '۱۸', 'سانتی‌متر', 'ابعاد', 3),
    ('ضمانت', '۵', 'سال', 'خدمات', 4)
) AS spec(label, value, unit, group_name, sort_order)
WHERE product.sku = 'MSH-DEMO-001'
  AND NOT EXISTS (
    SELECT 1 FROM public.product_specifications existing
    WHERE existing.product_id = product.id
  );
