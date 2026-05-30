-- ═══════════════════════════════════════════════════════════════
--  سام درب — Seed Data
--  Migration: 004_seed_data
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
--  ROLES
-- ─────────────────────────────────────────────
INSERT INTO roles (name, slug, description, is_system) VALUES
  ('مدیر ارشد', 'super_admin', 'دسترسی کامل به تمام بخش‌های سیستم', TRUE),
  ('مدیر', 'admin', 'دسترسی به مدیریت محصولات، سفارشات و کاربران', TRUE),
  ('مسئول', 'manager', 'دسترسی به گزارشات و مدیریت محتوا', TRUE),
  ('پشتیبانی', 'support', 'دسترسی به پیام‌ها و سفارشات', TRUE),
  ('مشتری', 'customer', 'دسترسی به پنل کاربری', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
--  PERMISSIONS
-- ─────────────────────────────────────────────
INSERT INTO permissions (name, resource, action) VALUES
  -- Products
  ('مشاهده محصولات', 'products', 'read'),
  ('ایجاد محصول', 'products', 'create'),
  ('ویرایش محصول', 'products', 'update'),
  ('حذف محصول', 'products', 'delete'),
  ('مدیریت کامل محصولات', 'products', 'manage'),
  -- Orders
  ('مشاهده سفارشات', 'orders', 'read'),
  ('مدیریت سفارشات', 'orders', 'manage'),
  -- Users
  ('مشاهده کاربران', 'users', 'read'),
  ('مدیریت کاربران', 'users', 'manage'),
  -- CMS
  ('مدیریت محتوا', 'cms', 'manage'),
  -- Settings
  ('مدیریت تنظیمات', 'settings', 'manage'),
  -- Integrations
  ('مدیریت یکپارچه‌سازی', 'integrations', 'manage'),
  -- Reports
  ('مشاهده گزارشات', 'reports', 'read'),
  ('مدیریت گزارشات', 'reports', 'manage')
ON CONFLICT (resource, action) DO NOTHING;

-- ─────────────────────────────────────────────
--  PRODUCT CATEGORIES
-- ─────────────────────────────────────────────
INSERT INTO product_categories (id, name, slug, description, "order") VALUES
  ('a1000000-0000-0000-0000-000000000001', 'درب ضد سرقت', 'darb-zed-sereqat',
   'انواع درب‌های ضد سرقت با بالاترین استانداردهای امنیتی', 1),
  ('a1000000-0000-0000-0000-000000000002', 'درب ضد حریق', 'darb-zed-hariq',
   'درب‌های مقاوم در برابر آتش و حرارت', 2),
  ('a1000000-0000-0000-0000-000000000003', 'درب آپارتمانی', 'darb-apartmani',
   'درب‌های مخصوص آپارتمان با طراحی مدرن', 3),
  ('a1000000-0000-0000-0000-000000000004', 'درب ویلایی', 'darb-villaei',
   'درب‌های لوکس مخصوص ویلا و خانه‌های مستقل', 4),
  ('a1000000-0000-0000-0000-000000000005', 'درب اداری', 'darb-edari',
   'درب‌های مناسب برای فضاهای اداری و تجاری', 5),
  ('a1000000-0000-0000-0000-000000000006', 'متعلقات و یراق‌آلات', 'moteallaqat',
   'قفل، دستگیره و سایر متعلقات درب', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
--  PRODUCT ATTRIBUTES
-- ─────────────────────────────────────────────
INSERT INTO product_attributes (name, slug, type, unit, "order") VALUES
  ('جنس', 'material', 'select', NULL, 1),
  ('رنگ', 'color', 'color', NULL, 2),
  ('ضخامت', 'thickness', 'number', 'میلی‌متر', 3),
  ('وزن', 'weight', 'number', 'کیلوگرم', 4),
  ('درجه امنیتی', 'security-grade', 'select', NULL, 5),
  ('استاندارد', 'standard', 'text', NULL, 6),
  ('ضمانت', 'warranty', 'text', 'سال', 7),
  ('قابلیت ضد آب', 'waterproof', 'boolean', NULL, 8)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
--  SHIPPING METHODS
-- ─────────────────────────────────────────────
INSERT INTO shipping_methods (name, description, price, estimated_days_min, estimated_days_max, "order") VALUES
  ('ارسال عادی', 'ارسال از طریق پست پیشتاز', 150000, 3, 7, 1),
  ('ارسال سریع', 'ارسال از طریق پیک سریع', 350000, 1, 3, 2),
  ('نصب و ارسال توسط تیم سام', 'نصب توسط تیم متخصص سام درب', 500000, 7, 14, 3),
  ('تحویل حضوری', 'تحویل از نمایندگی‌های سراسر کشور', 0, 1, 2, 4)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
--  FAQs
-- ─────────────────────────────────────────────
INSERT INTO faq_categories (name, slug, "order") VALUES
  ('خرید و سفارش', 'kharid-va-sefaresh', 1),
  ('نصب و گارانتی', 'nasb-va-garantee', 2),
  ('محصولات', 'mahsolat', 3),
  ('پرداخت', 'pardakht', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO faqs (question, answer, "order") VALUES
  ('چگونه می‌توانم سفارش بدهم؟',
   'برای ثبت سفارش، محصول مورد نظر را به سبد خرید اضافه کرده و مراحل تسویه حساب را طی کنید. پس از تأیید پرداخت، سفارش شما ثبت می‌شود.',
   1),
  ('آیا نصب درب توسط تیم سام انجام می‌شود؟',
   'بله، تیم متخصص سام درب در تمام استان‌های کشور خدمات نصب ارائه می‌دهد. هزینه نصب بسته به منطقه جغرافیایی متفاوت است.',
   2),
  ('ضمانت محصولات سام درب چند سال است؟',
   'تمام محصولات سام درب دارای ضمانت‌نامه رسمی ۱۰ ساله هستند. ضمانت شامل عیوب ساخت، قفل و سیستم‌های امنیتی می‌شود.',
   3),
  ('آیا امکان بازگشت کالا وجود دارد؟',
   'بله، در صورت عدم رضایت از محصول، تا ۷ روز پس از تحویل امکان مرجوعی وجود دارد. کالا باید در شرایط اولیه و بدون نصب باشد.',
   4),
  ('درب‌های سام از چه فولادی ساخته شده‌اند؟',
   'درب‌های سام از فولاد گالوانیزه گرم درجه یک ایتالیایی با ضخامت ۱ تا ۳ میلی‌متر ساخته می‌شوند که مقاومت بالایی در برابر خوردگی دارند.',
   5),
  ('روش‌های پرداخت چیست؟',
   'می‌توانید از طریق درگاه آنلاین، کارت به کارت یا انتقال بانکی پرداخت کنید. همچنین امکان پرداخت اقساطی با شرایط ویژه نیز وجود دارد.',
   6)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
--  SETTINGS — Default Configuration
-- ─────────────────────────────────────────────
INSERT INTO settings ("key", value, "group", description, is_public) VALUES
  ('site_name', '"سام درب"', 'general', 'نام سایت', TRUE),
  ('site_url', '"https://samdoor.com"', 'general', 'آدرس سایت', TRUE),
  ('site_phone', '"021-88000000"', 'contact', 'شماره تماس', TRUE),
  ('site_email', '"info@samdoor.com"', 'contact', 'ایمیل', TRUE),
  ('site_address', '"تهران، خیابان ولیعصر، برج سام"', 'contact', 'آدرس', TRUE),
  ('working_hours', '"شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳"', 'contact', 'ساعات کاری', TRUE),
  ('social_instagram', '"https://instagram.com/samdoor"', 'social', 'اینستاگرام', TRUE),
  ('social_telegram', '"https://t.me/samdoor"', 'social', 'تلگرام', TRUE),
  ('social_whatsapp', '"https://wa.me/989120000000"', 'social', 'واتساپ', TRUE),
  ('tax_rate', '9', 'shop', 'درصد مالیات بر ارزش افزوده', FALSE),
  ('currency', '"تومان"', 'shop', 'واحد پول', TRUE),
  ('min_order_amount', '500000', 'shop', 'حداقل مبلغ سفارش', FALSE),
  ('free_shipping_threshold', '5000000', 'shop', 'حداقل خرید برای ارسال رایگان', TRUE),
  ('maintenance_mode', 'false', 'system', 'حالت تعمیرات', FALSE),
  ('registration_enabled', 'true', 'system', 'امکان ثبت‌نام', FALSE),
  ('review_auto_approve', 'false', 'shop', 'تأیید خودکار نظرات', FALSE),
  ('order_notifications_sms', 'true', 'notifications', 'پیامک وضعیت سفارش', FALSE),
  ('order_notifications_email', 'true', 'notifications', 'ایمیل وضعیت سفارش', FALSE)
ON CONFLICT ("key") DO NOTHING;

-- ─────────────────────────────────────────────
--  INTEGRATIONS — Available Providers
-- ─────────────────────────────────────────────
INSERT INTO integrations (name, slug, provider, category, description) VALUES
  ('زرین‌پال', 'zarinpal', 'zarinpal', 'payment', 'درگاه پرداخت زرین‌پال'),
  ('آیدی پی', 'idpay', 'idpay', 'payment', 'درگاه پرداخت آیدی پی'),
  ('نکست پی', 'nextpay', 'nextpay', 'payment', 'درگاه پرداخت نکست پی'),
  ('SMS.ir', 'sms-ir', 'sms_ir', 'sms', 'ارسال پیامک از طریق SMS.ir'),
  ('کاوه‌نگار', 'kavenegar', 'kavenegar', 'sms', 'ارسال پیامک از طریق کاوه‌نگار'),
  ('ملی پیامک', 'melipayamak', 'melipayamak', 'sms', 'ارسال پیامک از طریق ملی پیامک'),
  ('دیجی‌کالا', 'digikala', 'digikala', 'marketplace', 'فروشگاه دیجی‌کالا'),
  ('باسلام', 'basalam', 'basalam', 'marketplace', 'فروشگاه باسلام'),
  ('ترب', 'torob', 'torob', 'marketplace', 'مقایسه قیمت ترب')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
--  MENUS
-- ─────────────────────────────────────────────
INSERT INTO menus (id, name, slug) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'منوی اصلی', 'main'),
  ('b1000000-0000-0000-0000-000000000002', 'منوی فوتر', 'footer'),
  ('b1000000-0000-0000-0000-000000000003', 'منوی کاربر', 'user')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (menu_id, label, url, "order") VALUES
  ('b1000000-0000-0000-0000-000000000001', 'خانه', '/', 1),
  ('b1000000-0000-0000-0000-000000000001', 'محصولات', '/products', 2),
  ('b1000000-0000-0000-0000-000000000001', 'دسته‌بندی‌ها', '/categories', 3),
  ('b1000000-0000-0000-0000-000000000001', 'وبلاگ', '/blog', 4),
  ('b1000000-0000-0000-0000-000000000001', 'درباره ما', '/about', 5),
  ('b1000000-0000-0000-0000-000000000001', 'تماس با ما', '/contact', 6)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
--  BLOG CATEGORIES
-- ─────────────────────────────────────────────
INSERT INTO blog_categories (name, slug, description) VALUES
  ('راهنمای خرید', 'rahnamay-kharid', 'راهنمای انتخاب درب مناسب'),
  ('آموزش نصب', 'amoozesh-nasb', 'آموزش نصب و نگهداری درب'),
  ('اخبار صنعت', 'akhbar-sanat', 'آخرین اخبار صنعت درب و پنجره'),
  ('امنیت خانه', 'amniat-khane', 'نکات امنیتی برای خانه'),
  ('طراحی داخلی', 'tarahi-dakheli', 'ترکیب درب با دکوراسیون داخلی')
ON CONFLICT (slug) DO NOTHING;
