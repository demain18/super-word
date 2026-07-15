'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import { REPORT_TYPES } from '@/types';
import type { ProjectSummary } from '@/lib/reports';

interface Props {
  projects: ProjectSummary[];
  loading: boolean;
  activeSessionId: string | null;
  onOpen: (sessionId: string) => void;
  onNewProject: () => void;
}

const Sidebar = styled.aside`
  flex: none;
  width: 230px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 500px;
  max-height: 100%;
  min-height: 0;
  align-self: flex-start;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;
    height: auto;
    max-height: 240px;
  }
`;

const NewButton = styled.button`
  flex: none;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${theme.colors.primary};
  color: #1f0f00;
  border: 1px solid ${theme.colors.primaryActive};
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: filter ${theme.transitions.fast};

  &:hover {
    filter: brightness(1.04);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.4);
  }
`;

const Header = styled.div`
  flex: none;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  padding: 2px 4px;
`;

const List = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 8px;
  background: #ffffff;
`;

const Row = styled.button<{ $active: boolean }>`
  text-align: left;
  width: 100%;
  background: ${({ $active }) => ($active ? 'rgba(255,153,0,0.08)' : 'transparent')};
  border: none;
  border-left: 3px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  border-bottom: 1px solid ${theme.colors.cardBorder};
  padding: 9px 11px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background ${theme.transitions.fast};

  &:last-of-type {
    border-bottom: none;
  }
  &:hover {
    background: ${theme.colors.backgroundLight};
  }
  &:focus {
    outline: none;
    background: ${theme.colors.backgroundLight};
  }
`;

const TitleText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaText = styled.span`
  font-size: 11px;
  color: ${theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Empty = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  padding: 14px 12px;
`;

function reportLabel(reportType: string | null): string {
  return REPORT_TYPES.find((r) => r.id === reportType)?.label ?? '문서 양식';
}

function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${mi}`;
}

export default function RecentProjects({
  projects,
  loading,
  activeSessionId,
  onOpen,
  onNewProject,
}: Props) {
  return (
    <Sidebar>
      <NewButton type="button" onClick={onNewProject}>
        + 새 프로젝트 시작하기
      </NewButton>
      <Header>최근 프로젝트</Header>
      <List>
        {loading && projects.length === 0 ? (
          <Empty>불러오는 중…</Empty>
        ) : projects.length === 0 ? (
          <Empty>아직 저장된 프로젝트가 없어요. 양식을 만들면 여기에 기록됩니다.</Empty>
        ) : (
          projects.map((p) => (
            <Row
              key={p.sessionId}
              $active={p.sessionId === activeSessionId}
              type="button"
              onClick={() => onOpen(p.sessionId)}
            >
              <TitleText>{p.title || reportLabel(p.reportType)}</TitleText>
              <MetaText>
                {reportLabel(p.reportType)} · {p.versionCount}/{p.maxVersion} · {formatDate(p.updatedAt)}
              </MetaText>
            </Row>
          ))
        )}
      </List>
    </Sidebar>
  );
}
