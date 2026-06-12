-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Indexes, Triggers & Functions
--  Migration: 002_indexes_and_triggers
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
--  INDEXES — USERS
-- ─────────────────────────────────────────────
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_phone        ON users(phone);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_is_active    ON users(is_active);
CREATE INDEX idx_users_created_at   ON users(created_at DESC);

CREATE INDEX idx_sessions_user_id   ON user_sessions(user_id);
CREATE INDEX idx_sessions_token     ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires   ON user_sessions(expires_at);

-- ─────────────────────────────────────────────
--  INDEXES — PRODUCTS
-- ─────────────────────────────────────────────
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_sku         ON products(sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active   ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price       ON products(price);
CREATE INDEX idx_products_stock_status ON products(stock_status);
CREATE INDEX idx_products_created_at  ON products(created_at DESC);

-- Full-text search on products
CREATE INDEX idx_products_search ON products
  USING GIN(to_tsvector('simple', name || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(description, '')));

CREATE INDEX idx_categories_slug     ON product_categories(slug);
CREATE INDEX idx_categories_parent   ON product_categories(parent_id);
CREATE INDEX idx_categories_is_active ON product_categories(is_active);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_attrs_product  ON product_attribute_values(product_id);
CREATE INDEX idx_product_specs_product  ON product_specifications(product_id);
CREATE INDEX idx_product_downloads_prod ON product_downloads(product_id);

CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_user_id    ON product_reviews(user_id);
CREATE INDEX idx_reviews_approved   ON product_reviews(is_approved);
CREATE INDEX idx_reviews_rating     ON product_reviews(rating);

-- ─────────────────────────────────────────────
--  INDEXES — ORDERS
-- ─────────────────────────────────────────────
CREATE INDEX idx_orders_user_id       ON orders(user_id);
CREATE INDEX idx_orders_order_number  ON orders(order_number);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at    ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_payments_order_id      ON payments(order_id);
CREATE INDEX idx_payments_status        ON payments(status);
CREATE INDEX idx_payments_transaction   ON payments(transaction_id);

-- ─────────────────────────────────────────────
--  INDEXES — BLOG
-- ─────────────────────────────────────────────
CREATE INDEX idx_blog_posts_slug        ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author_id   ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status      ON blog_posts(status);
CREATE INDEX idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX idx_blog_posts_published   ON blog_posts(published_at DESC);

-- Full-text search on blog posts
CREATE INDEX idx_blog_posts_search ON blog_posts
  USING GIN(to_tsvector('simple', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- ─────────────────────────────────────────────
--  INDEXES — MISC
-- ─────────────────────────────────────────────
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX idx_chat_sessions_status  ON chat_sessions(status);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender  ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read);

CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource   ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX idx_favorites_user_id    ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

CREATE INDEX idx_addresses_user_id    ON addresses(user_id);

CREATE INDEX idx_webhook_logs_webhook  ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_success  ON webhook_logs(success);
CREATE INDEX idx_webhook_logs_created  ON webhook_logs(created_at DESC);

CREATE INDEX idx_banners_position     ON banners(position);
CREATE INDEX idx_banners_is_active    ON banners(is_active);

CREATE INDEX idx_faqs_category_id     ON faqs(category_id);
CREATE INDEX idx_faqs_is_active       ON faqs(is_active);

CREATE INDEX idx_settings_key         ON settings("key");
CREATE INDEX idx_settings_group       ON settings("group");

-- ─────────────────────────────────────────────
--  TRIGGER FUNCTION — updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users', 'products', 'product_categories', 'orders',
    'payments', 'blog_posts', 'faqs', 'banners', 'menus',
    'pages', 'coupons', 'addresses', 'chat_sessions',
    'integrations', 'api_configurations', 'webhooks', 'settings'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trigger_updated_at_%s
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t, t
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────
--  TRIGGER — Auto-update product review stats
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  pid UUID;
  avg_r NUMERIC;
  cnt INT;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);

  SELECT
    COUNT(*),
    ROUND(AVG(rating)::NUMERIC, 2)
  INTO cnt, avg_r
  FROM product_reviews
  WHERE product_id = pid AND is_approved = TRUE;

  UPDATE products
  SET review_count = cnt, average_rating = COALESCE(avg_r, 0)
  WHERE id = pid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_review_stats_insert
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();

-- ─────────────────────────────────────────────
--  TRIGGER — Auto-update blog post count in categories/tags
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_blog_category_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_categories SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id <> NEW.category_id THEN
    UPDATE blog_categories SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.category_id;
    UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blog_category_count
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_category_count();

-- ─────────────────────────────────────────────
--  TRIGGER — Auto-update stock status
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= 0 AND NEW.stock_status = 'in_stock' THEN
    NEW.stock_status := 'out_of_stock';
  ELSIF NEW.stock > 0 AND NEW.stock_status = 'out_of_stock' THEN
    NEW.stock_status := 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_status
  BEFORE INSERT OR UPDATE OF stock ON products
  FOR EACH ROW EXECUTE FUNCTION update_stock_status();

-- ─────────────────────────────────────────────
--  FUNCTION — Increment product view count
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_product_view(product_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET view_count = view_count + 1 WHERE slug = product_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
--  FUNCTION — Increment blog view count
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_blog_view(post_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
--  FUNCTION — Product full-text search
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  p_category_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_in_stock BOOLEAN DEFAULT NULL,
  p_limit INT DEFAULT 12,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID, name VARCHAR, slug VARCHAR, price NUMERIC,
  compare_price NUMERIC, stock_status stock_status,
  average_rating NUMERIC, review_count INT, is_featured BOOLEAN,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.name, p.slug, p.price, p.compare_price,
    p.stock_status, p.average_rating, p.review_count, p.is_featured,
    ts_rank(to_tsvector('simple', p.name || ' ' || COALESCE(p.short_description, '')),
            plainto_tsquery('simple', search_query)) AS rank
  FROM products p
  WHERE
    p.is_active = TRUE
    AND (search_query IS NULL OR search_query = '' OR
         to_tsvector('simple', p.name || ' ' || COALESCE(p.short_description, ''))
         @@ plainto_tsquery('simple', search_query))
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_in_stock IS NULL OR (p_in_stock = TRUE AND p.stock > 0)
         OR (p_in_stock = FALSE))
  ORDER BY rank DESC, p.is_featured DESC, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
