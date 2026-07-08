-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Restore global settings table
--  Migration: 014_restore_global_settings
--
--  این migration جدول settings مورد نیاز storefront و پنل ادمین را
--  با RLS امن و داده‌های پایه برند مشعوف ایجاد می‌کند.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar(200) UNIQUE NOT NULL,
  value jsonb NOT NULL,
  "group" varchar(100) NOT NULL DEFAULT 'general',
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings("key");
CREATE INDEX IF NOT EXISTS idx_settings_group ON public.settings("group");
CREATE INDEX IF NOT EXISTS idx_settings_public ON public.settings(is_public);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.settings TO authenticated;

DROP POLICY IF EXISTS "settings_select_public_or_admin" ON public.settings;
CREATE POLICY "settings_select_public_or_admin"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (
    is_public = TRUE
    OR app_private.current_user_role() IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS "settings_admin_insert" ON public.settings;
CREATE POLICY "settings_admin_insert"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (app_private.current_user_role() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "settings_admin_update" ON public.settings;
CREATE POLICY "settings_admin_update"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (app_private.current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (app_private.current_user_role() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "settings_super_admin_delete" ON public.settings;
CREATE POLICY "settings_super_admin_delete"
  ON public.settings
  FOR DELETE
  TO authenticated
  USING (app_private.current_user_role() = 'super_admin');

INSERT INTO public.settings ("key", value, "group", description, is_public) VALUES
  ('site_name', '"گروه صنعتی مشعوف"'::jsonb, 'general', 'نام سایت', TRUE),
  ('site_url', '"https://mashuf.com"'::jsonb, 'general', 'آدرس سایت', TRUE),
  ('site_phone', '"09003286539"'::jsonb, 'contact', 'شماره تماس', TRUE),
  ('site_email', '"info@mashuf.com"'::jsonb, 'contact', 'ایمیل', TRUE),
  ('site_address', '"مازندران، شهرستان قائم شهر، بلوار سید نظام‌الدین، جاده قادیکلای بزرگ، روبروی ولیعصر ۳۶"'::jsonb, 'contact', 'آدرس', TRUE),
  ('working_hours', '"شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳"'::jsonb, 'contact', 'ساعات کاری', TRUE),
  ('hero_title', '"به گروه صنعتی مشعوف خوش آمدید"'::jsonb, 'hero', 'تیتر اصلی صفحه اول', TRUE),
  ('hero_subtitle', '"تولیدکننده درب‌های فلزی صنعتی و ضدسرقت"'::jsonb, 'hero', 'زیرتیتر صفحه اول', TRUE),
  ('hero_cta_text', '"مشاهده محصولات"'::jsonb, 'hero', 'متن دکمه اقدام صفحه اول', TRUE),
  ('hero_cta_url', '"/products"'::jsonb, 'hero', 'لینک دکمه اقدام', TRUE),
  ('hero_image_url', '""'::jsonb, 'hero', 'تصویر پس‌زمینه هیرو', TRUE),
  ('contact_phone', '"09003286539"'::jsonb, 'contact', 'شماره تلفن اصلی', TRUE),
  ('contact_phone_2', '""'::jsonb, 'contact', 'شماره تلفن دوم', TRUE),
  ('contact_email', '"info@mashuf.com"'::jsonb, 'contact', 'ایمیل', TRUE),
  ('contact_address', '"مازندران، شهرستان قائم شهر، بلوار سید نظام‌الدین، جاده قادیکلای بزرگ، روبروی ولیعصر ۳۶"'::jsonb, 'contact', 'آدرس', TRUE),
  ('contact_map_embed', '""'::jsonb, 'contact', 'کد iframe نقشه', TRUE),
  ('tax_rate_percent', '9'::jsonb, 'financial', 'نرخ مالیات بر ارزش افزوده (%)', FALSE),
  ('global_commission_pct', '5'::jsonb, 'financial', 'کمیسیون پیش‌فرض همکاران (%)', FALSE),
  ('min_payout_amount', '500000'::jsonb, 'financial', 'حداقل مبلغ برداشت کیف پول', FALSE),
  ('announcement_text', '""'::jsonb, 'banner', 'متن بنر اطلاع‌رسانی بالای سایت', TRUE),
  ('is_announcement_active', 'false'::jsonb, 'banner', 'فعال‌سازی بنر اطلاع‌رسانی', TRUE),
  ('announcement_color', '"blue"'::jsonb, 'banner', 'رنگ بنر اطلاع‌رسانی', TRUE),
  ('site_logo_url', '""'::jsonb, 'general', 'آدرس لوگوی اصلی', TRUE),
  ('site_favicon_url', '""'::jsonb, 'general', 'آدرس فاویکون', TRUE),
  ('footer_about', '"گروه صنعتی مشعوف تولیدکننده درب‌های فلزی صنعتی و ضدسرقت"'::jsonb, 'general', 'متن درباره ما در فوتر', TRUE),
  ('social_instagram', '"https://www.instagram.com/mashoufdoor"'::jsonb, 'social', 'لینک اینستاگرام', TRUE),
  ('social_telegram', '"https://t.me/MashufDoor"'::jsonb, 'social', 'لینک تلگرام', TRUE),
  ('social_whatsapp', '"https://wa.me/989003286539"'::jsonb, 'social', 'شماره واتساپ', TRUE),
  ('social_linkedin', '""'::jsonb, 'social', 'لینک لینکدین', TRUE)
ON CONFLICT ("key") DO UPDATE SET
  value = EXCLUDED.value,
  "group" = EXCLUDED."group",
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  updated_at = timezone('utc', now());
