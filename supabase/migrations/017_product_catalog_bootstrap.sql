-- Idempotent product-catalog bootstrap for partially initialized environments.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app_private;

DO $$ BEGIN
  CREATE TYPE public.stock_status AS ENUM ('in_stock', 'out_of_stock', 'pre_order', 'discontinued');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.attribute_type AS ENUM ('text', 'number', 'boolean', 'color', 'select');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  brand VARCHAR(200),
  short_description TEXT,
  description TEXT NOT NULL,
  body_content TEXT,
  price NUMERIC(15, 0) NOT NULL DEFAULT 0,
  compare_price NUMERIC(15, 0),
  cost_price NUMERIC(15, 0),
  category_id UUID NOT NULL REFERENCES public.product_categories(id),
  tags TEXT[],
  stock INT NOT NULL DEFAULT 0,
  stock_left INT NOT NULL DEFAULT 0 CHECK (stock_left >= 0),
  stock_right INT NOT NULL DEFAULT 0 CHECK (stock_right >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  stock_status public.stock_status NOT NULL DEFAULT 'in_stock',
  weight NUMERIC(8, 3),
  width NUMERIC(8, 2),
  height NUMERIC(8, 2),
  depth NUMERIC(8, 2),
  dimension_unit VARCHAR(10) DEFAULT 'cm',
  dimension_options TEXT[] NOT NULL DEFAULT '{}',
  allow_custom_dimensions BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  focus_keyword VARCHAR(200),
  canonical_url TEXT,
  robots VARCHAR(50),
  og_title VARCHAR(95),
  og_description VARCHAR(300),
  og_image_url TEXT,
  faq_pairs JSONB NOT NULL DEFAULT '[]'::JSONB,
  ai_summary TEXT,
  entity_keywords TEXT[],
  linked_frame_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.users(id),
  view_count INT NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products
  ALTER COLUMN created_by SET DEFAULT auth.uid();

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label VARCHAR(200) NOT NULL,
  value TEXT NOT NULL,
  unit VARCHAR(50),
  "group" VARCHAR(100),
  "order" INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  type public.attribute_type NOT NULL DEFAULT 'text',
  unit VARCHAR(50),
  options TEXT[],
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  UNIQUE(product_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS public.product_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.frame_price_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_type VARCHAR(50) NOT NULL,
  color_name VARCHAR(100) NOT NULL,
  price_3klaf NUMERIC(15, 0) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_product ON public.product_specifications(product_id);

CREATE OR REPLACE FUNCTION app_private.catalog_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role::TEXT IN ('admin', 'super_admin')
      AND is_active = TRUE
  );
$$;

GRANT USAGE ON SCHEMA app_private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.catalog_admin() TO anon, authenticated;

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_price_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_categories_read" ON public.product_categories;
CREATE POLICY "catalog_categories_read" ON public.product_categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "catalog_categories_admin" ON public.product_categories;
CREATE POLICY "catalog_categories_admin" ON public.product_categories FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_products_read" ON public.products;
CREATE POLICY "catalog_products_read" ON public.products FOR SELECT
  USING (is_active = TRUE OR app_private.catalog_admin());
DROP POLICY IF EXISTS "catalog_products_admin" ON public.products;
CREATE POLICY "catalog_products_admin" ON public.products FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_images_read" ON public.product_images;
CREATE POLICY "catalog_images_read" ON public.product_images FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "catalog_images_admin" ON public.product_images;
CREATE POLICY "catalog_images_admin" ON public.product_images FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_specs_read" ON public.product_specifications;
CREATE POLICY "catalog_specs_read" ON public.product_specifications FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "catalog_specs_admin" ON public.product_specifications;
CREATE POLICY "catalog_specs_admin" ON public.product_specifications FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_attributes_read" ON public.product_attributes;
CREATE POLICY "catalog_attributes_read" ON public.product_attributes FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "catalog_attributes_admin" ON public.product_attributes;
CREATE POLICY "catalog_attributes_admin" ON public.product_attributes FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_attribute_values_read" ON public.product_attribute_values;
CREATE POLICY "catalog_attribute_values_read" ON public.product_attribute_values FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "catalog_attribute_values_admin" ON public.product_attribute_values;
CREATE POLICY "catalog_attribute_values_admin" ON public.product_attribute_values FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_downloads_read" ON public.product_downloads;
CREATE POLICY "catalog_downloads_read" ON public.product_downloads FOR SELECT
  USING (is_public = TRUE OR app_private.catalog_admin());
DROP POLICY IF EXISTS "catalog_downloads_admin" ON public.product_downloads;
CREATE POLICY "catalog_downloads_admin" ON public.product_downloads FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

DROP POLICY IF EXISTS "catalog_frames_read" ON public.frame_price_list;
CREATE POLICY "catalog_frames_read" ON public.frame_price_list FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "catalog_frames_admin" ON public.frame_price_list;
CREATE POLICY "catalog_frames_admin" ON public.frame_price_list FOR ALL
  USING (app_private.catalog_admin()) WITH CHECK (app_private.catalog_admin());

GRANT SELECT ON public.product_categories, public.products, public.product_images,
  public.product_specifications, public.product_attributes,
  public.product_attribute_values, public.product_downloads,
  public.frame_price_list TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_categories, public.products,
  public.product_images, public.product_specifications, public.product_attributes,
  public.product_attribute_values, public.product_downloads,
  public.frame_price_list TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  TRUE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "catalog_product_files_insert" ON storage.objects;
CREATE POLICY "catalog_product_files_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND app_private.catalog_admin());
DROP POLICY IF EXISTS "catalog_product_files_update" ON storage.objects;
CREATE POLICY "catalog_product_files_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'products' AND app_private.catalog_admin())
  WITH CHECK (bucket_id = 'products' AND app_private.catalog_admin());
DROP POLICY IF EXISTS "catalog_product_files_delete" ON storage.objects;
CREATE POLICY "catalog_product_files_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND app_private.catalog_admin());
