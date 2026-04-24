'use client';

import { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Navbar from '@/components/layout/Navbar';
import PreviewPanel from '@/components/PreviewPanel';
import Step1ReportSelect from '@/components/steps/Step1ReportSelect';
import Step2StyleSelect from '@/components/steps/Step2StyleSelect';
import Step3ContentFill from '@/components/steps/Step3ContentFill';
import { AppState, ReportType, StyleType, Message, VersionEntry } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getTossClientKey } from '@/lib/toss-client';
import type { User } from '@supabase/supabase-js';

const AppLayout = styled.div`
  display: flex;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px 18px;
  gap: 24px;
  min-height: calc(100vh - 104px);

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    padding: 12px;
    gap: 16px;
  }
`;

const OptionsPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  padding-right: 4px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex: none;
    width: 100%;
    max-height: none;
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

const DOWNLOAD_COST = 200;

interface HomeClientProps {
  initialUser: User | null;
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

export default function HomeClient({ initialUser }: HomeClientProps) {
  const [state, setState] = useState<AppState>(initialAppState);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [points, setPoints] = useState<number | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) return;
    setState(initialAppState);
    setPreviewHtml(null);
    setPoints(null);
  }, [user]);

  const refreshPoints = useCallback(async () => {
    try {
      const res = await fetch('/api/points');
      if (!res.ok) return;
      const data = await res.json();
      setPoints(data.balance);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) refreshPoints();
  }, [user, refreshPoints]);

  const handleSignIn = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const handleSignOut = useCallback(async () => {
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
    if (!isAuthenticated || !state.selectedReport) return;

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

  const openTossForDownload = useCallback(
    async (reportId: string) => {
      if (!user) return;
      const clientKey = getTossClientKey();
      try {
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
        const tossPayments = await loadTossPayments(clientKey);
        const payment = tossPayments.payment({ customerKey: user.id });
        const orderId = (crypto?.randomUUID?.() ??
          `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
        const nextUrl = `/?autoDownload=${encodeURIComponent(reportId)}`;
        await payment.requestPayment({
          method: 'CARD',
          amount: { currency: 'KRW', value: DOWNLOAD_COST },
          orderId,
          orderName: '양식 다운로드 1회',
          successUrl: `${window.location.origin}/point/payment/success?next=${encodeURIComponent(nextUrl)}`,
          failUrl: `${window.location.origin}/point/payment/fail`,
          customerName: user.user_metadata?.full_name || user.email || '회원',
          card: {
            useEscrow: false,
            flowMode: 'DEFAULT',
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '결제 요청 실패';
        alert(msg);
      }
    },
    [user]
  );

  const requestDownload = useCallback(
    async (reportId: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId }),
        });
        const data = await res.json();
        if (res.status === 409 && data.error === 'INSUFFICIENT_POINTS') {
          setPoints(typeof data.balance === 'number' ? data.balance : points);
          await openTossForDownload(reportId);
          return false;
        }
        if (!res.ok) {
          throw new Error(data.error || '다운로드 실패');
        }
        triggerBlobDownload(data.signedUrl, data.filename);
        if (typeof data.balance === 'number') setPoints(data.balance);
        return true;
      } catch (e) {
        alert(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
        return false;
      }
    },
    [openTossForDownload, points, triggerBlobDownload]
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
      await refreshPoints();
      await requestDownload(auto);
    })();
  }, [user, refreshPoints, requestDownload]);

  const isStep3 = state.currentStep === 3;

  return (
    <>
      <Navbar
        currentStep={state.currentStep}
        user={user}
        onSignOut={handleSignOut}
        points={points}
      />
      <AppLayout>
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
              isAuthenticated={isAuthenticated}
              onSignIn={handleSignIn}
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
    </>
  );
}
