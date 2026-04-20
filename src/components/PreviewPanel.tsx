'use client';

import { useMemo } from 'react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { VersionEntry } from '@/types';

interface PreviewPanelProps {
  previewHtml: string | null;
  isLoading: boolean;
  loadingMessage: string;
  versions: VersionEntry[];
  currentVersionIndex: number;
  onVersionChange: (index: number) => void;
  onDownloadVersion: (index: number) => void;
  locked?: boolean;
}

const Panel = styled.div`
  flex: 3;
  background: #ffffff;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 8px;
  box-shadow: ${theme.shadows.card};
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 500px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex: none;
    width: 100%;
    min-height: 400px;
  }
`;

const PanelHeader = styled.div`
  padding: 10px 18px;
  border-bottom: 1px solid ${theme.colors.borderGray};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${theme.colors.backgroundLight};
`;

const VersionNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button<{ $disabled?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid ${theme.colors.borderGray};
  background: ${({ $disabled }) => ($disabled ? '#f5f5f5' : '#ffffff')};
  color: ${({ $disabled }) => ($disabled ? '#ccc' : theme.colors.textPrimary)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  &:hover:not(:disabled) {
    background: ${theme.colors.backgroundLight};
    border-color: #999;
  }
`;

const VersionLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  min-width: 40px;
  text-align: center;
`;

const DownloadBtn = styled.button`
  font-size: 12px;
  color: ${theme.colors.textLink};
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    color: ${theme.colors.textLinkHover};
    background: ${theme.colors.backgroundLight};
  }
`;

const PreviewArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.md};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  min-height: 600px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    min-height: 450px;
  }
`;

const StatusDot = styled.span<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? theme.colors.success : theme.colors.textSecondary)};
  font-size: 12px;
`;

export default function PreviewPanel({
  previewHtml,
  isLoading,
  loadingMessage,
  versions,
  currentVersionIndex,
  onVersionChange,
  onDownloadVersion,
  locked = false,
}: PreviewPanelProps) {
  const displayHtml = versions.length > 0 ? versions[currentVersionIndex]?.previewHtml : previewHtml;

  const blobUrl = useMemo(() => {
    if (!displayHtml) return null;
    const blob = new Blob([displayHtml], { type: 'text/html; charset=utf-8' });
    return URL.createObjectURL(blob);
  }, [displayHtml]);

  const hasVersions = versions.length > 0;
  const canGoBack = currentVersionIndex > 0;
  const canGoForward = currentVersionIndex < versions.length - 1;

  return (
    <Panel>
      <PanelHeader>
        <StatusDot $active={!!displayHtml}>
          {displayHtml ? '● 문서 생성 완료' : '○ 대기 중'}
        </StatusDot>

        {hasVersions && (
          <VersionNav>
            {!locked && (
              <>
                <NavButton
                  $disabled={!canGoBack}
                  disabled={!canGoBack}
                  onClick={() => onVersionChange(currentVersionIndex - 1)}
                >
                  ‹
                </NavButton>
                <VersionLabel>
                  {currentVersionIndex + 1}/{versions.length}
                </VersionLabel>
                <NavButton
                  $disabled={!canGoForward}
                  disabled={!canGoForward}
                  onClick={() => onVersionChange(currentVersionIndex + 1)}
                >
                  ›
                </NavButton>
              </>
            )}
            {locked && (
              <VersionLabel style={{ fontSize: '12px', color: '#565959' }}>
                v{versions[currentVersionIndex]?.version} (고정)
              </VersionLabel>
            )}
            <DownloadBtn onClick={() => onDownloadVersion(currentVersionIndex)}>
              다운로드
            </DownloadBtn>
          </VersionNav>
        )}
      </PanelHeader>
      <PreviewArea>
        {isLoading && <LoadingOverlay message={loadingMessage} />}

        {!displayHtml && !isLoading && (
          <EmptyState>
            <EmptyIcon>📄</EmptyIcon>
            <div>보고서 종류를 선택하면</div>
            <div>여기에 미리보기가 표시됩니다</div>
          </EmptyState>
        )}

        {blobUrl && (
          <PreviewFrame src={blobUrl} title="문서 미리보기" />
        )}
      </PreviewArea>
    </Panel>
  );
}
