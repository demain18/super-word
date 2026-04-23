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

interface HomeClientProps {
  initialUser: User | null;
}

export default function HomeClient({ initialUser }: HomeClientProps) {
  const [state, setState] = useState<AppState>({
    currentStep: 1,
    selectedReport: null,
    selectedStyle: null,
    styleHistory: [],
    docxUrl: null,
    isLoading: false,
    loadingMessage: '',
    messages: [],
    sessionId: '',
    versions: [],
    currentVersionIndex: 0,
    lockedVersionIndex: null,
  });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
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
    setState({
      currentStep: 1,
      selectedReport: null,
      selectedStyle: null,
      styleHistory: [],
      docxUrl: null,
      isLoading: false,
      loadingMessage: '',
      messages: [],
      sessionId: '',
      versions: [],
      currentVersionIndex: 0,
      lockedVersionIndex: null,
    });
    setPreviewHtml(null);
  }, [user]);

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
          docxUrl: data.docxUrl,
          previewHtml: data.previewHtml,
          label: getVersionLabel(loadingType, body),
        };

        setState((prev) => {
          const newVersions = [...prev.versions, newVersion];
          return {
            ...prev,
            sessionId: data.sessionId,
            docxUrl: data.docxUrl,
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

  const handleDownloadVersion = (index: number) => {
    const version = state.versions[index];
    if (version?.docxUrl) {
      const link = document.createElement('a');
      link.href = version.docxUrl;
      link.download = `report_v${version.version}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadCurrent = () => {
    handleDownloadVersion(state.currentVersionIndex);
  };

  const isStep3 = state.currentStep === 3;

  return (
    <>
      <Navbar currentStep={state.currentStep} user={user} onSignOut={handleSignOut} />
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
