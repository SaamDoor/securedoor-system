-- Complete product content fields and secure manual bank-transfer workflow.

-- Align legacy product/storage policies with the canonical database role lookup.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT public.get_my_role() IN ('admin', 'super_admin');
$$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand VARCHAR(200),
  ADD COLUMN IF NOT EXISTS body_content TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(200),
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS robots VARCHAR(50),
  ADD COLUMN IF NOT EXISTS og_title VARCHAR(95),
  ADD COLUMN IF NOT EXISTS og_description VARCHAR(300),
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS faq_pairs JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS entity_keywords TEXT[];

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name VARCHAR(150) NOT NULL,
  account_holder VARCHAR(200) NOT NULL,
  account_number VARCHAR(50),
  card_number VARCHAR(16),
  iban VARCHAR(26),
  branch_name VARCHAR(200),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bank_accounts_identifier_required CHECK (
    account_number IS NOT NULL OR card_number IS NOT NULL OR iban IS NOT NULL
  ),
  CONSTRAINT bank_accounts_card_format CHECK (
    card_number IS NULL OR card_number ~ '^[0-9]{16}$'
  ),
  CONSTRAINT bank_accounts_iban_format CHECK (
    iban IS NULL OR iban ~ '^IR[0-9]{24}$'
  )
);

CREATE TABLE IF NOT EXISTS public.bank_transfer_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id),
  order_id UUID REFERENCES public.orders(id),
  amount NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
  transferred_at TIMESTAMPTZ NOT NULL,
  tracking_code VARCHAR(100),
  receipt_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  user_note TEXT,
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bank_transfer_evidence_required CHECK (
    tracking_code IS NOT NULL OR receipt_url IS NOT NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_bank_transfer_tracking
  ON public.bank_transfer_receipts (bank_account_id, tracking_code)
  WHERE tracking_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_accounts_visible
  ON public.bank_accounts (is_active, is_verified, display_order);
CREATE INDEX IF NOT EXISTS idx_bank_receipts_user
  ON public.bank_transfer_receipts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bank_receipts_status
  ON public.bank_transfer_receipts (status, created_at);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfer_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_accounts_visible_read"
  ON public.bank_accounts FOR SELECT
  USING (
    (is_active = TRUE AND is_verified = TRUE)
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "bank_accounts_admin_insert"
  ON public.bank_accounts FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "bank_accounts_admin_update"
  ON public.bank_accounts FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "bank_accounts_super_admin_delete"
  ON public.bank_accounts FOR DELETE
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "bank_receipts_owner_read"
  ON public.bank_transfer_receipts FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "bank_receipts_owner_insert"
  ON public.bank_transfer_receipts FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.bank_accounts account
      WHERE account.id = bank_account_id
        AND account.is_active = TRUE
        AND account.is_verified = TRUE
    )
  );

CREATE POLICY "bank_receipts_admin_update"
  ON public.bank_transfer_receipts FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (public.get_my_role() IN ('admin', 'super_admin'));

-- The trigger keeps receipt approval and wallet credit in one database transaction.
CREATE OR REPLACE FUNCTION app_private.process_bank_transfer_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_wallet public.wallets%ROWTYPE;
BEGIN
  IF public.get_my_role() NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only administrators can review bank transfers';
  END IF;

  IF OLD.status <> 'pending' AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'A reviewed receipt cannot change status';
  END IF;

  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := NOW();

    IF NEW.status = 'approved' THEN
      SELECT * INTO target_wallet
      FROM public.wallets
      WHERE user_id = NEW.user_id
      FOR UPDATE;

      IF NOT FOUND THEN
        INSERT INTO public.wallets (user_id)
        VALUES (NEW.user_id)
        RETURNING * INTO target_wallet;
      END IF;

      UPDATE public.wallets
      SET balance = balance + NEW.amount,
          lifetime_earned = lifetime_earned + NEW.amount
      WHERE id = target_wallet.id
      RETURNING * INTO target_wallet;

      INSERT INTO public.wallet_transactions (
        wallet_id,
        user_id,
        type,
        amount,
        balance_after,
        reference_id,
        reference_type,
        description,
        created_by
      ) VALUES (
        target_wallet.id,
        NEW.user_id,
        'credit',
        NEW.amount,
        target_wallet.balance,
        NEW.id,
        'bank_transfer',
        'واریز بانکی تأییدشده',
        auth.uid()
      );
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_process_bank_transfer_review
  ON public.bank_transfer_receipts;
CREATE TRIGGER trg_process_bank_transfer_review
  BEFORE UPDATE OF status ON public.bank_transfer_receipts
  FOR EACH ROW
  EXECUTE FUNCTION app_private.process_bank_transfer_review();

-- Wallet balances and ledger rows cannot be changed directly by authenticated clients.
DROP POLICY IF EXISTS "wallets_admin_update" ON public.wallets;
DROP POLICY IF EXISTS "wallet_tx_insert" ON public.wallet_transactions;

CREATE OR REPLACE FUNCTION app_private.reject_wallet_ledger_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Wallet ledger entries are immutable';
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_transactions_immutable
  ON public.wallet_transactions;
CREATE TRIGGER trg_wallet_transactions_immutable
  BEFORE UPDATE OR DELETE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION app_private.reject_wallet_ledger_mutation();

-- Product files may be replaced or removed only by real admin roles.
CREATE POLICY "admin_update_products"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'products' AND public.is_admin())
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "admin_delete_products"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND public.is_admin());

DROP TRIGGER IF EXISTS trg_bank_accounts_updated ON public.bank_accounts;
CREATE TRIGGER trg_bank_accounts_updated
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Private receipt images; each user writes only inside their own UUID folder.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "receipt_files_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "receipt_files_owner_or_admin_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR public.get_my_role() IN ('admin', 'super_admin')
    )
  );
