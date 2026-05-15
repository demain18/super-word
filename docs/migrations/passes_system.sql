-- 적용 완료 (MCP apply_migration name='passes_system'): 2026-05-14
-- 이 파일은 참고용 사본. 실제 마이그레이션은 Supabase에 기록되어 있음.

-- 1. passes: 발급된 이용권 1건 = 1행
CREATE TABLE public.passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_code text NOT NULL CHECK (package_code IN ('P5','P15','P30','LEGACY')),
  credits_total int NOT NULL CHECK (credits_total > 0),
  credits_remaining int NOT NULL CHECK (credits_remaining >= 0 AND credits_remaining <= credits_total),
  amount_paid int NOT NULL CHECK (amount_paid >= 0),
  order_id text UNIQUE,
  payment_key text,
  source text NOT NULL DEFAULT 'toss' CHECK (source IN ('toss','legacy_migration','admin')),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','exhausted','expired','refunded'))
);
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
CREATE INDEX passes_user_active_idx ON public.passes (user_id, expires_at) WHERE status = 'active';
CREATE INDEX passes_user_idx ON public.passes (user_id);

-- 2. pass_consumptions: 회 차감 이력
CREATE TABLE public.pass_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_id uuid NOT NULL REFERENCES public.passes(id) ON DELETE RESTRICT,
  download_id uuid REFERENCES public.downloads(id) ON DELETE SET NULL,
  consumed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pass_consumptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX pass_consumptions_user_idx ON public.pass_consumptions (user_id, consumed_at DESC);
CREATE INDEX pass_consumptions_pass_idx ON public.pass_consumptions (pass_id);

-- 3. downloads.points_spent → credits_used
ALTER TABLE public.downloads RENAME COLUMN points_spent TO credits_used;
ALTER TABLE public.downloads ALTER COLUMN credits_used SET DEFAULT 1;

-- 4. issue_pass RPC (idempotent on order_id)
CREATE OR REPLACE FUNCTION public.issue_pass(
  p_user uuid,
  p_package_code text,
  p_credits int,
  p_amount_paid int,
  p_order_id text,
  p_payment_key text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_existing uuid; v_id uuid;
BEGIN
  IF p_credits <= 0 OR p_amount_paid < 0 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;
  IF p_package_code NOT IN ('P5','P15','P30','LEGACY') THEN RAISE EXCEPTION 'INVALID_PACKAGE'; END IF;
  IF p_order_id IS NOT NULL THEN
    SELECT id INTO v_existing FROM passes WHERE order_id = p_order_id LIMIT 1;
    IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;
  END IF;
  INSERT INTO passes (user_id, package_code, credits_total, credits_remaining,
                      amount_paid, order_id, payment_key, source, expires_at)
  VALUES (p_user, p_package_code, p_credits, p_credits, p_amount_paid,
          p_order_id, p_payment_key, 'toss', now() + interval '1 year')
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- 5. consume_credit RPC (FIFO by expires_at)
CREATE OR REPLACE FUNCTION public.consume_credit(
  p_user uuid,
  p_download_id uuid
) RETURNS TABLE(pass_id uuid, remaining_total int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pass_id uuid; v_new_remaining int; v_total int;
BEGIN
  SELECT id INTO v_pass_id FROM passes
    WHERE user_id = p_user AND status = 'active' AND credits_remaining > 0 AND expires_at > now()
    ORDER BY expires_at ASC, purchased_at ASC LIMIT 1 FOR UPDATE;
  IF v_pass_id IS NULL THEN RAISE EXCEPTION 'NO_CREDITS'; END IF;
  UPDATE passes SET credits_remaining = credits_remaining - 1,
    status = CASE WHEN credits_remaining - 1 = 0 THEN 'exhausted' ELSE status END
    WHERE id = v_pass_id RETURNING credits_remaining INTO v_new_remaining;
  INSERT INTO pass_consumptions (user_id, pass_id, download_id) VALUES (p_user, v_pass_id, p_download_id);
  SELECT COALESCE(SUM(credits_remaining), 0)::int INTO v_total
    FROM passes WHERE user_id = p_user AND status = 'active' AND expires_at > now();
  pass_id := v_pass_id; remaining_total := v_total; RETURN NEXT;
END $$;

-- 6. expire_passes RPC
CREATE OR REPLACE FUNCTION public.expire_passes() RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count int;
BEGIN
  UPDATE passes SET status = 'expired' WHERE status = 'active' AND expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

-- 7. 레거시 points → LEGACY pass 백필
INSERT INTO public.passes (user_id, package_code, credits_total, credits_remaining,
                           amount_paid, order_id, source, purchased_at, expires_at)
SELECT user_id, 'LEGACY',
       FLOOR(balance/200)::int,
       FLOOR(balance/200)::int,
       balance,
       'legacy_' || user_id::text,
       'legacy_migration',
       now(),
       now() + interval '1 year'
FROM public.points
WHERE balance >= 200
ON CONFLICT (order_id) DO NOTHING;
