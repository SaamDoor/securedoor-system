-- اول مطمئن می‌شویم جدول وجود دارد
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    customer_tier TEXT NOT NULL DEFAULT 'regular',
    special_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- حالا ستون‌ها را اضافه می‌کنیم
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS customer_tier TEXT NOT NULL DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS special_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (special_discount_percent >= 0 AND special_discount_percent <= 100);
    