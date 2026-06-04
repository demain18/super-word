'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { theme } from '@/styles/theme';
import Button from '@/components/common/Button';
import { Message } from '@/types';

interface Step3Props {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBack: () => void;
  onDownload: () => void;
  isLoading: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: ${theme.colors.backgroundLight};
  border: 1px solid ${theme.colors.borderGray};
  border-radius: 8px;
  min-height: 200px;
  max-height: 400px;
`;

// iMessage처럼 모서리에서 통통 튀어나오는 등장(살짝 오버슈트하는 bounce easing).
const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.4); }
  100% { opacity: 1; transform: scale(1); }
`;

const MessageBubble = styled.div<{ $role: 'user' | 'assistant'; $delayed?: boolean }>`
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  align-self: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  background: ${({ $role }) =>
    $role === 'user' ? '#232F3E' : '#FFFFFF'};
  color: ${({ $role }) =>
    $role === 'user' ? '#FFFFFF' : theme.colors.textPrimary};
  border: 1px solid
    ${({ $role }) => ($role === 'user' ? 'rgba(255, 255, 255, 0.22)' : theme.colors.borderGray)};
  box-shadow: ${({ $role }) =>
    $role === 'assistant' ? theme.shadows.card : 'none'};
  white-space: pre-wrap;
  position: relative;
  transform-origin: ${({ $role }) => ($role === 'user' ? 'bottom right' : 'bottom left')};
  animation: ${popIn} 300ms cubic-bezier(0.18, 0.89, 0.32, 1.3) both;
  animation-delay: ${({ $delayed }) => ($delayed ? '300ms' : '0ms')};

  /* 말풍선 꼬리: 박스와 동일한 1px 외곽선(테두리 삼각형 + 살짝 작은 채움 삼각형). 얇게. */
  &::before {
    content: '';
    position: absolute;
    bottom: 7px;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    ${({ $role }) =>
      $role === 'user'
        ? 'right: -9px; border-left: 8px solid rgba(255, 255, 255, 0.22);'
        : `left: -9px; border-right: 8px solid ${theme.colors.borderGray};`}
  }
  /* 채움 삼각형의 base를 박스 안쪽으로 겹쳐(±2px) 박스 테두리선을 덮어 구분선이 안 보이게. */
  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    ${({ $role }) =>
      $role === 'user'
        ? 'right: -6px; border-left: 8px solid #232F3E;'
        : 'left: -6px; border-right: 8px solid #FFFFFF;'}
  }
`;

const dotPulse = keyframes`
  0%, 75%, 100% { opacity: 0.25; }
  35% { opacity: 1; }
`;
// 점 세 개를 항상 렌더하고 opacity만 순차로 변화 → 박스 가로폭이 고정된다(가변 X).
const Typing = styled.span`
  margin-left: 4px;
  letter-spacing: 1px;
  span {
    display: inline-block;
    animation: ${dotPulse} 1.2s infinite both;
  }
  span:nth-of-type(2) {
    animation-delay: 0.18s;
  }
  span:nth-of-type(3) {
    animation-delay: 0.36s;
  }
`;

const InputArea = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: 1px solid #888c8c;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  min-height: 60px;
  max-height: 120px;
  font-family: inherit;
  &:focus {
    border-color: #e77600;
    box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
  }
`;

const ActionArea = styled.div`
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.borderGray};
`;

const HelpText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
  line-height: 1.5;
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

export default function Step3ContentFill({
  messages,
  onSendMessage,
  onBack,
  onDownload,
  isLoading,
}: Step3Props) {
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container>
      <div>
        <BackButton onClick={onBack} disabled={isLoading}>← 양식 스타일로 돌아가기</BackButton>
        <Title style={{ marginTop: '8px' }}>내용 작성</Title>
        <Subtitle>
          필요한 정보를 입력하면 AI가 양식을 자연스럽게 채워넣습니다
        </Subtitle>
      </div>

      <HelpText>
        이름, 부서, 날짜, 외근/출장 사유 등 필요한 정보를 자유롭게 입력해주세요.
        여러 번 수정 요청도 가능합니다.
      </HelpText>

      <ChatArea ref={chatRef}>
        <MessageBubble $role="assistant">
          안녕하세요! 양식에 들어갈 내용을 알려주세요. 이름, 부서, 날짜, 주요 내용 등을 자유롭게 입력해주시면 양식에 맞게 채워넣겠습니다.
        </MessageBubble>
        {messages.map((msg, i) => (
          <MessageBubble key={i} $role={msg.role}>
            {msg.content}
          </MessageBubble>
        ))}
        {isLoading && (
          <MessageBubble $role="assistant" $delayed>
            작성중
            <Typing>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </Typing>
          </MessageBubble>
        )}
      </ChatArea>

      <InputArea>
        <TextArea
          placeholder="예: 김철수, 영업팀, 4월 15일 거래처 방문..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          variant="secondary"
          size="md"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          전송
        </Button>
      </InputArea>

      <ActionArea>
        <Button
          variant="cta"
          fullWidth
          size="lg"
          onClick={onDownload}
          disabled={isLoading}
        >
          완료하기 & 다운로드
        </Button>
      </ActionArea>
    </Container>
  );
}
