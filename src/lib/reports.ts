import { createServiceClient } from '@/lib/supabase/service';

export const REPORTS_BUCKET = 'reports';

interface SaveReportInput {
  userId: string;
  sessionId: string;
  version: number;
  reportType?: string | null;
  style?: string | null;
  label?: string | null;
  title?: string | null;
  previewHtml?: string | null;
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
  title: string | null;
  preview_html: string | null;
  created_at: string;
}

export interface ProjectSummary {
  sessionId: string;
  title: string | null;
  reportType: string | null;
  style: string | null;
  versionCount: number;
  maxVersion: number;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  version: number;
  label: string | null;
  reportType: string | null;
  style: string | null;
  previewHtml: string | null;
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
        title: input.title ?? null,
        preview_html: input.previewHtml ?? null,
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

/** 사용자의 세션(=프로젝트)별 요약 목록. 최근 수정 순. */
export async function listProjects(userId: string): Promise<ProjectSummary[]> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('reports')
    .select('session_id, version, report_type, style, title, created_at')
    .eq('user_id', userId)
    .order('version', { ascending: true });
  if (error) throw error;

  const bySession = new Map<string, ProjectSummary>();
  for (const r of data ?? []) {
    const sid = r.session_id as string;
    const prev = bySession.get(sid);
    const version = r.version as number;
    const createdAt = r.created_at as string;
    if (!prev) {
      bySession.set(sid, {
        sessionId: sid,
        title: (r.title as string | null) ?? null,
        reportType: (r.report_type as string | null) ?? null,
        style: (r.style as string | null) ?? null,
        versionCount: 1,
        maxVersion: version,
        updatedAt: createdAt,
      });
    } else {
      prev.versionCount += 1;
      if (version >= prev.maxVersion) {
        prev.maxVersion = version;
        prev.style = (r.style as string | null) ?? prev.style;
      }
      // 행은 version 오름차순 — 최신 행의 비어있지 않은 title을 채택
      if (r.title) prev.title = r.title as string;
      if (createdAt > prev.updatedAt) prev.updatedAt = createdAt;
    }
  }

  return Array.from(bySession.values()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0
  );
}

/** 특정 세션(프로젝트)의 전체 버전 목록 — 복원용. version 오름차순. */
export async function getProjectVersions(
  userId: string,
  sessionId: string
): Promise<ProjectVersion[]> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('reports')
    .select('id, version, label, report_type, style, preview_html')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('version', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    version: r.version as number,
    label: (r.label as string | null) ?? null,
    reportType: (r.report_type as string | null) ?? null,
    style: (r.style as string | null) ?? null,
    previewHtml: (r.preview_html as string | null) ?? null,
  }));
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
  reportId: string
): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('downloads')
    .insert({ user_id: userId, report_id: reportId })
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
