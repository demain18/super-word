import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { confirmTossPayment } from '@/lib/toss';
import { issuePass } from '@/lib/passes';
import { PACKAGES, isPackageCode } from '@/lib/passes-config';

interface SearchParams {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  packageCode?: string;
  next?: string;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount, packageCode, next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');
  if (!paymentKey || !orderId || !amount || !packageCode) {
    redirect(`/point/payment/fail?message=${encodeURIComponent('결제 정보가 누락되었습니다')}`);
  }
  if (!isPackageCode(packageCode!)) {
    redirect(`/point/payment/fail?message=${encodeURIComponent('잘못된 이용권 코드입니다')}`);
  }

  const amountNumber = Number(amount);
  const pkg = PACKAGES[packageCode as 'P5' | 'P15' | 'P30'];
  let errorMsg: string | null = null;

  try {
    if (amountNumber !== pkg.amount) {
      throw new Error('결제 금액이 이용권 가격과 일치하지 않습니다.');
    }
    const result = await confirmTossPayment({
      paymentKey: paymentKey!,
      orderId: orderId!,
      amount: amountNumber,
    });
    if (result.totalAmount !== amountNumber) {
      throw new Error('결제 금액 검증에 실패했습니다.');
    }
    await issuePass(user.id, pkg.code, {
      orderId: orderId!,
      paymentKey: paymentKey!,
      amount: amountNumber,
    });
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : '결제 승인 처리 중 오류가 발생했습니다.';
  }

  if (errorMsg) {
    redirect(`/point/payment/fail?message=${encodeURIComponent(errorMsg)}`);
  }

  const target = next && next.startsWith('/') ? next : '/point?purchased=1';
  redirect(target);
}
