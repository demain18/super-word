import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// 로그인 직후, 직전 익명 세션이 만든 작업물을 실명 계정으로 이관한다.
// 익명 세션의 access_token을 함께 받아 그 토큰을 검증함으로써 "그 익명 세션의 소유자"임을 확인한다.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: realUser },
    } = await supabase.auth.getUser();
    if (!realUser) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { anonAccessToken } = await req.json();
    if (!anonAccessToken || typeof anonAccessToken !== 'string') {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    // 전달받은 토큰을 Supabase Auth로 검증 → 익명 uid 확인(소유권 증명)
    const {
      data: { user: anonUser },
      error: verifyErr,
    } = await supabase.auth.getUser(anonAccessToken);
    if (verifyErr || !anonUser) {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 });
    }
    if (anonUser.id === realUser.id) {
      return NextResponse.json({ ok: true, moved: false });
    }

    // 서비스 클라이언트로 소유권 이전 (RLS 우회)
    const svc = createServiceClient();
    const from = anonUser.id;
    const to = realUser.id;
    for (const table of ['reports', 'downloads', 'passes', 'pass_consumptions'] as const) {
      const { error } = await svc.from(table).update({ user_id: to }).eq('user_id', from);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, moved: true });
  } catch (error) {
    console.error('Claim API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
