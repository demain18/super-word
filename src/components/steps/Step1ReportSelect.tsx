'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { REPORT_TYPES, ReportType } from '@/types';

interface Step1Props {
  selectedReport: ReportType | null;
  onSelect: (type: ReportType) => void;
  onNext: () => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const CardIcon = styled.span`
  font-size: 28px;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const CardDesc = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const ActionArea = styled.div`
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.borderGray};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GoogleButton = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  color: #0F1111;
  border: 1px solid #D5D9D9;
  border-radius: 8px;
  padding: 11px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all ${theme.transitions.fast};

  &:hover {
    background: #F7FAFA;
    border-color: #B6B6B6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
  }
`;

const LoginHint = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.2 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.5 5.5C41.9 36.2 44 30.6 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

export default function Step1ReportSelect({
  selectedReport,
  onSelect,
  onNext,
  isAuthenticated,
  onSignIn,
}: Step1Props) {
  return (
    <Container>
      <div>
        <Title>보고서 종류 선택</Title>
        <Subtitle>
          {isAuthenticated
            ? '생성할 보고서 종류를 선택해주세요'
            : '서비스를 이용하려면 먼저 로그인해주세요'}
        </Subtitle>
      </div>

      {REPORT_TYPES.map((report) => (
        <Card
          key={report.id}
          selected={selectedReport === report.id}
          onClick={() => onSelect(report.id)}
          disabled={!isAuthenticated}
        >
          <CardContent>
            <CardIcon>{report.icon}</CardIcon>
            <CardInfo>
              <CardTitle>{report.label}</CardTitle>
              <CardDesc>{report.description}</CardDesc>
            </CardInfo>
          </CardContent>
        </Card>
      ))}

      <ActionArea>
        <Button
          variant="cta"
          fullWidth
          size="lg"
          disabled={!isAuthenticated || !selectedReport}
          onClick={onNext}
        >
          양식 생성하기
        </Button>

        {!isAuthenticated && (
          <>
            <GoogleButton type="button" onClick={onSignIn}>
              <GoogleIcon />
              Google 로그인으로 시작하기
            </GoogleButton>
            <LoginHint>로그인과 회원가입이 한번에 진행됩니다</LoginHint>
          </>
        )}
      </ActionArea>
    </Container>
  );
}
