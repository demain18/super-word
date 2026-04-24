-- Atomic point charge RPC.
-- Apply via Supabase Dashboard → SQL Editor.
--
-- Returns the new balance. If the order_id has already been charged,
-- returns the current balance without re-crediting (idempotent).

create or replace function public.charge_points(
  p_user uuid,
  p_amount integer,
  p_order_id text,
  p_payment_key text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_exists uuid;
begin
  if p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Idempotency: if this order was already charged, return current balance.
  select id into v_exists
  from point_transactions
  where order_id = p_order_id
  limit 1;

  if v_exists is not null then
    select balance into v_balance from points where user_id = p_user;
    return coalesce(v_balance, 0);
  end if;

  -- Ensure row exists, then atomically add.
  insert into points (user_id, balance)
  values (p_user, 0)
  on conflict (user_id) do nothing;

  update points
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user
  returning balance into v_balance;

  insert into point_transactions (user_id, kind, amount, order_id, payment_key)
  values (p_user, 'charge', p_amount, p_order_id, p_payment_key);

  return v_balance;
end;
$$;
