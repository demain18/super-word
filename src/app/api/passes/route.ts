import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getCreditsSummary, listDownloadHistory } from '@/lib/passes';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const [summary, history] = await Promise.all([
      getCreditsSummary(user.id),
      listDownloadHistory(user.id),
    ]);

    return NextResponse.json({
      totalCredits: summary.totalCredits,
      passes: summary.passes,
      history,
    });
  } catch (error) {
    console.error('Passes API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
