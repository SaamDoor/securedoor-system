-- Expand checkout payment methods + seed admin-controlled bank/payment settings

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method = ANY (ARRAY[
    'online'::text,
    'bank_transfer'::text,
    'card_to_card'::text,
    'wallet'::text,
    'cash_on_delivery'::text,
    'digipay'::text,
    'snappay'::text
  ]));

INSERT INTO public.settings (key, value, "group", description, is_public)
VALUES
  ('payment_enable_online', 'true'::jsonb, 'payment', 'فعال بودن درگاه آنلاین', true),
  ('payment_enable_digipay', 'true'::jsonb, 'payment', 'فعال بودن دیجی‌پی', true),
  ('payment_enable_snappay', 'true'::jsonb, 'payment', 'فعال بودن اسنپ‌پی', true),
  ('payment_enable_bank_transfer', 'true'::jsonb, 'payment', 'فعال بودن واریز بانکی / شبا / ساتنا', true),
  ('payment_enable_card_to_card', 'true'::jsonb, 'payment', 'فعال بودن کارت‌به‌کارت', true),
  ('payment_enable_cod', 'false'::jsonb, 'payment', 'فعال بودن پرداخت در محل', true),
  ('payment_bank_name', '"بانک ملت"'::jsonb, 'payment', 'نام بانک حساب واریزی', true),
  ('payment_account_holder', '"گروه صنعتی مشعوف"'::jsonb, 'payment', 'نام صاحب حساب', true),
  ('payment_account_number', '""'::jsonb, 'payment', 'شماره حساب', true),
  ('payment_iban', '"IR000000000000000000000000"'::jsonb, 'payment', 'شماره شبا', true),
  ('payment_card_number', '""'::jsonb, 'payment', 'شماره کارت', true),
  ('payment_bank_instructions', '"پس از واریز، شماره پیگیری و مبلغ را برای پشتیبانی ارسال کنید. شناسه واریز = شماره سفارش."'::jsonb, 'payment', 'راهنمای واریز برای مشتری', true)
ON CONFLICT (key) DO NOTHING;
