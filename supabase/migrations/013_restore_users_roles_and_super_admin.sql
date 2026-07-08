-- ═══════════════════════════════════════════════════════════════
--  گروه صنعتی مشعوف — Restore auth profiles, role lookup, and super admin
--  Migration: 013_restore_users_roles_and_super_admin
--
--  هدف:
--    1. ایجاد public.users برای نقش‌ها و اطلاعات پنل‌ها
--    2. فعال‌سازی RLS با سیاست‌های حداقلی امن
--    3. ایجاد تابع get_my_role() برای middleware/layout ها
--    4. ساخت/ارتقای اکانت سوپرادمین
--
--  اطلاعات ورود سوپرادمین:
--    Email    : ph_09003286539@mashuf.com
--    Password : Mashuf@Admin1403
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'support', 'manager', 'admin', 'super_admin')),
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  customer_tier text NOT NULL DEFAULT 'regular'
    CHECK (customer_tier IN ('regular', 'mass_builder', 'reseller')),
  builder_tier text NOT NULL DEFAULT 'regular',
  special_discount_percent numeric NOT NULL DEFAULT 0
    CHECK (special_discount_percent >= 0 AND special_discount_percent <= 100),
  referral_code text UNIQUE,
  referred_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_private.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.role
  FROM public.users u
  WHERE u.id = auth.uid()
  LIMIT 1
$$;

GRANT USAGE ON SCHEMA app_private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.current_user_role() TO anon, authenticated;

DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR app_private.current_user_role() IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS "users_update_admin_only" ON public.users;
CREATE POLICY "users_update_admin_only"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (app_private.current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (app_private.current_user_role() IN ('admin', 'super_admin'));

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT u.role
  FROM public.users u
  WHERE u.id = auth.uid()
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_app_meta_data ->> 'role', 'customer'),
    TRUE,
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.created_at, timezone('utc', now())),
    timezone('utc', now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = COALESCE(public.users.phone, EXCLUDED.phone),
    first_name = COALESCE(public.users.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.users.last_name, EXCLUDED.last_name),
    is_verified = public.users.is_verified OR EXCLUDED.is_verified,
    updated_at = timezone('utc', now());

  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app_private.handle_new_user();

INSERT INTO public.users (
  id,
  email,
  phone,
  first_name,
  last_name,
  role,
  is_active,
  is_verified,
  created_at,
  updated_at
)
SELECT
  au.id,
  COALESCE(au.email, ''),
  au.raw_user_meta_data ->> 'phone',
  au.raw_user_meta_data ->> 'first_name',
  au.raw_user_meta_data ->> 'last_name',
  COALESCE(au.raw_app_meta_data ->> 'role', 'customer'),
  TRUE,
  au.email_confirmed_at IS NOT NULL,
  COALESCE(au.created_at, timezone('utc', now())),
  timezone('utc', now())
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id)
SELECT au.id
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR app_private.current_user_role() IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS "profiles_update_admin_only" ON public.profiles;
CREATE POLICY "profiles_update_admin_only"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (app_private.current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (app_private.current_user_role() IN ('admin', 'super_admin'));

DO $$
DECLARE
  v_uid uuid;
  v_email text := 'ph_09003286539@mashuf.com';
BEGIN
  SELECT id INTO v_uid
  FROM auth.users
  WHERE lower(email) = lower(v_email)
  LIMIT 1;

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();

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
      timezone('utc', now()),
      '{"provider":"email","providers":["email"],"role":"super_admin"}'::jsonb,
      '{"first_name":"مدیر","last_name":"مشعوف","phone":"09003286539"}'::jsonb,
      FALSE,
      timezone('utc', now()),
      timezone('utc', now())
    );

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
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
      'email',
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    )
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt('Mashuf@Admin1403', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now())),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
        || '{"provider":"email","providers":["email"],"role":"super_admin"}'::jsonb,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || '{"first_name":"مدیر","last_name":"مشعوف","phone":"09003286539"}'::jsonb,
      updated_at = timezone('utc', now())
    WHERE id = v_uid;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    phone,
    first_name,
    last_name,
    role,
    is_active,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    v_uid,
    v_email,
    '09003286539',
    'مدیر',
    'مشعوف',
    'super_admin',
    TRUE,
    TRUE,
    timezone('utc', now()),
    timezone('utc', now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = 'super_admin',
    is_active = TRUE,
    is_verified = TRUE,
    updated_at = timezone('utc', now());

  INSERT INTO public.profiles (id)
  VALUES (v_uid)
  ON CONFLICT (id) DO NOTHING;
END $$;
