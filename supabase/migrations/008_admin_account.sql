-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Admin Account Seed
--  Migration: 008_admin_account
--
--  اطلاعات ورود مدیر:
--    شماره موبایل : 09003286539
--    رمز عبور    : Mashuf@Admin1403
--
--  این اسکریپت را یک‌بار در SQL Editor داشبورد Supabase اجرا کنید.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_uid  UUID;
  v_email TEXT := 'ph_09003286539@mashuf-auth.com';
BEGIN

  -- اگر قبلاً اکانت وجود داشته باشد، فقط نقش را به‌روز کن
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    UPDATE public.users
       SET role        = 'super_admin',
           is_verified = TRUE,
           is_active   = TRUE,
           updated_at  = NOW()
     WHERE email = v_email;
    RAISE NOTICE 'Admin account already exists — role updated to super_admin.';
    RETURN;
  END IF;

  v_uid := gen_random_uuid();

  -- ─── ۱. ساخت کاربر در جدول auth.users ────────────────────────
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
  ) VALUES (
    v_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    crypt('Mashuf@Admin1403', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"مدیر","last_name":"مشعوف","phone":"09003286539"}'::jsonb,
    FALSE,
    NOW(),
    NOW()
  );

  -- ─── ۲. ثبت identity (برای ورود ایمیل/پسورد) ─────────────────
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_uid,
    v_email,
    jsonb_build_object('sub', v_uid::text, 'email', v_email),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- ─── ۳. به‌روزرسانی پروفایل در public.users ───────────────────
  -- trigger handle_new_user() این رکورد را می‌سازد؛
  -- در اینجا فقط نقش را به super_admin ارتقا می‌دهیم.
  UPDATE public.users
     SET role        = 'super_admin',
         first_name  = 'مدیر',
         last_name   = 'مشعوف',
         phone       = '09003286539',
         is_verified = TRUE,
         is_active   = TRUE,
         updated_at  = NOW()
   WHERE id = v_uid;

  -- اگر trigger هنوز اجرا نشده، insert دستی
  IF NOT FOUND THEN
    INSERT INTO public.users (
      id, email, phone, first_name, last_name,
      role, is_active, is_verified, created_at, updated_at
    ) VALUES (
      v_uid, v_email, '09003286539', 'مدیر', 'مشعوف',
      'super_admin', TRUE, TRUE, NOW(), NOW()
    );
  END IF;

  RAISE NOTICE 'Admin account created successfully. UUID: %', v_uid;

END $$;
