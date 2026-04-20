'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { STYLE_OPTIONS, StyleType } from '@/types';

interface Step2Props {
  onStyleSelect: (style: StyleType) => void;
  onCustomFeedback: (feedback: string) => void;
  onNext: () => void;
  onBack: () => void;
  onDownload: () => void;
  isLoading: boolean;
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

const Divider = styled.div`
  border-top: 1px solid ${theme.colors.borderGray};
  padding-top: 16px;
  margin-top: 4px;
`;

const FeedbackArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeedbackLabel = styled.label`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

const TextArea = styled.textarea`
  border: 1px solid #888c8c;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  &:focus {
    border-color: #e77600;
    box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionArea = styled.div`
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.borderGray};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textLink};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  padding: 0;
  &:hover {
    color: ${theme.colors.textLinkHover};
    text-decoration: underline;
  }
`;

export default function Step2StyleSelect({
  onStyleSelect,
  onCustomFeedback,
  onNext,
  onBack,
  onDownload,
  isLoading,
}: Step2Props) {
  const [customFeedback, setCustomFeedback] = useState('');

  const handleCustomSubmit = () => {
    if (customFeedback.trim()) {
      onCustomFeedback(customFeedback.trim());
      setCustomFeedback('');
    }
  };

  return (
    <Container>
      <div>
        <BackButton onClick={onBack} disabled={isLoading}>← 보고서 선택으로 돌아가기</BackButton>
        <Title style={{ marginTop: '8px' }}>양식 스타일 선택</Title>
        <Subtitle>
          원하는 스타일을 선택하면 양식이 수정됩니다. 여러 번 클릭하면 해당 스타일이
          점진적으로 강화됩니다.
        </Subtitle>
      </div>

      {STYLE_OPTIONS.map((style) => (
        <Card
          key={style.id}
          onClick={() => !isLoading && onStyleSelect(style.id)}
          hoverable={!isLoading}
        >
          <CardTitle>{style.label}</CardTitle>
          <CardDesc>{style.description}</CardDesc>
        </Card>
      ))}

      <Divider>
        <FeedbackArea>
          <FeedbackLabel>직접 피드백 작성</FeedbackLabel>
          <TextArea
            placeholder="원하는 스타일을 직접 설명해주세요. 예: '더 깔끔하고 미니멀한 디자인으로', '표를 더 크게'"
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            disabled={isLoading}
          />
          <ButtonGroup>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCustomSubmit}
              disabled={!customFeedback.trim() || isLoading}
            >
              피드백 적용
            </Button>
          </ButtonGroup>
        </FeedbackArea>
      </Divider>

      <ActionArea>
        <Button
          variant="cta"
          fullWidth
          size="lg"
          onClick={onNext}
          disabled={isLoading}
        >
          다음 단계로 넘어가기
        </Button>
        <Button
          variant="ghost"
          fullWidth
          size="md"
          onClick={onDownload}
          disabled={isLoading}
        >
          현재 양식 다운로드
        </Button>
      </ActionArea>
    </Container>
  );
}
