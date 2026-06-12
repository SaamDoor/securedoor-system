-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Complete Database Schema
--  Migration: 001_initial_schema
--  Created: 2025
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'manager', 'support', 'customer'
);

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'refunded', 'on_hold'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded', 'partial'
);

CREATE TYPE payment_method AS ENUM (
  'online', 'card_to_card', 'bank_transfer', 'cash_on_delivery', 'installment'
);

CREATE TYPE stock_status AS ENUM (
  'in_stock', 'out_of_stock', 'pre_order', 'discontinued'
);

CREATE TYPE blog_status AS ENUM (
  'draft', 'published', 'archived'
);

CREATE TYPE banner_position AS ENUM (
  'hero', 'homepage_middle', 'category_top', 'sidebar',
  'product_page', 'checkout'
);

CREATE TYPE notification_type AS ENUM (
  'order', 'payment', 'message', 'system', 'promotion', 'review'
);

CREATE TYPE webhook_event AS ENUM (
  'order_created', 'order_updated', 'order_cancelled',
  'payment_success', 'payment_failed', 'user_registered',
  'product_created', 'product_updated', 'inventory_changed', 'review_submitted'
);

CREATE TYPE integration_category AS ENUM (
  'payment', 'sms', 'marketplace', 'shipping', 'analytics', 'crm', 'custom'
);

CREATE TYPE message_type AS ENUM (
  'text', 'image', 'file', 'system'
);

CREATE TYPE attribute_type AS ENUM (
  'text', 'number', 'boolean', 'color', 'select'
);

CREATE TYPE coupon_type AS ENUM (
  'percentage', 'fixed'
);

-- ─────────────────────────────────────────────
--  USERS & AUTH
-- ─────────────────────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  avatar        TEXT,
  bio           TEXT,
  birth_date    DATE,
  national_id   VARCHAR(10),
  company       VARCHAR(200),
  website       VARCHAR(255),
  role          user_role NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  device_info   TEXT,
  ip_address    INET,
  user_agent    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        user_role UNIQUE NOT NULL,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(200) NOT NULL,
  resource    VARCHAR(100) NOT NULL,
  action      VARCHAR(50) NOT NULL,
  description TEXT,
  UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE password_resets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verification_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  type       VARCHAR(50) NOT NULL DEFAULT 'email',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PRODUCT CATEGORIES
-- ─────────────────────────────────────────────

CREATE TABLE product_categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id        UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name             VARCHAR(200) NOT NULL,
  slug             VARCHAR(200) UNIQUE NOT NULL,
  description      TEXT,
  image_url        TEXT,
  banner_url       TEXT,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  meta_keywords    TEXT[],
  "order"          INT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PRODUCT ATTRIBUTES
-- ─────────────────────────────────────────────

CREATE TABLE product_attributes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(200) NOT NULL,
  slug       VARCHAR(200) UNIQUE NOT NULL,
  type       attribute_type NOT NULL DEFAULT 'text',
  unit       VARCHAR(50),
  options    TEXT[],
  "order"    INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PRODUCTS
-- ─────────────────────────────────────────────

CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku               VARCHAR(100) UNIQUE NOT NULL,
  name              VARCHAR(300) NOT NULL,
  slug              VARCHAR(300) UNIQUE NOT NULL,
  short_description TEXT,
  description       TEXT NOT NULL,
  price             NUMERIC(15, 0) NOT NULL DEFAULT 0,
  compare_price     NUMERIC(15, 0),
  cost_price        NUMERIC(15, 0),
  category_id       UUID NOT NULL REFERENCES product_categories(id),
  tags              TEXT[],
  stock             INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  stock_status      stock_status NOT NULL DEFAULT 'in_stock',
  weight            NUMERIC(8, 3),
  width             NUMERIC(8, 2),
  height            NUMERIC(8, 2),
  depth             NUMERIC(8, 2),
  dimension_unit    VARCHAR(10) DEFAULT 'cm',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  is_new            BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title        VARCHAR(255),
  meta_description  TEXT,
  meta_keywords     TEXT[],
  view_count        INT NOT NULL DEFAULT 0,
  review_count      INT NOT NULL DEFAULT 0,
  average_rating    NUMERIC(3, 2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         VARCHAR(255),
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  "order"     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_attribute_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value        TEXT NOT NULL,
  UNIQUE(product_id, attribute_id)
);

CREATE TABLE product_specifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      VARCHAR(200) NOT NULL,
  value      TEXT NOT NULL,
  unit       VARCHAR(50),
  "group"    VARCHAR(100),
  "order"    INT NOT NULL DEFAULT 0
);

CREATE TABLE product_downloads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  file_url    TEXT NOT NULL,
  file_size   BIGINT,
  file_type   VARCHAR(100),
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    UUID,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255),
  content     TEXT NOT NULL,
  images      TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id, order_id)
);

-- ─────────────────────────────────────────────
--  INVENTORY
-- ─────────────────────────────────────────────

CREATE TABLE inventory_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL,
  type        VARCHAR(50) NOT NULL, -- 'restock', 'sale', 'return', 'adjustment'
  note        TEXT,
  performed_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  ADDRESSES
-- ─────────────────────────────────────────────

CREATE TABLE addresses (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label          VARCHAR(100) NOT NULL DEFAULT 'خانه',
  recipient_name VARCHAR(200) NOT NULL,
  phone          VARCHAR(20) NOT NULL,
  province       VARCHAR(100) NOT NULL,
  city           VARCHAR(100) NOT NULL,
  district       VARCHAR(100),
  street         TEXT NOT NULL,
  postal_code    VARCHAR(20) NOT NULL,
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  SHIPPING
-- ─────────────────────────────────────────────

CREATE TABLE shipping_methods (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     VARCHAR(200) NOT NULL,
  description              TEXT,
  price                    NUMERIC(15, 0) NOT NULL DEFAULT 0,
  estimated_days_min       INT NOT NULL DEFAULT 1,
  estimated_days_max       INT NOT NULL DEFAULT 7,
  min_order_amount         NUMERIC(15, 0),
  free_shipping_threshold  NUMERIC(15, 0),
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  "order"                  INT NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  COUPONS
-- ─────────────────────────────────────────────

CREATE TABLE coupons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code             VARCHAR(50) UNIQUE NOT NULL,
  type             coupon_type NOT NULL DEFAULT 'percentage',
  value            NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(15, 0),
  max_discount     NUMERIC(15, 0),
  usage_limit      INT,
  usage_count      INT NOT NULL DEFAULT 0,
  user_id          UUID REFERENCES users(id),
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coupon_usages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id  UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id   UUID,
  used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  ORDERS
-- ─────────────────────────────────────────────

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      VARCHAR(50) UNIQUE NOT NULL,
  user_id           UUID NOT NULL REFERENCES users(id),
  status            order_status NOT NULL DEFAULT 'pending',
  payment_status    payment_status NOT NULL DEFAULT 'pending',
  payment_method    payment_method,
  shipping_address  JSONB NOT NULL,
  billing_address   JSONB,
  shipping_method_id UUID REFERENCES shipping_methods(id),
  subtotal          NUMERIC(15, 0) NOT NULL DEFAULT 0,
  discount          NUMERIC(15, 0) NOT NULL DEFAULT 0,
  shipping_cost     NUMERIC(15, 0) NOT NULL DEFAULT 0,
  tax               NUMERIC(15, 0) NOT NULL DEFAULT 0,
  total             NUMERIC(15, 0) NOT NULL DEFAULT 0,
  coupon_code       VARCHAR(50),
  coupon_discount   NUMERIC(15, 0) NOT NULL DEFAULT 0,
  customer_note     TEXT,
  admin_note        TEXT,
  tracking_code     VARCHAR(200),
  shipping_provider VARCHAR(200),
  estimated_delivery TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  files             TEXT[],
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  product_snapshot JSONB NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  NUMERIC(15, 0) NOT NULL,
  total_price NUMERIC(15, 0) NOT NULL,
  discount    NUMERIC(15, 0) NOT NULL DEFAULT 0
);

CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  note        TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PAYMENTS
-- ─────────────────────────────────────────────

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount          NUMERIC(15, 0) NOT NULL,
  method          payment_method NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  transaction_id  VARCHAR(200),
  gateway         VARCHAR(100),
  gateway_ref     TEXT,
  gateway_response JSONB,
  paid_at         TIMESTAMPTZ,
  failure_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  file_url       TEXT,
  total_amount   NUMERIC(15, 0) NOT NULL,
  tax_amount     NUMERIC(15, 0) NOT NULL DEFAULT 0,
  issued_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date       TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
--  FAVORITES / WISHLIST
-- ─────────────────────────────────────────────

CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, product_id)
);

-- ─────────────────────────────────────────────
--  MESSAGING & CHAT
-- ─────────────────────────────────────────────

CREATE TABLE chat_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id   UUID REFERENCES users(id),
  status     VARCHAR(20) NOT NULL DEFAULT 'open',
  subject    VARCHAR(300),
  unread_count INT NOT NULL DEFAULT 0,
  closed_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES users(id),
  sender_type  VARCHAR(20) NOT NULL DEFAULT 'user',
  content      TEXT,
  type         message_type NOT NULL DEFAULT 'text',
  file_url     TEXT,
  file_name    VARCHAR(255),
  file_size    BIGINT,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  NOTIFICATIONS
-- ─────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  body        TEXT NOT NULL,
  type        notification_type NOT NULL DEFAULT 'system',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  action_url  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  DOWNLOADS
-- ─────────────────────────────────────────────

CREATE TABLE user_downloads (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_download_id UUID REFERENCES product_downloads(id),
  file_name          VARCHAR(255) NOT NULL,
  file_url           TEXT NOT NULL,
  file_size          BIGINT,
  file_type          VARCHAR(100),
  download_count     INT NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  BLOG / CMS
-- ─────────────────────────────────────────────

CREATE TABLE blog_categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(200) NOT NULL,
  slug             VARCHAR(200) UNIQUE NOT NULL,
  description      TEXT,
  image_url        TEXT,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  post_count       INT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) UNIQUE NOT NULL,
  post_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(400) NOT NULL,
  slug             VARCHAR(400) UNIQUE NOT NULL,
  excerpt          TEXT,
  content          TEXT NOT NULL,
  cover_image      TEXT,
  category_id      UUID NOT NULL REFERENCES blog_categories(id),
  author_id        UUID NOT NULL REFERENCES users(id),
  status           blog_status NOT NULL DEFAULT 'draft',
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  reading_time     INT,
  view_count       INT NOT NULL DEFAULT 0,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  meta_keywords    TEXT[],
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY(post_id, tag_id)
);

-- ─────────────────────────────────────────────
--  FAQs
-- ─────────────────────────────────────────────

CREATE TABLE faq_categories (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      VARCHAR(200) NOT NULL,
  slug      VARCHAR(200) UNIQUE NOT NULL,
  "order"   INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE faqs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES faq_categories(id),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  "order"     INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  BANNERS
-- ─────────────────────────────────────────────

CREATE TABLE banners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(300),
  subtitle        TEXT,
  image_url       TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url        TEXT,
  position        banner_position NOT NULL DEFAULT 'hero',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  "order"         INT NOT NULL DEFAULT 0,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  click_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  MENUS
-- ─────────────────────────────────────────────

CREATE TABLE menus (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(200) NOT NULL,
  slug       VARCHAR(200) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE menu_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id     UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  label       VARCHAR(200) NOT NULL,
  url         TEXT NOT NULL,
  icon        VARCHAR(100),
  is_external BOOLEAN NOT NULL DEFAULT FALSE,
  target      VARCHAR(20) DEFAULT '_self',
  "order"     INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─────────────────────────────────────────────
--  PAGES (CMS)
-- ─────────────────────────────────────────────

CREATE TABLE pages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(400) NOT NULL,
  slug             VARCHAR(400) UNIQUE NOT NULL,
  content          TEXT,
  layout           VARCHAR(100) DEFAULT 'default',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  meta_keywords    TEXT[],
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  TESTIMONIALS
-- ─────────────────────────────────────────────

CREATE TABLE testimonials (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(200) NOT NULL,
  role       VARCHAR(200),
  company    VARCHAR(200),
  avatar     TEXT,
  content    TEXT NOT NULL,
  rating     SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  "order"    INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  CERTIFICATES
-- ─────────────────────────────────────────────

CREATE TABLE certificates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(300) NOT NULL,
  issuer      VARCHAR(300) NOT NULL,
  image_url   TEXT NOT NULL,
  valid_until DATE,
  "order"     INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  BRANDS
-- ─────────────────────────────────────────────

CREATE TABLE brands (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(200) NOT NULL,
  logo_url   TEXT NOT NULL,
  website    TEXT,
  "order"    INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  SETTINGS
-- ─────────────────────────────────────────────

CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "key"       VARCHAR(200) UNIQUE NOT NULL,
  value       JSONB NOT NULL,
  "group"       VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES users(id)
);

-- ─────────────────────────────────────────────
--  INTEGRATIONS
-- ─────────────────────────────────────────────

CREATE TABLE integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(200) UNIQUE NOT NULL,
  provider      VARCHAR(100) NOT NULL,
  category      integration_category NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,
  is_configured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_configurations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  base_url        TEXT NOT NULL,
  token           TEXT,
  secret_key      TEXT,
  merchant_id     VARCHAR(200),
  extra_headers   JSONB DEFAULT '{}',
  extra_params    JSONB DEFAULT '{}',
  sandbox_mode    BOOLEAN NOT NULL DEFAULT TRUE,
  is_active       BOOLEAN NOT NULL DEFAULT FALSE,
  last_tested_at  TIMESTAMPTZ,
  test_result     VARCHAR(20),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  WEBHOOKS
-- ─────────────────────────────────────────────

CREATE TABLE webhooks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(200) NOT NULL,
  url              TEXT NOT NULL,
  secret           TEXT,
  events           webhook_event[] NOT NULL DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  retry_count      INT NOT NULL DEFAULT 0,
  max_retries      INT NOT NULL DEFAULT 3,
  last_triggered_at TIMESTAMPTZ,
  success_count    INT NOT NULL DEFAULT 0,
  failure_count    INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id      UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event           webhook_event NOT NULL,
  payload         JSONB NOT NULL,
  response_status INT,
  response_body   TEXT,
  duration_ms     INT,
  success         BOOLEAN NOT NULL DEFAULT FALSE,
  attempt         INT NOT NULL DEFAULT 1,
  next_retry_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  AUDIT LOGS
-- ─────────────────────────────────────────────

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(200) NOT NULL,
  resource    VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  CONTACT MESSAGES
-- ─────────────────────────────────────────────

CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(200) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  subject    VARCHAR(300),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  is_replied BOOLEAN NOT NULL DEFAULT FALSE,
  reply      TEXT,
  replied_by UUID REFERENCES users(id),
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
