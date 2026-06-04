-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — لیست قیمت چهارچوب فلزی
--  Migration: 007_frame_price_list
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
--  FRAME PRICE LIST TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS frame_price_list (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  frame_type      VARCHAR(20) NOT NULL CHECK (frame_type IN ('french', 'mexican')),
  color_name      VARCHAR(100) NOT NULL,
  color_hex       VARCHAR(7),
  has_hinge       BOOLEAN NOT NULL DEFAULT TRUE,
  price_3klaf     INTEGER NOT NULL,
  klaf4_addon     INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS frame_product_specs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_key        VARCHAR(100) NOT NULL UNIQUE,
  spec_value      TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
--  SEED — چهارچوب فرانسوی
-- ─────────────────────────────────────────────

INSERT INTO frame_price_list (frame_type, color_name, color_hex, has_hinge, price_3klaf, klaf4_addon, sort_order) VALUES
  ('french', 'قهوه‌ای',           '#3D1A0A', TRUE,  3700000, 600000, 1),
  ('french', 'طوسی',              '#6B7280', TRUE,  3600000, 600000, 2),
  ('french', 'مشکی',              '#1A1A1A', TRUE,  3700000, 600000, 3),
  ('french', 'سفید',              '#F0F0F0', TRUE,  4000000, 600000, 4),
  ('french', 'طوسی بدون لولا',    '#6B7280', FALSE, 3500000, 600000, 5)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
--  SEED — چهارچوب مکزیکی
-- ─────────────────────────────────────────────

INSERT INTO frame_price_list (frame_type, color_name, color_hex, has_hinge, price_3klaf, klaf4_addon, sort_order) VALUES
  ('mexican', 'قهوه‌ای',          '#3D1A0A', TRUE,  4500000, 900000, 1),
  ('mexican', 'طوسی',             '#6B7280', TRUE,  4400000, 900000, 2),
  ('mexican', 'مشکی',             '#1A1A1A', TRUE,  4500000, 900000, 3),
  ('mexican', 'سفید',             '#F0F0F0', TRUE,  4800000, 900000, 4),
  ('mexican', 'طوسی بدون لولا',   '#6B7280', FALSE, 4400000, 900000, 5)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
--  SEED — مشخصات فنی
-- ─────────────────────────────────────────────

INSERT INTO frame_product_specs (spec_key, spec_value, sort_order) VALUES
  ('thickness',    '۲ میلیمتر',                    1),
  ('material',     'ورق فولادی گالوانیزه',          2),
  ('finish',       'رنگ کوره‌ای الکترواستاتیک',     3),
  ('hinge',        'لولا پارس کلون',               4),
  ('weld',         'جوشکاری صنعتی دقیق',            5),
  ('resistance',   'مقاومت بالا در برابر ضربه',     6),
  ('customizable', 'قابل سفارش در ابعاد مختلف',    7),
  ('suitable_for', 'مناسب پروژه‌های ساختمانی و صنعتی', 8)
ON CONFLICT (spec_key) DO NOTHING;

-- ─────────────────────────────────────────────
--  TRIGGER: updated_at
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_frame_price_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_frame_price_list_updated_at ON frame_price_list;
CREATE TRIGGER trg_frame_price_list_updated_at
  BEFORE UPDATE ON frame_price_list
  FOR EACH ROW EXECUTE FUNCTION update_frame_price_list_updated_at();
