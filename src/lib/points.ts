import { createServiceClient } from '@/lib/supabase/service';

export const DOWNLOAD_COST = 200;

export async function getBalance(userId: string): Promise<number> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('points')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data.balance;

  const { error: upsertErr } = await svc
    .from('points')
    .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' });
  if (upsertErr) throw upsertErr;
  return 0;
}

type ChargeResult = { balance: number; duplicated: boolean };

export async function chargePoints(
  userId: string,
  amount: number,
  meta: { orderId: string; paymentKey: string }
): Promise<ChargeResult> {
  const svc = createServiceClient();

  const { data: existing } = await svc
    .from('point_transactions')
    .select('id')
    .eq('order_id', meta.orderId)
    .maybeSingle();

  const { data, error } = await svc.rpc('charge_points', {
    p_user: userId,
    p_amount: amount,
    p_order_id: meta.orderId,
    p_payment_key: meta.paymentKey,
  });
  if (error) throw error;

  return { balance: data as number, duplicated: !!existing };
}

export class InsufficientPointsError extends Error {
  constructor() {
    super('INSUFFICIENT_POINTS');
    this.name = 'InsufficientPointsError';
  }
}

export async function spendPoints(
  userId: string,
  amount: number,
  meta: { downloadId: string }
): Promise<number> {
  const svc = createServiceClient();
  const { data, error } = await svc.rpc('spend_points', {
    p_user: userId,
    p_amount: amount,
  });
  if (error) {
    if (String(error.message || '').includes('INSUFFICIENT_POINTS')) {
      throw new InsufficientPointsError();
    }
    throw error;
  }

  const { error: txErr } = await svc.from('point_transactions').insert({
    user_id: userId,
    kind: 'spend',
    amount,
    download_id: meta.downloadId,
  });
  if (txErr) throw txErr;

  return data as number;
}

export async function listDownloadHistory(userId: string) {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('downloads')
    .select(
      'id, points_spent, created_at, report:reports ( id, filename, version, label, session_id, report_type )'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
