import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { confirmTossPayment } from '@/lib/toss';
import { issuePass } from '@/lib/passes';
import { PACKAGES, isPackageCode } from '@/lib/passes-config';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const paymentKey = String(body.paymentKey || '');
    const orderId = String(body.orderId || '');
    const amount = Number(body.amount);
    const packageCode = body.packageCode;
    if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }
    if (!isPackageCode(packageCode)) {
      return NextResponse.json({ error: 'INVALID_PACKAGE' }, { status: 400 });
    }
    const pkg = PACKAGES[packageCode];
    if (amount !== pkg.amount) {
      return NextResponse.json({ error: 'AMOUNT_MISMATCH' }, { status: 400 });
    }

    const result = await confirmTossPayment({ paymentKey, orderId, amount });
    if (result.totalAmount !== amount) {
      return NextResponse.json({ error: 'AMOUNT_MISMATCH' }, { status: 400 });
    }

    const { passId, duplicated } = await issuePass(user.id, packageCode, {
      orderId,
      paymentKey,
      amount,
    });

    return NextResponse.json({ ok: true, passId, duplicated });
  } catch (error) {
    console.error('Payment confirm error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
