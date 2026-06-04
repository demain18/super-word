'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const slideIn = keyframes`
  from { transform: translate(-50%, -140%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
`;
const slideOut = keyframes`
  from { transform: translate(-50%, 0); opacity: 1; }
  to { transform: translate(-50%, -130%); opacity: 0; }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrap = styled.div<{ $closing: boolean }>`
  position: fixed;
  top: 18px;
  left: 50%;
  z-index: 3000;
  animation: ${({ $closing }) => ($closing ? slideOut : slideIn)}
    ${({ $closing }) => ($closing ? '300ms' : '340ms')} cubic-bezier(0.22, 0.61, 0.36, 1) both;
`;

const Card = styled.div`
  background: #131921;
  color: #ffffff;
  padding: 13px 16px 13px 22px;
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42), 0 3px 8px rgba(0, 0, 0, 0.28);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(92vw, 540px);
`;

const Spinner = styled.span`
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffd814;
  animation: ${spin} 0.8s linear infinite;
`;

const Msg = styled.span`
  flex: 1;
`;

const CloseBtn = styled.button`
  flex: none;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.55);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 6px;
  transition: color 150ms ease, background 150ms ease;
  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

interface Props {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
  const [closing, setClosing] = useState(false);

  // 새 메시지 → 다시 보이기 + 자동 닫힘 타이머
  useEffect(() => {
    setClosing(false);
    const hold = setTimeout(() => setClosing(true), 3000);
    return () => clearTimeout(hold);
  }, [message]);

  // 닫히기 시작하면(자동/수동) 애니메이션 끝난 뒤 제거
  useEffect(() => {
    if (!closing) return;
    const done = setTimeout(onClose, 320);
    return () => clearTimeout(done);
  }, [closing, onClose]);

  return (
    <Wrap role="status" aria-live="polite" $closing={closing}>
      <Card>
        <Spinner aria-hidden />
        <Msg>{message}</Msg>
        <CloseBtn type="button" onClick={() => setClosing(true)} aria-label="닫기">
          ×
        </CloseBtn>
      </Card>
    </Wrap>
  );
}
