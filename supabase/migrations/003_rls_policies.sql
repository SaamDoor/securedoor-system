-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Row Level Security Policies
--  Migration: 003_rls_policies
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;

-- Public tables (no RLS needed — read-only data)
-- products, product_categories, product_images, etc. are public

-- ─────────────────────────────────────────────
--  HELPER FUNCTION — Get current user ID from JWT
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', TRUE)::JSONB->>'sub', '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', TRUE)::JSONB->>'role', '');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('super_admin', 'admin', 'manager');
$$ LANGUAGE SQL STABLE;

-- ─────────────────────────────────────────────
--  POLICIES — USERS
-- ─────────────────────────────────────────────

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth_user_id() OR is_admin());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth_user_id())
  WITH CHECK (id = auth_user_id());

CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────
--  POLICIES — SESSIONS
-- ─────────────────────────────────────────────

CREATE POLICY "sessions_own" ON user_sessions
  FOR ALL USING (user_id = auth_user_id() OR is_admin());

-- ─────────────────────────────────────────────
--  POLICIES — ADDRESSES
-- ─────────────────────────────────────────────

CREATE POLICY "addresses_own" ON addresses
  FOR ALL USING (user_id = auth_user_id() OR is_admin())
  WITH CHECK (user_id = auth_user_id());

-- ─────────────────────────────────────────────
--  POLICIES — ORDERS
-- ─────────────────────────────────────────────

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (user_id = auth_user_id() OR is_admin());

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (user_id = auth_user_id());

CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE USING (is_admin());

CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND (user_id = auth_user_id() OR is_admin()))
  );

CREATE POLICY "order_status_select_own" ON order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_status_history.order_id AND (user_id = auth_user_id() OR is_admin()))
  );

-- ─────────────────────────────────────────────
--  POLICIES — PAYMENTS & INVOICES
-- ─────────────────────────────────────────────

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND (user_id = auth_user_id() OR is_admin()))
  );

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = invoices.order_id AND (user_id = auth_user_id() OR is_admin()))
  );

-- ─────────────────────────────────────────────
--  POLICIES — FAVORITES
-- ─────────────────────────────────────────────

CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (user_id = auth_user_id() OR is_admin())
  WITH CHECK (user_id = auth_user_id());

-- ─────────────────────────────────────────────
--  POLICIES — NOTIFICATIONS
-- ─────────────────────────────────────────────

CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth_user_id() OR is_admin());

-- ─────────────────────────────────────────────
--  POLICIES — CHAT
-- ─────────────────────────────────────────────

CREATE POLICY "chat_sessions_own" ON chat_sessions
  FOR ALL USING (
    user_id = auth_user_id()
    OR agent_id = auth_user_id()
    OR is_admin()
  );

CREATE POLICY "chat_messages_session_members" ON chat_messages
  FOR ALL USING (
    sender_id = auth_user_id()
    OR EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = chat_messages.session_id
        AND (cs.user_id = auth_user_id() OR cs.agent_id = auth_user_id() OR is_admin())
    )
  );

-- ─────────────────────────────────────────────
--  POLICIES — REVIEWS
-- ─────────────────────────────────────────────

CREATE POLICY "reviews_select_approved" ON product_reviews
  FOR SELECT USING (is_approved = TRUE OR user_id = auth_user_id() OR is_admin());

CREATE POLICY "reviews_insert_own" ON product_reviews
  FOR INSERT WITH CHECK (user_id = auth_user_id());

CREATE POLICY "reviews_update_own" ON product_reviews
  FOR UPDATE USING (user_id = auth_user_id() OR is_admin());

CREATE POLICY "reviews_delete_admin" ON product_reviews
  FOR DELETE USING (is_admin());

-- ─────────────────────────────────────────────
--  POLICIES — DOWNLOADS
-- ─────────────────────────────────────────────

CREATE POLICY "downloads_own" ON user_downloads
  FOR ALL USING (user_id = auth_user_id() OR is_admin());

-- ─────────────────────────────────────────────
--  STORAGE POLICIES (via SQL)
-- ─────────────────────────────────────────────

-- Avatars bucket: users can upload/view their own
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', TRUE),
  ('products', 'products', TRUE),
  ('blog', 'blog', TRUE),
  ('banners', 'banners', TRUE),
  ('brands', 'brands', TRUE),
  ('cms', 'cms', TRUE),
  ('downloads', 'downloads', FALSE),
  ('invoices', 'invoices', FALSE),
  ('order-files', 'order-files', FALSE),
  ('chat', 'chat', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Public read for public buckets (products, blog, banners, etc.)
CREATE POLICY "public_read_products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "public_read_blog" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "public_read_banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "public_read_brands" ON storage.objects
  FOR SELECT USING (bucket_id = 'brands');

CREATE POLICY "public_read_cms" ON storage.objects
  FOR SELECT USING (bucket_id = 'cms');

CREATE POLICY "public_read_avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Admins can upload to public buckets
CREATE POLICY "admin_upload_products" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND is_admin());

CREATE POLICY "admin_upload_blog" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog' AND is_admin());

CREATE POLICY "admin_upload_banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banners' AND is_admin());

CREATE POLICY "admin_upload_cms" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cms' AND is_admin());

-- Users can upload their own avatar
CREATE POLICY "user_upload_avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth_user_id()::TEXT
  );

-- Users can read their own private files
CREATE POLICY "user_read_invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth_user_id()::TEXT
    OR is_admin()
  );

CREATE POLICY "user_read_order_files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'order-files'
    AND (storage.foldername(name))[1] = auth_user_id()::TEXT
    OR is_admin()
  );
