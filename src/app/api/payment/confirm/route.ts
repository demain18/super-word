import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { confirmTossPayment } from '@/lib/toss';
import { chargePoints } from '@/lib/points';

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
    if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const result = await confirmTossPayment({ paymentKey, orderId, amount });
    if (result.totalAmount !== amount) {
      return NextResponse.json({ error: 'AMOUNT_MISMATCH' }, { status: 400 });
    }

    const { balance, duplicated } = await chargePoints(user.id, amount, {
      orderId,
      paymentKey,
    });

    return NextResponse.json({ ok: true, balance, duplicated });
  } catch (error) {
    console.error('Payment confirm error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
