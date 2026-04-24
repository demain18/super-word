import { createServiceClient } from '@/lib/supabase/service';

export const REPORTS_BUCKET = 'reports';

interface SaveReportInput {
  userId: string;
  sessionId: string;
  version: number;
  reportType?: string | null;
  style?: string | null;
  label?: string | null;
  buffer: Buffer;
  filename: string;
}

export interface ReportRow {
  id: string;
  user_id: string;
  session_id: string;
  version: number;
  storage_path: string;
  filename: string;
  report_type: string | null;
  style: string | null;
  label: string | null;
  created_at: string;
}

export async function saveReport(input: SaveReportInput): Promise<ReportRow> {
  const svc = createServiceClient();
  const storagePath = `${input.userId}/${input.sessionId}/${input.filename}`;

  const { error: uploadErr } = await svc.storage
    .from(REPORTS_BUCKET)
    .upload(storagePath, input.buffer, {
      contentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: true,
    });
  if (uploadErr) throw uploadErr;

  const { data, error } = await svc
    .from('reports')
    .upsert(
      {
        user_id: input.userId,
        session_id: input.sessionId,
        version: input.version,
        report_type: input.reportType ?? null,
        style: input.style ?? null,
        label: input.label ?? null,
        storage_path: storagePath,
        filename: input.filename,
      },
      { onConflict: 'user_id,session_id,version' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as ReportRow;
}

export async function findReport(
  userId: string,
  sessionId: string,
  version: number
): Promise<ReportRow | null> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .eq('version', version)
    .maybeSingle();
  if (error) throw error;
  return (data as ReportRow | null) ?? null;
}

export async function findReportById(
  reportId: string,
  userId: string
): Promise<ReportRow | null> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ReportRow | null) ?? null;
}

export async function findDownloadForReport(
  userId: string,
  reportId: string
): Promise<{ id: string } | null> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('downloads')
    .select('id')
    .eq('user_id', userId)
    .eq('report_id', reportId)
    .maybeSingle();
  if (error) throw error;
  return (data as { id: string } | null) ?? null;
}

export async function recordDownload(
  userId: string,
  reportId: string,
  pointsSpent: number
): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('downloads')
    .insert({ user_id: userId, report_id: reportId, points_spent: pointsSpent })
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function deleteDownload(downloadId: string): Promise<void> {
  const svc = createServiceClient();
  const { error } = await svc.from('downloads').delete().eq('id', downloadId);
  if (error) throw error;
}

export async function createSignedDownloadUrl(
  storagePath: string,
  expiresInSeconds = 60
): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds, {
      download: storagePath.split('/').pop() || 'report.docx',
    });
  if (error) throw error;
  return data.signedUrl;
}
