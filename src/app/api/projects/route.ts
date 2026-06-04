import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { listProjects, getProjectVersions } from '@/lib/reports';

// GET /api/projects            → 현재 사용자의 프로젝트(세션) 요약 목록
// GET /api/projects?sessionId=X → 해당 세션의 전체 버전(복원용)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (sessionId) {
      const versions = await getProjectVersions(user.id, sessionId);
      return NextResponse.json({ sessionId, versions });
    }

    const projects = await listProjects(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Projects API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
