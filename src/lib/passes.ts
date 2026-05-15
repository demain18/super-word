import { createServiceClient } from '@/lib/supabase/service';
import { PACKAGES, type PackageCode } from '@/lib/passes-config';

export type { PackageCode } from '@/lib/passes-config';

export interface PassRow {
  id: string;
  packageCode: string;
  creditsTotal: number;
  creditsRemaining: number;
  purchasedAt: string;
  expiresAt: string;
  status: 'active' | 'exhausted' | 'expired' | 'refunded';
}

export interface CreditsSummary {
  totalCredits: number;
  passes: PassRow[];
}

export class NoCreditsError extends Error {
  constructor() {
    super('NO_CREDITS');
    this.name = 'NoCreditsError';
  }
}

export async function getCreditsSummary(userId: string): Promise<CreditsSummary> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('passes')
    .select('id, package_code, credits_total, credits_remaining, purchased_at, expires_at, status')
    .eq('user_id', userId)
    .order('expires_at', { ascending: true });
  if (error) throw error;

  const now = Date.now();
  const rows = (data ?? []).map((r) => ({
    id: r.id as string,
    packageCode: r.package_code as string,
    creditsTotal: r.credits_total as number,
    creditsRemaining: r.credits_remaining as number,
    purchasedAt: r.purchased_at as string,
    expiresAt: r.expires_at as string,
    status: r.status as PassRow['status'],
  }));

  const totalCredits = rows
    .filter((p) => p.status === 'active' && p.creditsRemaining > 0 && new Date(p.expiresAt).getTime() > now)
    .reduce((sum, p) => sum + p.creditsRemaining, 0);

  return { totalCredits, passes: rows };
}

export interface IssuePassResult {
  passId: string;
  duplicated: boolean;
}

export async function issuePass(
  userId: string,
  packageCode: PackageCode,
  meta: { orderId: string; paymentKey: string; amount: number }
): Promise<IssuePassResult> {
  const pkg = PACKAGES[packageCode];
  if (!pkg) throw new Error('INVALID_PACKAGE');
  if (meta.amount !== pkg.amount) throw new Error('AMOUNT_MISMATCH');

  const svc = createServiceClient();

  const { data: existing } = await svc
    .from('passes')
    .select('id')
    .eq('order_id', meta.orderId)
    .maybeSingle();

  const { data, error } = await svc.rpc('issue_pass', {
    p_user: userId,
    p_package_code: packageCode,
    p_credits: pkg.credits,
    p_amount_paid: pkg.amount,
    p_order_id: meta.orderId,
    p_payment_key: meta.paymentKey,
  });
  if (error) throw error;

  return { passId: data as string, duplicated: !!existing };
}

export interface ConsumeCreditResult {
  passId: string;
  remainingTotal: number;
}

export async function consumeCredit(
  userId: string,
  meta: { downloadId: string }
): Promise<ConsumeCreditResult> {
  const svc = createServiceClient();
  const { data, error } = await svc.rpc('consume_credit', {
    p_user: userId,
    p_download_id: meta.downloadId,
  });
  if (error) {
    if (String(error.message || '').includes('NO_CREDITS')) {
      throw new NoCreditsError();
    }
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    passId: (row?.pass_id ?? '') as string,
    remainingTotal: (row?.remaining_total ?? 0) as number,
  };
}

export interface DownloadHistoryRow {
  id: string;
  credits_used: number;
  created_at: string;
  report:
    | {
        id: string;
        filename: string;
        version: number;
        label: string | null;
        session_id: string;
        report_type: string | null;
      }
    | Array<{
        id: string;
        filename: string;
        version: number;
        label: string | null;
        session_id: string;
        report_type: string | null;
      }>
    | null;
}

export async function listDownloadHistory(userId: string): Promise<DownloadHistoryRow[]> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('downloads')
    .select(
      'id, credits_used, created_at, report:reports ( id, filename, version, label, session_id, report_type )'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DownloadHistoryRow[];
}
