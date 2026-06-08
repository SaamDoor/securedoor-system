-- ─── Customer Tier ──────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

DO $$ BEGIN
  CREATE TYPE customer_tier AS ENUM ('regular', 'mass_builder', 'reseller');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS customer_tier   customer_tier  NOT NULL DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS special_discount_percent  NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (special_discount_percent >= 0 AND special_discount_percent <= 100);

-- Index for quick discount lookups
CREATE INDEX IF NOT EXISTS idx_profiles_customer_tier ON public.profiles (customer_tier);

-- RLS: only super_admin can update tier/discount
CREATE POLICY "super_admin_update_tier" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );
