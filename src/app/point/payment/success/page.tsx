import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { confirmTossPayment } from '@/lib/toss';
import { chargePoints } from '@/lib/points';

interface SearchParams {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  next?: string;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount, next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');
  if (!paymentKey || !orderId || !amount) {
    redirect(`/point/payment/fail?message=${encodeURIComponent('결제 정보가 없습니다')}`);
  }

  const amountNumber = Number(amount);
  let errorMsg: string | null = null;

  try {
    const result = await confirmTossPayment({
      paymentKey: paymentKey!,
      orderId: orderId!,
      amount: amountNumber,
    });
    if (result.totalAmount !== amountNumber) {
      throw new Error('결제 금액이 일치하지 않습니다.');
    }
    await chargePoints(user.id, amountNumber, {
      orderId: orderId!,
      paymentKey: paymentKey!,
    });
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : '결제 승인 처리 중 오류';
  }

  if (errorMsg) {
    redirect(`/point/payment/fail?message=${encodeURIComponent(errorMsg)}`);
  }

  const target =
    next && next.startsWith('/') ? next : '/point?charged=1';
  redirect(target);
}
