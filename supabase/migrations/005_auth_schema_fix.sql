-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Auth Schema Fix & Real Business Categories
--  Migration: 005_auth_schema_fix
--
--  Changes:
--    1. Aligns public.users with Supabase Auth (drops password_hash,
--       removes auto-UUID default, adds FK to auth.users)
--    2. Installs handle_new_user() trigger for automatic profile creation
--    3. Replaces 6 placeholder categories with the 5 real business lines
--       + sub-categories (metal frame profiles, door materials)
--    4. Updates settings with real Mashouf Industrial Group contact data
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
--  FIX USERS TABLE — align with Supabase Auth
-- ─────────────────────────────────────────────

-- Drop password_hash — Supabase Auth owns credentials
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- Remove the auto-UUID default so ID always comes from auth.users
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;

-- FK to auth.users — CASCADE deletes profile when auth account is removed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_id_auth_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_auth_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END;
$$;

-- Make name columns nullable with empty defaults —
-- the trigger populates them from signup metadata
ALTER TABLE public.users
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN first_name SET DEFAULT '',
  ALTER COLUMN last_name  DROP NOT NULL,
  ALTER COLUMN last_name  SET DEFAULT '';

-- ─────────────────────────────────────────────
--  TRIGGER — Auto-create profile on signup
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    first_name,
    last_name,
    role,
    is_active,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name',  ''), ''),
    'customer',
    TRUE,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
--  HELPER — Role lookup for server-side checks
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid();
$$;

-- ─────────────────────────────────────────────
--  REAL PRODUCT CATEGORIES
--  5 core business lines + sub-categories.
--  Old 6 placeholder rows are removed first.
-- ─────────────────────────────────────────────

DELETE FROM public.product_categories
WHERE id IN (
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000006'
);

-- ── Main Categories ───────────────────────────
INSERT INTO public.product_categories
  (id, name, slug, description, "order", is_active)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'درب‌های ضد سرقت',
    'darb-zed-sereqat',
    'انواع درب‌های ضد سرقت با بالاترین استانداردهای امنیتی — شرایط ویژه برای پیمانکاران و انبوه‌سازان',
    1, TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'چهارچوب‌های فلزی',
    'chaharcoub-felezi',
    'چهارچوب‌های فرانسوی و مکزیکی، ۳ کلاف و ۴ کلاف، با رنگ‌های پخت آون متنوع',
    2, TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'درب‌های اتاقی',
    'darb-otaqi',
    'درب‌های داخلی ABS، ملامینه و MDF با طراحی مدرن و مقاومت بالا',
    3, TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'درب‌های سرویس بهداشتی',
    'darb-servis',
    'درب‌های ضد آب ABS و UPVC مخصوص سرویس بهداشتی — عایق رطوبت کامل',
    4, TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000005',
    'درب‌های حیاطی',
    'darb-hayati',
    'درب‌های حیاطی سفارشی با تزئینات فرفورژه — طراحی انحصاری گروه مشعوف',
    5, TRUE
  )
ON CONFLICT (slug) DO UPDATE
  SET name        = EXCLUDED.name,
      description = EXCLUDED.description,
      "order"     = EXCLUDED."order",
      updated_at  = NOW();

-- ── Sub-Categories: Metal Frames ─────────────
INSERT INTO public.product_categories
  (id, parent_id, name, slug, description, "order", is_active)
VALUES
  (
    'c2000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'چهارچوب فرانسوی',
    'chaharcoub-faransavi',
    'پروفیل فرانسوی — موجود در ۳ کلاف و ۴ کلاف با رنگ‌آمیزی پخت آون',
    1, TRUE
  ),
  (
    'c2000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'چهارچوب مکزیکی',
    'chaharcoub-mexicali',
    'پروفیل مکزیکی — موجود در ۳ کلاف و ۴ کلاف با رنگ‌آمیزی پخت آون',
    2, TRUE
  )
ON CONFLICT (slug) DO UPDATE
  SET name        = EXCLUDED.name,
      parent_id   = EXCLUDED.parent_id,
      description = EXCLUDED.description,
      updated_at  = NOW();

-- ── Sub-Categories: Interior Doors ───────────
INSERT INTO public.product_categories
  (id, parent_id, name, slug, description, "order", is_active)
VALUES
  (
    'c3000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'درب اتاقی ABS',
    'darb-otaqi-abs',
    'درب‌های اتاقی با روکش ABS — مقاوم، سبک و در رنگ‌های متنوع',
    1, TRUE
  ),
  (
    'c3000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000003',
    'درب اتاقی ملامینه',
    'darb-otaqi-melamine',
    'درب‌های اتاقی با روکش ملامینه — مقاوم در برابر خراش و رطوبت',
    2, TRUE
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000003',
    'درب اتاقی MDF',
    'darb-otaqi-mdf',
    'درب‌های اتاقی MDF با قابلیت طراحی و رنگ‌بندی سفارشی',
    3, TRUE
  )
ON CONFLICT (slug) DO UPDATE
  SET name        = EXCLUDED.name,
      parent_id   = EXCLUDED.parent_id,
      description = EXCLUDED.description,
      updated_at  = NOW();

-- ── Sub-Categories: Bathroom Doors ───────────
INSERT INTO public.product_categories
  (id, parent_id, name, slug, description, "order", is_active)
VALUES
  (
    'c4000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000004',
    'درب سرویس ABS ضد آب',
    'darb-servis-abs',
    'درب سرویس بهداشتی ABS — کاملاً ضد آب، ضد رطوبت و ضد خوردگی',
    1, TRUE
  ),
  (
    'c4000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'درب سرویس UPVC',
    'darb-servis-upvc',
    'درب سرویس بهداشتی UPVC — عایق حرارتی، صوتی و ضد رطوبت',
    2, TRUE
  )
ON CONFLICT (slug) DO UPDATE
  SET name        = EXCLUDED.name,
      parent_id   = EXCLUDED.parent_id,
      description = EXCLUDED.description,
      updated_at  = NOW();

-- ─────────────────────────────────────────────
--  UPDATE SETTINGS — Real Mashouf Industrial Group data
-- ─────────────────────────────────────────────

INSERT INTO public.settings ("key", value, "group", description, is_public)
VALUES
  ('site_name',    '"گروه صنعتی مشعوف"',                                   'general', 'نام سایت',          TRUE),
  ('site_url',     '"https://mashuf.com"',                                              'general', 'آدرس سایت',         TRUE),
  ('manager_name', '"حسام مشعوف"',                                                     'general', 'نام مدیر',          FALSE),
  ('site_phone',   '"09003286539"',                                                     'contact', 'شماره تماس',        TRUE),
  ('site_mobile',  '"09003286539"',                                                     'contact', 'موبایل',            TRUE),
  ('site_email',   '"info@mashuf.com"',                                                 'contact', 'ایمیل',             TRUE),
  ('site_address', '"مازندران، شهرستان قائم شهر، بلوار سید نظام‌الدین، جاده قادیکلای بزرگ، روبروی ولیعصر ۳۶"',
                                                                                        'contact', 'آدرس کامل',        TRUE),
  ('site_map_url', '"https://nshn.ir/537b1NmyGFj-5d"',                                 'contact', 'لینک نقشه نشان',   TRUE),
  ('working_hours','"شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳"',                   'contact', 'ساعات کاری',        TRUE),
  ('social_instagram', '"https://instagram.com/mashuf.industrial"',                     'social',  'اینستاگرام',       TRUE),
  ('social_telegram',  '"https://t.me/mashuf"',                                         'social',  'تلگرام',           TRUE),
  ('social_whatsapp',  '"https://wa.me/989003286539"',                                  'social',  'واتساپ',           TRUE)
ON CONFLICT ("key") DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = NOW();
