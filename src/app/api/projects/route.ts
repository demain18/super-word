import { NextRequest, NextResponse } from 'next/server';
import { listProjects, getProjectVersions } from '@/lib/reports';

// 프로젝트는 브라우저(게스트) 단위 — 로그인 무관하게 x-guest-id로 조회.
// GET /api/projects            → 이 브라우저의 프로젝트(세션) 요약 목록
// GET /api/projects?sessionId=X → 해당 세션의 전체 버전(복원용)
export async function GET(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id');
    if (!guestId) {
      return NextResponse.json({ projects: [] });
    }

    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (sessionId) {
      const versions = await getProjectVersions(guestId, sessionId);
      return NextResponse.json({ sessionId, versions });
    }

    const projects = await listProjects(guestId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Projects API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
