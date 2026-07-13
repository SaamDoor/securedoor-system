-- ═══════════════════════════════════════════════════════════════
--  Admin panel complete schema bootstrap (idempotent)
--  Migration: 018_admin_panel_bootstrap
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Helpers ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT public.get_my_role() IN ('admin', 'super_admin', 'manager');
$$;

CREATE OR REPLACE FUNCTION app_private.panel_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'manager', 'support')
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION app_private.panel_write()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'manager')
      AND is_active = TRUE
  );
$$;

GRANT USAGE ON SCHEMA app_private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.panel_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.panel_write() TO anon, authenticated;

-- ── Shipping & coupons ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(15, 0) NOT NULL DEFAULT 0,
  estimated_days_min INT NOT NULL DEFAULT 1,
  estimated_days_max INT NOT NULL DEFAULT 7,
  min_order_amount NUMERIC(15, 0),
  free_shipping_threshold NUMERIC(15, 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(15, 0),
  max_discount NUMERIC(15, 0),
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  user_id UUID REFERENCES public.users(id),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Orders ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded','on_hold')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded','partial')),
  payment_method TEXT CHECK (payment_method IN ('online','bank_transfer','wallet','cash_on_delivery')),
  shipping_address JSONB NOT NULL DEFAULT '{}'::JSONB,
  billing_address JSONB,
  shipping_method_id UUID REFERENCES public.shipping_methods(id),
  subtotal NUMERIC(15, 0) NOT NULL DEFAULT 0,
  discount NUMERIC(15, 0) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(15, 0) NOT NULL DEFAULT 0,
  tax NUMERIC(15, 0) NOT NULL DEFAULT 0,
  total NUMERIC(15, 0) NOT NULL DEFAULT 0,
  coupon_code VARCHAR(50),
  coupon_discount NUMERIC(15, 0) NOT NULL DEFAULT 0,
  customer_note TEXT,
  admin_note TEXT,
  tracking_code VARCHAR(200),
  shipping_provider VARCHAR(200),
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  files TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(15, 0) NOT NULL,
  total_price NUMERIC(15, 0) NOT NULL,
  discount NUMERIC(15, 0) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  refund_amount NUMERIC(15, 0) NOT NULL DEFAULT 0,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES public.order_returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(15, 0) NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(200),
  gateway VARCHAR(100),
  gateway_ref TEXT,
  gateway_response JSONB,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  file_url TEXT,
  total_amount NUMERIC(15, 0) NOT NULL,
  tax_amount NUMERIC(15, 0) NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ
);

-- ── Reviews ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  images TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Blog & CMS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(400) NOT NULL,
  slug VARCHAR(400) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  reading_time INT,
  view_count INT NOT NULL DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name VARCHAR(200),
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faq_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(400) NOT NULL,
  slug VARCHAR(400) UNIQUE NOT NULL,
  content TEXT,
  layout VARCHAR(100) DEFAULT 'default',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  label VARCHAR(200) NOT NULL,
  url TEXT,
  "order" INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(300),
  subtitle TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'hero' CHECK (position IN ('hero','sidebar','footer','popup')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INT NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  click_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(300),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_replied BOOLEAN NOT NULL DEFAULT FALSE,
  reply TEXT,
  replied_by UUID REFERENCES public.users(id),
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.redirects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INT NOT NULL DEFAULT 301,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Projects ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.construction_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  architecture_description TEXT,
  location TEXT,
  area NUMERIC(10, 2),
  floors SMALLINT,
  units SMALLINT,
  bedrooms SMALLINT,
  price_from BIGINT,
  price_to BIGINT,
  completion_year SMALLINT,
  status TEXT NOT NULL DEFAULT 'for_sale' CHECK (status IN ('for_sale','pre_sale','delivered')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  thumbnail_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::JSONB,
  amenities JSONB NOT NULL DEFAULT '[]'::JSONB,
  specifications JSONB NOT NULL DEFAULT '[]'::JSONB,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  seo_title TEXT,
  seo_description TEXT,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Finance ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance NUMERIC(15, 0) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  pending_balance NUMERIC(15, 0) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  lifetime_earned NUMERIC(15, 0) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'IRR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL CHECK (type IN ('credit','debit','commission','refund','withdrawal','purchase')),
  amount NUMERIC(15, 0) NOT NULL,
  balance_after NUMERIC(15, 0) NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  amount NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  bank_info JSONB,
  admin_note TEXT,
  processed_by UUID REFERENCES public.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_commission_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  commission_percentage NUMERIC(5, 2) NOT NULL CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  is_global_default BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name VARCHAR(150) NOT NULL,
  account_holder VARCHAR(200) NOT NULL,
  account_number VARCHAR(50),
  card_number VARCHAR(16),
  iban VARCHAR(26),
  branch_name VARCHAR(200),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_transfer_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15, 0) NOT NULL,
  receipt_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Support ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  subject VARCHAR(300) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to UUID REFERENCES public.users(id),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bulk_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  contact_name VARCHAR(200) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  company VARCHAR(200),
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','quoted','accepted','rejected','cancelled')),
  quoted_amount NUMERIC(15, 0),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(400) NOT NULL,
  slug VARCHAR(400) UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(100),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms','email','push')),
  subject VARCHAR(300),
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Media, SEO, integrations ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  width INT,
  height INT,
  alt_text TEXT,
  folder VARCHAR(100) DEFAULT 'general',
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug VARCHAR(200) UNIQUE NOT NULL,
  page_label VARCHAR(200) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image TEXT,
  structured_data JSONB,
  robots VARCHAR(100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 3,
  last_triggered_at TIMESTAMPTZ,
  success_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempt INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(200) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'payment',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.builder_tier_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('bronze','silver','gold','platinum')),
  min_orders INT NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  label_fa VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.price_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL DEFAULT 'google_sheet',
  content_hash TEXT NOT NULL,
  row_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.frame_product_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  frame_type TEXT NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  UNIQUE (frame_type, spec_key)
);

-- ── Indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- ── RLS policies ───────────────────────────────────────────────

DO $$
DECLARE
  t TEXT;
BEGIN
  -- Admin-only tables
  FOR t IN SELECT unnest(ARRAY[
    'coupons','coupon_usages','orders','order_items','order_status_history','order_returns',
    'return_items','payments','invoices','wallets','wallet_transactions','payout_requests',
    'affiliate_commission_config','bank_accounts','bank_transfer_receipts','support_tickets',
    'ticket_messages','bulk_quotes','contact_messages','audit_logs','webhook_logs',
    'api_configurations','integrations','webhooks','message_templates'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS panel_admin_all ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY panel_admin_all ON public.%I FOR ALL USING (app_private.panel_admin()) WITH CHECK (app_private.panel_write())',
      t
    );
  END LOOP;

  -- Public read + admin write
  FOR t IN SELECT unnest(ARRAY[
    'shipping_methods','product_reviews','blog_categories','blog_tags','blog_post_tags',
    'blog_comments','faq_categories','faqs','pages','menus','menu_items','banners',
    'redirects','construction_projects','kb_articles','media_library','seo_settings',
    'builder_tier_config','price_snapshots','frame_product_specs'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS panel_public_read ON public.%I', t);
    EXECUTE format('CREATE POLICY panel_public_read ON public.%I FOR SELECT USING (TRUE)', t);
    EXECUTE format('DROP POLICY IF EXISTS panel_admin_write ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY panel_admin_write ON public.%I FOR INSERT WITH CHECK (app_private.panel_write())',
      t
    );
    EXECUTE format(
      'CREATE POLICY panel_admin_update ON public.%I FOR UPDATE USING (app_private.panel_write()) WITH CHECK (app_private.panel_write())',
      t
    );
    EXECUTE format(
      'CREATE POLICY panel_admin_delete ON public.%I FOR DELETE USING (app_private.panel_write())',
      t
    );
  END LOOP;
END;
$$;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS blog_posts_public ON public.blog_posts;
CREATE POLICY blog_posts_public ON public.blog_posts
  FOR SELECT USING (status = 'published' OR app_private.panel_admin());
DROP POLICY IF EXISTS blog_posts_admin_write ON public.blog_posts;
CREATE POLICY blog_posts_admin_write ON public.blog_posts
  FOR ALL USING (app_private.panel_write()) WITH CHECK (app_private.panel_write());

-- ── Seed minimal data ──────────────────────────────────────────

INSERT INTO public.shipping_methods (name, description, price, estimated_days_min, estimated_days_max, is_active, "order")
SELECT * FROM (VALUES
  ('ارسال استاندارد', 'تحویل ۳ تا ۷ روز کاری', 0::NUMERIC, 3, 7, TRUE, 1),
  ('ارسال سریع', 'تحویل ۱ تا ۲ روز کاری', 150000::NUMERIC, 1, 2, TRUE, 2)
) AS v(name, description, price, estimated_days_min, estimated_days_max, is_active, "order")
WHERE NOT EXISTS (SELECT 1 FROM public.shipping_methods LIMIT 1);

INSERT INTO public.blog_categories (name, slug, "order") VALUES
  ('راهنمای خرید', 'buying-guide', 1),
  ('اخبار شرکت', 'company-news', 2),
  ('نکات نصب', 'installation-tips', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_categories (name, slug, "order") VALUES
  ('خرید و سفارش', 'buying', 1),
  ('نصب و گارانتی', 'warranty', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.menus (name, slug) VALUES
  ('منوی اصلی', 'main'),
  ('منوی فوتر', 'footer')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.builder_tier_config (tier, min_orders, discount_percent, label_fa) VALUES
  ('bronze', 0, 5, 'برنز'),
  ('silver', 10, 10, 'نقره'),
  ('gold', 25, 15, 'طلایی'),
  ('platinum', 50, 20, 'پلاتین')
ON CONFLICT (tier) DO NOTHING;

INSERT INTO public.seo_settings (page_slug, page_label) VALUES
  ('home', 'صفحه اصلی'),
  ('products', 'محصولات'),
  ('about', 'درباره ما'),
  ('contact', 'تماس با ما')
ON CONFLICT (page_slug) DO NOTHING;
