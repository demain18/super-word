import 'server-only';

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

export interface TossConfirmResult {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  method?: string;
  status: string;
  approvedAt?: string;
}

export interface TossConfirmError {
  code: string;
  message: string;
}

function getTossSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    throw new Error('TOSS_SECRET_KEY is not configured');
  }
  return key;
}

export async function confirmTossPayment(input: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const secret = getTossSecretKey();

  const authHeader =
    'Basic ' + Buffer.from(`${secret}:`, 'utf-8').toString('base64');

  const res = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const body = (await res.json()) as TossConfirmResult | TossConfirmError;
  if (!res.ok) {
    const err = body as TossConfirmError;
    throw new Error(err.message || `Toss confirm failed (${res.status})`);
  }
  return body as TossConfirmResult;
}
