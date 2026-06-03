-- ============================================================
-- Migration 006: Construction & Real Estate Projects Module
-- Brand: گروه صنعتی مشعوف
-- ============================================================

-- Status enum for projects
CREATE TYPE construction_project_status AS ENUM (
  'for_sale',    -- برای فروش
  'pre_sale',    -- پیش‌فروش
  'delivered'    -- تحویل‌شده
);

-- ── Core table ──────────────────────────────────────────────
CREATE TABLE construction_projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  short_description     TEXT,                          -- خلاصه برای کارت‌ها
  description           TEXT,                          -- توضیحات کامل
  architecture_description TEXT,                       -- توضیحات معماری (نقطه فروش)
  location              TEXT,                          -- آدرس / شهر / منطقه
  area                  NUMERIC(10, 2),                -- متراژ (m²)
  floors                SMALLINT,                      -- تعداد طبقات
  units                 SMALLINT,                      -- تعداد واحدها
  bedrooms              SMALLINT,                      -- تعداد اتاق خواب
  price_from            BIGINT,                        -- قیمت از (تومان)
  price_to              BIGINT,                        -- قیمت تا (تومان)
  completion_year       SMALLINT,                      -- سال تحویل / تکمیل
  status                construction_project_status NOT NULL DEFAULT 'for_sale',
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  thumbnail_url         TEXT,                          -- تصویر اصلی / بنر
  gallery               JSONB NOT NULL DEFAULT '[]',   -- آرایه‌ای از {url, caption, order}
  amenities             JSONB NOT NULL DEFAULT '[]',   -- آرایه‌ای از {icon, label}
  specifications        JSONB NOT NULL DEFAULT '[]',   -- آرایه‌ای از {label, value}
  latitude              NUMERIC(10, 7),                -- مختصات GPS
  longitude             NUMERIC(10, 7),
  seo_title             TEXT,
  seo_description       TEXT,
  view_count            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Index for common queries ─────────────────────────────────
CREATE INDEX idx_construction_projects_slug    ON construction_projects (slug);
CREATE INDEX idx_construction_projects_status  ON construction_projects (status) WHERE is_active = true;
CREATE INDEX idx_construction_projects_featured ON construction_projects (is_featured) WHERE is_active = true;
CREATE INDEX idx_construction_projects_area    ON construction_projects (area);

-- ── Full-text search (Persian-friendly) ──────────────────────
CREATE INDEX idx_construction_projects_fts ON construction_projects
  USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(location, '') || ' ' || coalesce(short_description, '')));

-- ── Auto-update updated_at ────────────────────────────────────
CREATE TRIGGER trg_construction_projects_updated_at
  BEFORE UPDATE ON construction_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE construction_projects ENABLE ROW LEVEL SECURITY;

-- Public: read active projects
CREATE POLICY "construction_projects_public_read"
  ON construction_projects FOR SELECT
  USING (is_active = true);

-- Admin: full access
CREATE POLICY "construction_projects_admin_all"
  ON construction_projects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Storage bucket for project images ────────────────────────
-- Run this in Supabase Dashboard → Storage if the bucket doesn't exist yet.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true)
-- ON CONFLICT DO NOTHING;

-- Storage policy: public read
-- CREATE POLICY "projects_storage_public_read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'projects');

-- Storage policy: admin write
-- CREATE POLICY "projects_storage_admin_write"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'projects' AND is_admin());

-- ── Seed: sample project ──────────────────────────────────────
INSERT INTO construction_projects (
  title, slug, short_description, description, architecture_description,
  location, area, floors, units, bedrooms,
  price_from, price_to, completion_year,
  status, is_featured, is_active,
  thumbnail_url,
  amenities,
  specifications
) VALUES (
  'برج مسکونی نور',
  'borj-maskooni-noor',
  'برجی منحصربه‌فرد با معماری مدرن در قلب شهر',
  'برج مسکونی نور با ۱۸ طبقه و ۷۲ واحد لوکس در منطقه ۱ تهران، ترکیبی بی‌نظیر از سبک معماری معاصر و امکانات پنج‌ستاره را ارائه می‌دهد.',
  'طراحی نما الهام‌گرفته از خطوط خالص معماری مینیمال اروپایی با استفاده از شیشه دوجداره لو-امیسیون و سنگ ترکیه. لابی دو طبقه با ارتفاع ۶ متر.',
  'تهران، منطقه ۱، الهیه',
  185.00, 18, 72, 3,
  25000000000, 38000000000,
  1404,
  'pre_sale', true, true,
  '/images/projects/borj-noor-thumb.webp',
  '[
    {"icon": "pool", "label": "استخر سرپوشیده"},
    {"icon": "gym", "label": "باشگاه ورزشی"},
    {"icon": "parking", "label": "پارکینگ اختصاصی"},
    {"icon": "concierge", "label": "کنسیرژ ۲۴ ساعته"},
    {"icon": "lobby", "label": "لابی لوکس"},
    {"icon": "rooftop", "label": "روف‌گاردن"}
  ]',
  '[
    {"label": "متراژ", "value": "۱۵۰ تا ۲۲۰ متر"},
    {"label": "تعداد طبقات", "value": "۱۸ طبقه"},
    {"label": "تعداد واحد", "value": "۷۲ واحد"},
    {"label": "اتاق خواب", "value": "۳ خواب"},
    {"label": "پارکینگ", "value": "۲ پارکینگ اختصاصی"},
    {"label": "انباری", "value": "انباری اختصاصی"},
    {"label": "سیستم گرمایش", "value": "فن‌کوئل مرکزی"},
    {"label": "نما", "value": "شیشه و سنگ"}
  ]'
);
