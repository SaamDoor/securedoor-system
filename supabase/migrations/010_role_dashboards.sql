-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Role Dashboard Infrastructure
--  Migration: 010_role_dashboards
--  Adds: Wallets, Affiliate Commissions, Payout Requests,
--        Builder Tier Config, Bulk Quotes, Support Tickets,
--        SEO Settings, Media Library, Settings Seed
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
--  NEW ENUMS
-- ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE wallet_tx_type AS ENUM (
    'credit', 'debit', 'commission', 'refund', 'withdrawal', 'purchase'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE builder_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM (
    'submitted', 'reviewing', 'quoted', 'accepted', 'rejected', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
--  EXTEND users TABLE
--  Add columns for tier assignment, referral code, commission override
-- ─────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS builder_tier            builder_tier,
  ADD COLUMN IF NOT EXISTS referral_code           VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by             UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS special_commission_pct  NUMERIC(5, 2);

-- ─────────────────────────────────────────────
--  WALLETS
--  One per user; customers see credits, managers see commission earnings
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallets (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance          NUMERIC(15, 0) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  pending_balance  NUMERIC(15, 0) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  lifetime_earned  NUMERIC(15, 0) NOT NULL DEFAULT 0,
  currency         VARCHAR(3)  NOT NULL DEFAULT 'IRR',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id      UUID           NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id        UUID           NOT NULL REFERENCES users(id),
  type           wallet_tx_type NOT NULL,
  amount         NUMERIC(15, 0) NOT NULL,
  balance_after  NUMERIC(15, 0) NOT NULL,
  reference_id   UUID,
  reference_type VARCHAR(50),   -- 'order' | 'commission' | 'payout' | 'refund'
  description    TEXT,
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  AFFILIATE COMMISSION CONFIG
--  Global default (user_id IS NULL) + per-manager override
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_commission_config (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  commission_percentage NUMERIC(5, 2) NOT NULL
    CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  is_global_default     BOOLEAN NOT NULL DEFAULT FALSE,
  note                  TEXT,
  updated_by            UUID REFERENCES users(id),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one global default row allowed
CREATE UNIQUE INDEX IF NOT EXISTS uidx_one_global_commission
  ON affiliate_commission_config (is_global_default)
  WHERE is_global_default = TRUE;

-- Seed global default at 5 %
INSERT INTO affiliate_commission_config (user_id, commission_percentage, is_global_default)
VALUES (NULL, 5.00, TRUE)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id             UUID           NOT NULL REFERENCES users(id),
  referred_user_id        UUID REFERENCES users(id),
  order_id                UUID REFERENCES orders(id),
  referral_code           VARCHAR(50)    NOT NULL,
  -- Snapshot the percentage at time of sale so future rate changes don't alter history
  commission_pct_snapshot NUMERIC(5, 2)  NOT NULL,
  commission_amount       NUMERIC(15, 0),
  status                  payout_status  NOT NULL DEFAULT 'pending',
  approved_by             UUID REFERENCES users(id),
  approved_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PAYOUT REQUESTS  (manager → IBAN or wallet credit)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payout_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID           NOT NULL REFERENCES users(id),
  wallet_id       UUID           NOT NULL REFERENCES wallets(id),
  amount          NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
  method          VARCHAR(20)    NOT NULL DEFAULT 'iban'
    CHECK (method IN ('iban', 'wallet_credit', 'card')),
  iban            VARCHAR(34),
  bank_name       VARCHAR(200),
  account_holder  VARCHAR(200),
  status          payout_status  NOT NULL DEFAULT 'pending',
  user_note       TEXT,
  admin_note      TEXT,
  receipt_url     TEXT,
  requested_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES users(id)
);

-- ─────────────────────────────────────────────
--  BUILDER DISCOUNT TIER CONFIG  (Bronze / Silver / Gold / Platinum)
--  Super Admin configures; support-role users are assigned a tier
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builder_tier_config (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier                 builder_tier UNIQUE NOT NULL,
  label                VARCHAR(100)   NOT NULL,
  discount_percentage  NUMERIC(5, 2)  NOT NULL CHECK (discount_percentage >= 0),
  min_order_volume     NUMERIC(15, 0) NOT NULL DEFAULT 0,
  benefits             JSONB          NOT NULL DEFAULT '[]',
  is_active            BOOLEAN        NOT NULL DEFAULT TRUE,
  updated_by           UUID REFERENCES users(id),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

INSERT INTO builder_tier_config (tier, label, discount_percentage, min_order_volume, benefits) VALUES
  ('bronze',   'برنز',       5.00,  0,          '["اولویت پشتیبانی","تخفیف ۵٪"]'),
  ('silver',   'نقره‌ای',   10.00,  500000000,  '["پشتیبانی ویژه","تخفیف ۱۰٪","مشاور اختصاصی"]'),
  ('gold',     'طلایی',     15.00,  2000000000, '["پشتیبانی ۲۴ساعته","تخفیف ۱۵٪","مشاور اختصاصی","اولویت پیش‌فاکتور"]'),
  ('platinum', 'پلاتینیوم', 20.00,  5000000000, '["پشتیبانی VIP","تخفیف ۲۰٪","مدیر اکانت","قیمت‌گذاری سفارشی"]')
ON CONFLICT (tier) DO NOTHING;

-- ─────────────────────────────────────────────
--  BULK QUOTES  (support / VIP role)
-- ─────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS quote_seq START 1;

CREATE TABLE IF NOT EXISTS bulk_quotes (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number       VARCHAR(30) UNIQUE NOT NULL
    DEFAULT 'Q-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad((nextval('quote_seq'))::TEXT, 4, '0'),
  user_id            UUID         NOT NULL REFERENCES users(id),
  title              VARCHAR(300) NOT NULL,
  description        TEXT,
  estimated_qty      INT,
  door_specs         JSONB,   -- { material, dimensions[], finish, color }
  attachments        TEXT[],  -- Supabase Storage public URLs
  status             quote_status NOT NULL DEFAULT 'submitted',
  quoted_amount      NUMERIC(15, 0),
  valid_until        TIMESTAMPTZ,
  admin_note         TEXT,
  assigned_to        UUID REFERENCES users(id),
  converted_order_id UUID REFERENCES orders(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  SUPPORT TICKETS
-- ─────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;

CREATE TABLE IF NOT EXISTS support_tickets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL
    DEFAULT 'TKT-' || lpad((nextval('ticket_seq'))::TEXT, 6, '0'),
  user_id       UUID            NOT NULL REFERENCES users(id),
  order_id      UUID REFERENCES orders(id),
  subject       VARCHAR(300)    NOT NULL,
  status        ticket_status   NOT NULL DEFAULT 'open',
  priority      ticket_priority NOT NULL DEFAULT 'normal',
  is_vip        BOOLEAN         NOT NULL DEFAULT FALSE,
  assigned_to   UUID REFERENCES users(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID    NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id   UUID    NOT NULL REFERENCES users(id),
  message     TEXT    NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,  -- internal staff note, hidden from customer
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  SEO SETTINGS  (per-page, managed by super_admin)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seo_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug        VARCHAR(300) UNIQUE NOT NULL,
  page_label       VARCHAR(200),
  meta_title       VARCHAR(255),
  meta_description TEXT,
  meta_keywords    TEXT[],
  og_image_url     TEXT,
  canonical_url    TEXT,
  noindex          BOOLEAN NOT NULL DEFAULT FALSE,
  structured_data  JSONB,
  updated_by       UUID REFERENCES users(id),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO seo_settings (page_slug, page_label) VALUES
  ('home',         'صفحه اصلی'),
  ('products',     'محصولات'),
  ('about',        'درباره ما'),
  ('contact',      'تماس با ما'),
  ('blog',         'وبلاگ'),
  ('projects',     'پروژه‌ها'),
  ('frame-price',  'لیست قیمت چهارچوب')
ON CONFLICT (page_slug) DO NOTHING;

-- ─────────────────────────────────────────────
--  MEDIA LIBRARY  (Supabase Storage reference table)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media_library (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name     VARCHAR(255) NOT NULL,
  storage_path  TEXT         NOT NULL UNIQUE,
  public_url    TEXT         NOT NULL,
  file_type     VARCHAR(20)  NOT NULL DEFAULT 'image'
    CHECK (file_type IN ('image', 'pdf', 'document', 'video', 'other')),
  mime_type     VARCHAR(100),
  file_size     BIGINT,
  width         INT,
  height        INT,
  alt_text      VARCHAR(300),
  folder        VARCHAR(100) NOT NULL DEFAULT 'general',
  tags          TEXT[],
  uploaded_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  GLOBAL SETTINGS SEED  (extends existing `settings` table)
-- ─────────────────────────────────────────────

INSERT INTO settings ("key", value, "group", description, is_public) VALUES
  ('hero_title',            '"به گروه صنعتی مشعوف خوش آمدید"',        'hero',      'تیتر اصلی صفحه اول',                   TRUE),
  ('hero_subtitle',         '"تولیدکننده درب‌های فلزی صنعتی و ضدسرقت"','hero',      'زیرتیتر صفحه اول',                     TRUE),
  ('hero_cta_text',         '"مشاهده محصولات"',                         'hero',      'متن دکمه اقدام صفحه اول',              TRUE),
  ('hero_cta_url',          '"/products"',                              'hero',      'لینک دکمه اقدام',                      TRUE),
  ('hero_image_url',        '""',                                       'hero',      'تصویر پس‌زمینه هیرو',                  TRUE),
  ('contact_phone',         '"021-12345678"',                           'contact',   'شماره تلفن اصلی',                      TRUE),
  ('contact_phone_2',       '""',                                       'contact',   'شماره تلفن دوم',                       TRUE),
  ('contact_email',         '"info@mashuf.com"',                        'contact',   'ایمیل',                                TRUE),
  ('contact_address',       '"تهران، خیابان ..."',                      'contact',   'آدرس',                                 TRUE),
  ('contact_map_embed',     '""',                                       'contact',   'کد iframe نقشه گوگل',                  TRUE),
  ('working_hours',         '"شنبه تا چهارشنبه: ۸ تا ۱۷"',             'contact',   'ساعات کاری',                           TRUE),
  ('tax_rate_percent',      '9',                                        'financial', 'نرخ مالیات بر ارزش افزوده (%)',        FALSE),
  ('global_commission_pct', '5',                                        'financial', 'کمیسیون پیش‌فرض همکاران (%)',          FALSE),
  ('min_payout_amount',     '500000',                                   'financial', 'حداقل مبلغ برداشت کیف پول',           FALSE),
  ('announcement_text',     '""',                                       'banner',    'متن بنر اطلاع‌رسانی بالای سایت',      TRUE),
  ('is_announcement_active','false',                                    'banner',    'فعال‌سازی بنر اطلاع‌رسانی',           TRUE),
  ('announcement_color',    '"blue"',                                   'banner',    'رنگ بنر اطلاع‌رسانی',                 TRUE),
  ('site_name',             '"گروه صنعتی مشعوف"',                      'general',   'نام سایت',                             TRUE),
  ('site_logo_url',         '""',                                       'general',   'آدرس لوگوی اصلی',                     TRUE),
  ('site_favicon_url',      '""',                                       'general',   'آدرس فاویکون',                         TRUE),
  ('footer_about',          '"گروه صنعتی مشعوف تولیدکننده درب‌های فلزی صنعتی"', 'general', 'متن درباره ما در فوتر', TRUE),
  ('social_instagram',      '""',                                       'social',    'لینک اینستاگرام',                      TRUE),
  ('social_telegram',       '""',                                       'social',    'لینک تلگرام',                          TRUE),
  ('social_whatsapp',       '""',                                       'social',    'شماره واتساپ',                         TRUE),
  ('social_linkedin',       '""',                                       'social',    'لینک لینکدین',                         TRUE)
ON CONFLICT ("key") DO NOTHING;

-- ─────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE wallets                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commission_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_tier_config        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_quotes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library              ENABLE ROW LEVEL SECURITY;

-- Wallets: owner sees own; admin/super_admin see all
CREATE POLICY "wallets_select" ON wallets FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "wallets_admin_update" ON wallets FOR UPDATE
  USING (get_my_role() IN ('admin', 'super_admin'));

-- Wallet transactions
CREATE POLICY "wallet_tx_select" ON wallet_transactions FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "wallet_tx_insert" ON wallet_transactions FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- Commission config: managers see their own override + the global default; super_admin manages all
CREATE POLICY "commission_select" ON affiliate_commission_config FOR SELECT
  USING (user_id = auth.uid() OR is_global_default = TRUE OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "commission_manage" ON affiliate_commission_config FOR ALL
  USING (get_my_role() = 'super_admin');

-- Affiliate referrals
CREATE POLICY "referrals_select" ON affiliate_referrals FOR SELECT
  USING (referrer_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "referrals_admin_manage" ON affiliate_referrals FOR ALL
  USING (get_my_role() IN ('admin', 'super_admin'));

-- Payout requests
CREATE POLICY "payouts_select" ON payout_requests FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "payouts_insert" ON payout_requests FOR INSERT
  WITH CHECK (user_id = auth.uid() AND get_my_role() = 'manager');

CREATE POLICY "payouts_admin_update" ON payout_requests FOR UPDATE
  USING (get_my_role() IN ('admin', 'super_admin'));

-- Builder tier config: public read, super_admin writes
CREATE POLICY "tier_config_read" ON builder_tier_config FOR SELECT USING (TRUE);
CREATE POLICY "tier_config_manage" ON builder_tier_config FOR ALL
  USING (get_my_role() = 'super_admin');

-- Bulk quotes: owner + admin
CREATE POLICY "quotes_select" ON bulk_quotes FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "quotes_insert" ON bulk_quotes FOR INSERT
  WITH CHECK (user_id = auth.uid() AND get_my_role() = 'support');

CREATE POLICY "quotes_admin_update" ON bulk_quotes FOR UPDATE
  USING (get_my_role() IN ('admin', 'super_admin'));

-- Support tickets
CREATE POLICY "tickets_select" ON support_tickets FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('support', 'admin', 'super_admin'));

CREATE POLICY "tickets_insert" ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_staff_update" ON support_tickets FOR UPDATE
  USING (get_my_role() IN ('support', 'admin', 'super_admin'));

-- Ticket messages
CREATE POLICY "ticket_msg_select" ON ticket_messages FOR SELECT
  USING (
    get_my_role() IN ('support', 'admin', 'super_admin')
    OR sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "ticket_msg_insert" ON ticket_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      get_my_role() IN ('support', 'admin', 'super_admin')
      OR EXISTS (
        SELECT 1 FROM support_tickets t
        WHERE t.id = ticket_id AND t.user_id = auth.uid()
      )
    )
  );

-- SEO: public read, super_admin writes
CREATE POLICY "seo_read" ON seo_settings FOR SELECT USING (TRUE);
CREATE POLICY "seo_manage" ON seo_settings FOR ALL
  USING (get_my_role() = 'super_admin');

-- Media library: authenticated read; admin+ write
CREATE POLICY "media_read" ON media_library FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "media_manage" ON media_library FOR ALL
  USING (get_my_role() IN ('admin', 'super_admin'));

-- ─────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet   ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user     ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_ref      ON wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type     ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON affiliate_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_order    ON affiliate_referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code     ON affiliate_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_payout_user        ON payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_status      ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_user        ON bulk_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status      ON bulk_quotes(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user       ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status     ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned   ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_msg_ticket  ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_media_folder       ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_type         ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_users_tier         ON users(builder_tier) WHERE builder_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_referral     ON users(referral_code) WHERE referral_code IS NOT NULL;

-- ─────────────────────────────────────────────
--  DATABASE FUNCTIONS
-- ─────────────────────────────────────────────

-- Auto-create a wallet for every new user
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_wallet ON users;
CREATE TRIGGER trg_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Backfill wallets for users that existed before this migration
INSERT INTO wallets (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Returns the effective commission % for a manager:
-- individual override if set, otherwise global default
CREATE OR REPLACE FUNCTION get_manager_commission(p_user_id UUID)
RETURNS NUMERIC LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT commission_percentage FROM affiliate_commission_config WHERE user_id = p_user_id),
    (SELECT commission_percentage FROM affiliate_commission_config WHERE is_global_default = TRUE)
  );
$$;

-- Shared updated_at trigger function (reuse existing if present)
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_wallets_updated      ON wallets;
DROP TRIGGER IF EXISTS trg_quotes_updated       ON bulk_quotes;
DROP TRIGGER IF EXISTS trg_tickets_updated      ON support_tickets;
DROP TRIGGER IF EXISTS trg_tier_config_updated  ON builder_tier_config;
DROP TRIGGER IF EXISTS trg_seo_updated          ON seo_settings;
DROP TRIGGER IF EXISTS trg_commission_updated   ON affiliate_commission_config;

CREATE TRIGGER trg_wallets_updated      BEFORE UPDATE ON wallets                    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_quotes_updated       BEFORE UPDATE ON bulk_quotes                FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_tickets_updated      BEFORE UPDATE ON support_tickets            FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_tier_config_updated  BEFORE UPDATE ON builder_tier_config        FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_seo_updated          BEFORE UPDATE ON seo_settings               FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_commission_updated   BEFORE UPDATE ON affiliate_commission_config FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
