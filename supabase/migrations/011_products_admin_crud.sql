-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Product Admin CRUD Security + Frame Linking
--  Migration: 011_products_admin_crud
--
--  001/003 left `products` and its child tables without RLS at all,
--  which means writes were wide open to anyone holding the anon key.
--  This migration enables RLS with an explicit public-read policy
--  (preserving today's storefront behavior) and restricts writes to
--  admin/manager roles via the existing is_admin() helper.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
--  Link products to specific frame price rows
--  (admin can attach one or more frame_price_list entries to a door)
-- ─────────────────────────────────────────────

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS linked_frame_ids UUID[] NOT NULL DEFAULT '{}';

-- ─────────────────────────────────────────────
--  ENABLE RLS
-- ─────────────────────────────────────────────

ALTER TABLE products                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_downloads           ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
--  PUBLIC READ  (storefront — unchanged behavior)
-- ─────────────────────────────────────────────

CREATE POLICY "products_public_read" ON products FOR SELECT USING (TRUE);
CREATE POLICY "categories_public_read" ON product_categories FOR SELECT USING (TRUE);
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "product_attributes_public_read" ON product_attributes FOR SELECT USING (TRUE);
CREATE POLICY "product_attribute_values_public_read" ON product_attribute_values FOR SELECT USING (TRUE);
CREATE POLICY "product_specifications_public_read" ON product_specifications FOR SELECT USING (TRUE);
CREATE POLICY "product_downloads_public_read" ON product_downloads FOR SELECT USING (is_public = TRUE OR is_admin());

-- ─────────────────────────────────────────────
--  ADMIN WRITE  (insert / update / delete)
-- ─────────────────────────────────────────────

CREATE POLICY "products_admin_write" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_admin_update" ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "products_admin_delete" ON products FOR DELETE USING (is_admin());

CREATE POLICY "categories_admin_write" ON product_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_admin_update" ON product_categories FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "categories_admin_delete" ON product_categories FOR DELETE USING (is_admin());

CREATE POLICY "product_images_admin_write" ON product_images FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "product_images_admin_update" ON product_images FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "product_images_admin_delete" ON product_images FOR DELETE USING (is_admin());

CREATE POLICY "product_attributes_admin_all" ON product_attributes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "product_attribute_values_admin_write" ON product_attribute_values FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "product_attribute_values_admin_update" ON product_attribute_values FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "product_attribute_values_admin_delete" ON product_attribute_values FOR DELETE USING (is_admin());

CREATE POLICY "product_specifications_admin_write" ON product_specifications FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "product_specifications_admin_update" ON product_specifications FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "product_specifications_admin_delete" ON product_specifications FOR DELETE USING (is_admin());

CREATE POLICY "product_downloads_admin_write" ON product_downloads FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "product_downloads_admin_update" ON product_downloads FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "product_downloads_admin_delete" ON product_downloads FOR DELETE USING (is_admin());
