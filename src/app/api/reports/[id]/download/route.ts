import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  findReportById,
  findDownloadForReport,
  createSignedDownloadUrl,
} from '@/lib/reports';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const report = await findReportById(id, user.id);
    if (!report) {
      return NextResponse.json({ error: 'REPORT_NOT_FOUND' }, { status: 404 });
    }

    const existing = await findDownloadForReport(user.id, id);
    if (!existing) {
      return NextResponse.json(
        { error: 'PAYMENT_REQUIRED' },
        { status: 402 }
      );
    }

    const signedUrl = await createSignedDownloadUrl(report.storage_path, 60);
    return NextResponse.json({
      ok: true,
      signedUrl,
      filename: report.filename,
    });
  } catch (error) {
    console.error('Report download API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
