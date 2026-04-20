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
`;

export default function Step1ReportSelect({
  selectedReport,
  onSelect,
  onNext,
}: Step1Props) {
  return (
    <Container>
      <div>
        <Title>보고서 종류 선택</Title>
        <Subtitle>생성할 보고서 종류를 선택해주세요</Subtitle>
      </div>

      {REPORT_TYPES.map((report) => (
        <Card
          key={report.id}
          selected={selectedReport === report.id}
          onClick={() => onSelect(report.id)}
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
          disabled={!selectedReport}
          onClick={onNext}
        >
          양식 생성하기
        </Button>
      </ActionArea>
    </Container>
  );
}
