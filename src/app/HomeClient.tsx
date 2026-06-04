'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Navbar from '@/components/layout/Navbar';
import PreviewPanel from '@/components/PreviewPanel';
import Step1ReportSelect from '@/components/steps/Step1ReportSelect';
import Step2StyleSelect from '@/components/steps/Step2StyleSelect';
import Step3ContentFill from '@/components/steps/Step3ContentFill';
import PurchaseDialog from '@/components/PurchaseDialog';
import AuthModal from '@/components/AuthModal';
import RecentProjects from '@/components/RecentProjects';
import { AppState, ReportType, StyleType, Message, VersionEntry } from '@/types';
import type { ProjectSummary } from '@/lib/reports';
import { createClient } from '@/lib/supabase/client';
import { getTossClientKey } from '@/lib/toss-client';
import type { User } from '@supabase/supabase-js';

const AppLayout = styled.div`
  display: flex;
  max-width: 1500px;
  margin: 0 auto;
  padding: 16px 18px;
  gap: 20px;
  height: calc(100vh - 104px);
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    height: auto;
    overflow: visible;
    padding: 12px;
    gap: 16px;
  }
`;

const OptionsPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex: none;
    width: 100%;
    height: auto;
    min-height: 0;
    overflow: visible;
  }
`;

const LOADING_MESSAGES = {
  generate: [
    '양식 구조를 설계하고 있습니다...',
    '테이블과 결재란을 구성하고 있습니다...',
    'Word 문서를 생성하고 있습니다...',
  ],
  style: [
    '스타일을 분석하고 있습니다...',
    '디자인 요소를 적용하고 있습니다...',
    '문서를 수정하고 있습니다...',
  ],
  'custom-feedback': [
    '피드백을 분석하고 있습니다...',
    '요청사항을 반영하고 있습니다...',
    '양식을 재구성하고 있습니다...',
  ],
  content: [
    '입력 정보를 분석하고 있습니다...',
    '보고서 내용을 작성하고 있습니다...',
    '문서를 완성하고 있습니다...',
  ],
};

type LoadingType = keyof typeof LOADING_MESSAGES;

interface HomeClientProps {
  initialUser: User | null;
  initialCredits: number | null;
}

// 로그인 리다이렉트 전후로 작업 상태를 보존하기 위한 로컬 임시저장 키.
const DRAFT_KEY = 'sw_pending_draft';
// 로그인 직후 익명 작업을 실명 계정으로 이관하기 위해 익명 세션 토큰을 잠시 보관하는 키.
const CLAIM_KEY = 'sw_pending_claim';

function isAnonymous(u: User | null): boolean {
  if (!u) return false;
  // 익명→구글 연결 직후 is_anonymous 플래그가 늦게 갱신되는 경우가 있어,
  // 이메일이나 익명이 아닌 identity가 붙어 있으면 실명 회원으로 간주한다.
  const hasRealIdentity =
    !!u.email ||
    (Array.isArray(u.identities) &&
      u.identities.some((i) => i.provider && i.provider !== 'anonymous'));
  if (hasRealIdentity) return false;
  return (u as unknown as { is_anonymous?: boolean }).is_anonymous === true;
}

const initialAppState: AppState = {
  currentStep: 1,
  selectedReport: null,
  selectedStyle: null,
  styleHistory: [],
  isLoading: false,
  loadingMessage: '',
  messages: [],
  sessionId: '',
  versions: [],
  currentVersionIndex: 0,
  lockedVersionIndex: null,
};

export default function HomeClient({ initialUser, initialCredits }: HomeClientProps) {
  const [state, setState] = useState<AppState>(initialAppState);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [credits, setCredits] = useState<number | null>(initialCredits);
  const [purchaseDialog, setPurchaseDialog] = useState<{ open: boolean; reportId?: string }>({ open: false });
  const [authModal, setAuthModal] = useState<{ open: boolean; reportId?: string }>({ open: false });
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // 실명 유저 = 세션이 있고 익명이 아닌 경우. 익명 세션은 UI상 "로그아웃"처럼 취급한다.
  const isRealUser = !!user && !isAnonymous(user);

  // 비동기 이용권 fetch가 로그아웃 이후 늦게 resolve돼 옛 값을 덮어쓰는 레이스를 막기 위한 가드.
  const userRef = useRef<User | null>(initialUser);
  const isRealUserRef = useRef<boolean>(isRealUser);
  useEffect(() => {
    userRef.current = user;
    isRealUserRef.current = isRealUser;
  }, [user, isRealUser]);

  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 비회원도 곧바로 익명 세션을 갖도록 마운트 시 1회 보장한다.
  // 이미 세션(쿠키)이 있으면 ensureSession이 그대로 재사용하므로 anon uid가 유지되어
  // 새로고침해도 최근 프로젝트 목록이 사라지지 않는다.
  useEffect(() => {
    if (initialUser) return;
    void ensureSession();
    // ensureSession은 아래에서 useCallback으로 정의되며 마운트 동안 안정적이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) return;
    setState(initialAppState);
    setPreviewHtml(null);
    setCredits(null);
  }, [user]);

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/passes');
      if (!res.ok) return;
      const data = await res.json();
      // 요청이 날아간 사이 로그아웃됐다면 옛 값을 반영하지 않는다.
      if (!userRef.current) return;
      setCredits(data.totalCredits);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) refreshCredits();
  }, [user, refreshCredits]);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        setProjects([]);
        return;
      }
      const data = await res.json();
      if (!userRef.current) return;
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch {
      // ignore
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // 로그인/익명 세션이 있으면 목록을 불러오고, 새 버전이 생길 때마다 갱신한다.
  useEffect(() => {
    if (user) fetchProjects();
    else setProjects([]);
  }, [user, state.versions.length, fetchProjects]);

  // 좌측 "최근 프로젝트"에서 세션 선택 → 그 세션의 버전들을 복원한다.
  const handleOpenProject = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/projects?sessionId=${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error('프로젝트를 불러오지 못했습니다.');
      const data = await res.json();
      const rows = (data.versions || []) as Array<{
        id: string;
        version: number;
        label: string | null;
        reportType: string | null;
        style: string | null;
        previewHtml: string | null;
      }>;
      if (!rows.length) return;

      const versions: VersionEntry[] = rows.map((r) => ({
        version: r.version,
        reportId: r.id,
        previewHtml: r.previewHtml ?? '',
        label: r.label ?? `버전 ${r.version}`,
      }));
      const reportType = (rows.find((r) => r.reportType)?.reportType ?? null) as ReportType | null;
      const styles = rows.map((r) => r.style).filter(Boolean) as StyleType[];
      const latestStyle = styles.length ? styles[styles.length - 1] : null;
      const lastIdx = versions.length - 1;
      // 내용 작성까지 진행됐던 프로젝트는 3단계(내용)로, 그 외엔 2단계(스타일)로 복원한다.
      const reachedContent = rows.some((r) => (r.label ?? '').includes('내용'));
      const restoreStep: 1 | 2 | 3 = reachedContent ? 3 : 2;

      setState({
        ...initialAppState,
        currentStep: restoreStep,
        selectedReport: reportType,
        selectedStyle: latestStyle,
        styleHistory: latestStyle ? [latestStyle] : [],
        sessionId,
        versions,
        currentVersionIndex: lastIdx,
        lockedVersionIndex: restoreStep === 3 ? lastIdx : null,
      });
      setPreviewHtml(versions[lastIdx].previewHtml || null);
    } catch (e) {
      alert(e instanceof Error ? e.message : '프로젝트를 불러오지 못했습니다.');
    }
  }, []);

  const handleNewProject = useCallback(() => {
    setState(initialAppState);
    setPreviewHtml(null);
  }, []);

  // 세션이 없으면 익명 세션을 발급한다. 로그아웃 방문자도 문서를 생성·저장할 수 있게 한다.
  const ensureSession = useCallback(async (): Promise<boolean> => {
    const supabase = createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (u) return true;
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('anonymous sign-in failed', error);
      return false;
    }
    return true;
  }, []);

  // 로그인 의사: 진행 중 작업과(복원용), 현재 익명 세션 토큰(이관용)을 stash한 뒤 구글 로그인으로 이동.
  // 로그인은 일반 OAuth로 처리하고, 복귀 후 /api/claim으로 익명 작업을 실명 계정에 합친다.
  // (linkIdentity는 이미 그 구글 계정이 존재하면 충돌하므로 사용하지 않는다.)
  const handleLoginIntent = useCallback(
    async (pendingReportId?: string) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ state, previewHtml, pendingReportId: pendingReportId ?? null })
        );
        if (u && isAnonymous(u) && session?.access_token) {
          window.localStorage.setItem(
            CLAIM_KEY,
            JSON.stringify({ token: session.access_token })
          );
        }
      } catch {
        // 저장 실패는 무시 — 로그인 자체는 진행
      }
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    },
    [state, previewHtml]
  );

  const handleSignOut = useCallback(async () => {
    // 로그아웃 즉시 UI를 로그아웃 상태로 전환(잔여 이용권 수치가 잠깐 남는 현상 방지).
    // userRef도 동기적으로 비워, 진행 중이던 fetch가 늦게 돌아와도 옛 값을 덮지 못하게 한다.
    userRef.current = null;
    setUser(null);
    setCredits(null);
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const animateLoadingMessages = useCallback(
    (type: LoadingType) => {
      const msgs = LOADING_MESSAGES[type];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % msgs.length;
        setState((prev) => ({ ...prev, loadingMessage: msgs[i] }));
      }, 3000);
      return () => clearInterval(interval);
    },
    []
  );

  const callGenerateApi = useCallback(
    async (body: Record<string, unknown>, loadingType: LoadingType) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        loadingMessage: LOADING_MESSAGES[loadingType][0],
      }));

      const cleanup = animateLoadingMessages(loadingType);

      try {
        const currentVersion = state.versions.length;
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...body,
            sessionId: state.sessionId || undefined,
            version: currentVersion,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '서버 오류가 발생했습니다');
        }

        const newVersion: VersionEntry = {
          version: data.version,
          reportId: data.reportId,
          previewHtml: data.previewHtml,
          label: getVersionLabel(loadingType, body),
        };

        setState((prev) => {
          const newVersions = [...prev.versions, newVersion];
          return {
            ...prev,
            sessionId: data.sessionId,
            isLoading: false,
            loadingMessage: '',
            versions: newVersions,
            currentVersionIndex: newVersions.length - 1,
          };
        });

        if (data.previewHtml) {
          setPreviewHtml(data.previewHtml);
        }

        return data;
      } catch (err) {
        console.error(err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          loadingMessage: '',
        }));
        alert(
          err instanceof Error
            ? err.message
            : '오류가 발생했습니다. 다시 시도해주세요.'
        );
        return null;
      } finally {
        cleanup();
      }
    },
    [state.sessionId, state.versions.length, animateLoadingMessages]
  );

  const getVersionLabel = (type: LoadingType, body: Record<string, unknown>): string => {
    switch (type) {
      case 'generate':
        return '기본 양식';
      case 'style': {
        const styleLabels: Record<string, string> = {
          corporate: '대기업',
          'global-startup': '스타트업',
          government: '정부',
        };
        return `${styleLabels[body.style as string] || ''} 스타일`;
      }
      case 'custom-feedback':
        return '피드백 반영';
      case 'content':
        return '내용 작성';
      default:
        return '수정';
    }
  };

  const handleReportSelect = (type: ReportType) => {
    setState((prev) => ({ ...prev, selectedReport: type }));
  };

  const handleStep1Next = async () => {
    if (!state.selectedReport) return;

    // 로그인 없이도 진행 — 세션이 없으면 익명 세션을 먼저 발급한다.
    const ok = await ensureSession();
    if (!ok) {
      alert('세션을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const result = await callGenerateApi(
      { action: 'generate', reportType: state.selectedReport },
      'generate'
    );

    if (result) {
      setState((prev) => ({ ...prev, currentStep: 2 }));
    }
  };

  const handleStyleSelect = async (style: StyleType) => {
    const result = await callGenerateApi(
      {
        action: 'style',
        reportType: state.selectedReport,
        style,
        styleHistory: state.styleHistory,
      },
      'style'
    );

    if (result) {
      setState((prev) => ({
        ...prev,
        selectedStyle: style,
        styleHistory: [...prev.styleHistory, style],
      }));
    }
  };

  const handleCustomFeedback = async (feedback: string) => {
    await callGenerateApi(
      {
        action: 'custom-feedback',
        reportType: state.selectedReport,
        customFeedback: feedback,
        currentStyle: state.selectedStyle,
      },
      'custom-feedback'
    );
  };

  const handleStep2Next = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 3,
      lockedVersionIndex: prev.currentVersionIndex,
    }));
  };

  const handleBack = (toStep: 1 | 2) => {
    if (toStep <= 2) {
      setState((prev) => ({
        ...prev,
        currentStep: toStep,
        lockedVersionIndex: null,
        messages: [],
      }));
    }
  };

  const handleSendMessage = async (message: string) => {
    const newMessages: Message[] = [
      ...state.messages,
      { role: 'user', content: message },
    ];
    setState((prev) => ({ ...prev, messages: newMessages }));

    const result = await callGenerateApi(
      {
        action: 'content',
        reportType: state.selectedReport,
        userInput: message,
        currentStyle: state.selectedStyle,
      },
      'content'
    );

    if (result?.message) {
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: result.message },
        ],
      }));
    }
  };

  const handleVersionChange = (index: number) => {
    if (state.currentStep === 3) return;
    setState((prev) => ({ ...prev, currentVersionIndex: index }));
  };

  const triggerBlobDownload = useCallback((signedUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = signedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const requestDownload = useCallback(
    async (reportId: string): Promise<boolean> => {
      // 실명 로그인 전에는 다운로드 대신 로그인 모달을 띄운다(익명으로 잘못 결제 방지).
      if (!isRealUserRef.current) {
        setAuthModal({ open: true, reportId });
        return false;
      }
      try {
        const res = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId }),
        });
        const data = await res.json();
        if (res.status === 409 && data.error === 'NO_CREDITS') {
          setCredits(typeof data.creditsRemaining === 'number' ? data.creditsRemaining : 0);
          setPurchaseDialog({ open: true, reportId });
          return false;
        }
        if (!res.ok) {
          throw new Error(data.error || '다운로드 실패');
        }
        triggerBlobDownload(data.signedUrl, data.filename);
        if (typeof data.creditsRemaining === 'number') setCredits(data.creditsRemaining);
        return true;
      } catch (e) {
        alert(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
        return false;
      }
    },
    [triggerBlobDownload]
  );

  const handleDownloadVersion = (index: number) => {
    const version = state.versions[index];
    if (version?.reportId) {
      requestDownload(version.reportId);
    }
  };

  const handleDownloadCurrent = () => {
    handleDownloadVersion(state.currentVersionIndex);
  };

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const auto = url.searchParams.get('autoDownload');
    if (!auto) return;
    url.searchParams.delete('autoDownload');
    window.history.replaceState({}, '', url.toString());
    (async () => {
      await refreshCredits();
      await requestDownload(auto);
    })();
  }, [user, refreshCredits, requestDownload]);

  // 로그인 리다이렉트 복귀: 실명 유저가 되면 ①익명 작업을 실명 계정으로 이관 →
  // ②목록 갱신 → ③stash한 작업 복원 + 누르던 다운로드 재개(이용권 없으면 구매 다이얼로그).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || !isRealUser) return;
    if (typeof window === 'undefined') return;
    restoredRef.current = true;

    void (async () => {
      // ① 익명 작업 이관
      let claimRaw: string | null = null;
      try {
        claimRaw = window.localStorage.getItem(CLAIM_KEY);
      } catch {
        claimRaw = null;
      }
      if (claimRaw) {
        try {
          window.localStorage.removeItem(CLAIM_KEY);
          const { token } = JSON.parse(claimRaw) as { token?: string };
          if (token) {
            await fetch('/api/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ anonAccessToken: token }),
            });
          }
        } catch {
          // 이관 실패는 치명적이지 않음 — 목록만 일부 누락될 수 있음
        }
      }

      // ② 이관 반영된 목록·이용권 갱신
      await fetchProjects();
      await refreshCredits();

      // ③ 작업 상태 복원 + 다운로드 재개
      let draftRaw: string | null = null;
      try {
        draftRaw = window.localStorage.getItem(DRAFT_KEY);
        if (draftRaw) window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        draftRaw = null;
      }
      if (!draftRaw) return;
      try {
        const draft = JSON.parse(draftRaw) as {
          state?: AppState;
          previewHtml?: string | null;
          pendingReportId?: string | null;
        };
        if (draft.state) setState(draft.state);
        if (typeof draft.previewHtml === 'string') setPreviewHtml(draft.previewHtml);
        if (draft.pendingReportId) await requestDownload(draft.pendingReportId);
      } catch {
        // 손상된 draft는 무시
      }
    })();
  }, [isRealUser, fetchProjects, refreshCredits, requestDownload]);

  const isStep3 = state.currentStep === 3;
  let tossClientKey = '';
  try {
    tossClientKey = getTossClientKey();
  } catch {
    // env not configured; dialog renders disabled
  }

  return (
    <>
      <Navbar
        currentStep={state.currentStep}
        user={isRealUser ? user : null}
        onSignOut={handleSignOut}
        onSignIn={() => handleLoginIntent()}
        credits={isRealUser ? credits : null}
      />
      <AppLayout>
        <RecentProjects
          projects={projects}
          loading={projectsLoading}
          activeSessionId={state.sessionId || null}
          onOpen={handleOpenProject}
          onNewProject={handleNewProject}
        />
        <PreviewPanel
          previewHtml={previewHtml}
          isLoading={state.isLoading}
          loadingMessage={state.loadingMessage}
          versions={state.versions}
          currentVersionIndex={state.currentVersionIndex}
          onVersionChange={handleVersionChange}
          onDownloadVersion={handleDownloadVersion}
          locked={isStep3}
        />
        <OptionsPanel>
          {state.currentStep === 1 && (
            <Step1ReportSelect
              selectedReport={state.selectedReport}
              onSelect={handleReportSelect}
              onNext={handleStep1Next}
              isAuthenticated
              onSignIn={() => handleLoginIntent()}
            />
          )}
          {state.currentStep === 2 && (
            <Step2StyleSelect
              onStyleSelect={handleStyleSelect}
              onCustomFeedback={handleCustomFeedback}
              onNext={handleStep2Next}
              onBack={() => handleBack(1)}
              onDownload={handleDownloadCurrent}
              isLoading={state.isLoading}
            />
          )}
          {state.currentStep === 3 && (
            <Step3ContentFill
              messages={state.messages}
              onSendMessage={handleSendMessage}
              onBack={() => handleBack(2)}
              onDownload={handleDownloadCurrent}
              isLoading={state.isLoading}
            />
          )}
        </OptionsPanel>
      </AppLayout>
      {isRealUser && user && tossClientKey && (
        <PurchaseDialog
          open={purchaseDialog.open}
          user={user}
          tossClientKey={tossClientKey}
          reportId={purchaseDialog.reportId}
          onClose={() => setPurchaseDialog({ open: false })}
        />
      )}
      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ open: false })}
        onGoogle={() => handleLoginIntent(authModal.reportId)}
      />
    </>
  );
}
