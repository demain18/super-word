import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  findReportById,
  findDownloadForReport,
  recordDownload,
  deleteDownload,
  createSignedDownloadUrl,
} from '@/lib/reports';
import {
  DOWNLOAD_COST,
  getBalance,
  spendPoints,
  InsufficientPointsError,
} from '@/lib/points';

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
    const reportId = String(body.reportId || '');
    if (!reportId) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const report = await findReportById(reportId, user.id);
    if (!report) {
      return NextResponse.json({ error: 'REPORT_NOT_FOUND' }, { status: 404 });
    }

    const existing = await findDownloadForReport(user.id, reportId);
    let balance: number;

    if (existing) {
      balance = await getBalance(user.id);
    } else {
      const current = await getBalance(user.id);
      if (current < DOWNLOAD_COST) {
        return NextResponse.json(
          {
            error: 'INSUFFICIENT_POINTS',
            balance: current,
            required: DOWNLOAD_COST,
          },
          { status: 409 }
        );
      }
      const downloadId = await recordDownload(user.id, reportId, DOWNLOAD_COST);
      try {
        balance = await spendPoints(user.id, DOWNLOAD_COST, { downloadId });
      } catch (e) {
        await deleteDownload(downloadId).catch(() => {});
        if (e instanceof InsufficientPointsError) {
          return NextResponse.json(
            {
              error: 'INSUFFICIENT_POINTS',
              balance: current,
              required: DOWNLOAD_COST,
            },
            { status: 409 }
          );
        }
        throw e;
      }
    }

    const signedUrl = await createSignedDownloadUrl(report.storage_path, 60);

    return NextResponse.json({
      ok: true,
      signedUrl,
      filename: report.filename,
      balance,
    });
  } catch (error) {
    console.error('Download API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
