-- Preserve pre_order / discontinued when syncing directional stock.
-- Add atomic bulk helpers for inventory & pricing admin ops.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_low_stock BOOLEAN
  GENERATED ALWAYS AS (stock > 0 AND stock <= low_stock_threshold) STORED;

CREATE INDEX IF NOT EXISTS idx_products_is_low_stock ON public.products (is_low_stock)
  WHERE is_low_stock = TRUE;

CREATE OR REPLACE FUNCTION app_private.sync_directional_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.stock := NEW.stock_left + NEW.stock_right;

  IF NEW.stock_status IN (
    'pre_order'::public.stock_status,
    'discontinued'::public.stock_status
  ) THEN
    RETURN NEW;
  END IF;

  NEW.stock_status := CASE
    WHEN NEW.stock > 0 THEN 'in_stock'::public.stock_status
    ELSE 'out_of_stock'::public.stock_status
  END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_bulk_patch_inventory(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer := 0;
  v_row jsonb;
  v_id uuid;
  v_left integer;
  v_right integer;
  v_threshold integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'دسترسی مدیریت محصولات ندارید';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'ورودی نامعتبر است';
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    v_id := (v_row->>'id')::uuid;
    v_left := GREATEST(0, COALESCE((v_row->>'stock_left')::integer, 0));
    v_right := GREATEST(0, COALESCE((v_row->>'stock_right')::integer, 0));
    v_threshold := GREATEST(0, COALESCE((v_row->>'low_stock_threshold')::integer, 0));

    UPDATE public.products
    SET
      stock_left = v_left,
      stock_right = v_right,
      low_stock_threshold = v_threshold,
      updated_at = NOW()
    WHERE id = v_id;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_bulk_adjust_inventory(
  p_ids uuid[],
  p_mode text,
  p_field text,
  p_value integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'دسترسی مدیریت محصولات ندارید';
  END IF;

  IF p_ids IS NULL OR cardinality(p_ids) = 0 THEN
    RETURN 0;
  END IF;

  IF p_value IS NULL OR p_value < 0 THEN
    RAISE EXCEPTION 'مقدار نامعتبر است';
  END IF;

  IF p_mode NOT IN ('set', 'increase', 'decrease') THEN
    RAISE EXCEPTION 'حالت عملیات نامعتبر است';
  END IF;

  IF p_field NOT IN ('stock_left', 'stock_right', 'low_stock_threshold', 'both_sides') THEN
    RAISE EXCEPTION 'فیلد عملیات نامعتبر است';
  END IF;

  WITH target AS (
    SELECT id, stock_left, stock_right, low_stock_threshold
    FROM public.products
    WHERE id = ANY(p_ids)
  ),
  computed AS (
    SELECT
      id,
      CASE
        WHEN p_field IN ('stock_left', 'both_sides') THEN
          CASE p_mode
            WHEN 'set' THEN p_value
            WHEN 'increase' THEN stock_left + p_value
            ELSE GREATEST(0, stock_left - p_value)
          END
        ELSE stock_left
      END AS next_left,
      CASE
        WHEN p_field IN ('stock_right', 'both_sides') THEN
          CASE p_mode
            WHEN 'set' THEN p_value
            WHEN 'increase' THEN stock_right + p_value
            ELSE GREATEST(0, stock_right - p_value)
          END
        ELSE stock_right
      END AS next_right,
      CASE
        WHEN p_field = 'low_stock_threshold' THEN
          CASE p_mode
            WHEN 'set' THEN p_value
            WHEN 'increase' THEN low_stock_threshold + p_value
            ELSE GREATEST(0, low_stock_threshold - p_value)
          END
        ELSE low_stock_threshold
      END AS next_threshold
    FROM target
  )
  UPDATE public.products p
  SET
    stock_left = c.next_left,
    stock_right = c.next_right,
    low_stock_threshold = c.next_threshold,
    updated_at = NOW()
  FROM computed c
  WHERE p.id = c.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_bulk_patch_pricing(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer := 0;
  v_row jsonb;
  v_id uuid;
  v_price numeric;
  v_compare numeric;
  v_cost numeric;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'دسترسی مدیریت محصولات ندارید';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'ورودی نامعتبر است';
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    v_id := (v_row->>'id')::uuid;
    v_price := GREATEST(1, COALESCE((v_row->>'price')::numeric, 1));
    v_compare := CASE
      WHEN v_row ? 'compare_price' AND (v_row->>'compare_price') IS NOT NULL AND (v_row->>'compare_price') <> 'null'
        THEN GREATEST(0, (v_row->>'compare_price')::numeric)
      ELSE NULL
    END;
    v_cost := CASE
      WHEN v_row ? 'cost_price' AND (v_row->>'cost_price') IS NOT NULL AND (v_row->>'cost_price') <> 'null'
        THEN GREATEST(0, (v_row->>'cost_price')::numeric)
      ELSE NULL
    END;

    UPDATE public.products
    SET
      price = v_price,
      compare_price = v_compare,
      cost_price = v_cost,
      updated_at = NOW()
    WHERE id = v_id;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_bulk_adjust_pricing(
  p_ids uuid[],
  p_mode text,
  p_field text,
  p_value numeric DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'دسترسی مدیریت محصولات ندارید';
  END IF;

  IF p_ids IS NULL OR cardinality(p_ids) = 0 THEN
    RETURN 0;
  END IF;

  IF p_field NOT IN ('price', 'compare_price', 'cost_price') THEN
    RAISE EXCEPTION 'فیلد قیمت نامعتبر است';
  END IF;

  IF p_mode NOT IN ('set', 'increase_amount', 'decrease_amount', 'increase_percent', 'decrease_percent', 'clear') THEN
    RAISE EXCEPTION 'حالت عملیات نامعتبر است';
  END IF;

  IF p_mode = 'clear' AND p_field = 'price' THEN
    RAISE EXCEPTION 'قیمت اصلی را نمی‌توان پاک کرد';
  END IF;

  IF p_mode <> 'clear' AND (p_value IS NULL OR p_value < 0) THEN
    RAISE EXCEPTION 'مقدار نامعتبر است';
  END IF;

  WITH target AS (
    SELECT id, price, compare_price, cost_price
    FROM public.products
    WHERE id = ANY(p_ids)
  ),
  computed AS (
    SELECT
      id,
      CASE
        WHEN p_field = 'price' THEN
          GREATEST(1, ROUND(
            CASE p_mode
              WHEN 'set' THEN p_value
              WHEN 'increase_amount' THEN price + p_value
              WHEN 'decrease_amount' THEN price - p_value
              WHEN 'increase_percent' THEN price * (1 + p_value / 100.0)
              WHEN 'decrease_percent' THEN price * (1 - p_value / 100.0)
              ELSE price
            END
          ))
        ELSE price
      END AS next_price,
      CASE
        WHEN p_field = 'compare_price' THEN
          CASE
            WHEN p_mode = 'clear' THEN NULL
            ELSE GREATEST(0, ROUND(
              CASE p_mode
                WHEN 'set' THEN p_value
                WHEN 'increase_amount' THEN COALESCE(compare_price, 0) + p_value
                WHEN 'decrease_amount' THEN COALESCE(compare_price, 0) - p_value
                WHEN 'increase_percent' THEN COALESCE(compare_price, price) * (1 + p_value / 100.0)
                WHEN 'decrease_percent' THEN COALESCE(compare_price, price) * (1 - p_value / 100.0)
                ELSE COALESCE(compare_price, 0)
              END
            ))
          END
        ELSE compare_price
      END AS next_compare,
      CASE
        WHEN p_field = 'cost_price' THEN
          CASE
            WHEN p_mode = 'clear' THEN NULL
            ELSE GREATEST(0, ROUND(
              CASE p_mode
                WHEN 'set' THEN p_value
                WHEN 'increase_amount' THEN COALESCE(cost_price, 0) + p_value
                WHEN 'decrease_amount' THEN COALESCE(cost_price, 0) - p_value
                WHEN 'increase_percent' THEN COALESCE(cost_price, price) * (1 + p_value / 100.0)
                WHEN 'decrease_percent' THEN COALESCE(cost_price, price) * (1 - p_value / 100.0)
                ELSE COALESCE(cost_price, 0)
              END
            ))
          END
        ELSE cost_price
      END AS next_cost
    FROM target
  )
  UPDATE public.products p
  SET
    price = c.next_price,
    compare_price = c.next_compare,
    cost_price = c.next_cost,
    updated_at = NOW()
  FROM computed c
  WHERE p.id = c.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_bulk_patch_inventory(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_bulk_adjust_inventory(uuid[], text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_bulk_patch_pricing(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_bulk_adjust_pricing(uuid[], text, text, numeric) TO authenticated;
