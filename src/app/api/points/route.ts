import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getBalance, listDownloadHistory } from '@/lib/points';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const [balance, history] = await Promise.all([
      getBalance(user.id),
      listDownloadHistory(user.id),
    ]);

    return NextResponse.json({ balance, history });
  } catch (error) {
    console.error('Points API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
