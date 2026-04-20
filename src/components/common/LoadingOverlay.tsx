'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { theme } from '@/styles/theme';

interface LoadingOverlayProps {
  message?: string;
}

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const progressAnim = keyframes`
  0% { width: 0%; }
  20% { width: 30%; }
  40% { width: 50%; }
  60% { width: 65%; }
  80% { width: 80%; }
  100% { width: 95%; }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${theme.colors.borderGray};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Message = styled.div`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: ${theme.colors.borderGray};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to right, ${theme.colors.primary}, #FFD814);
  border-radius: 2px;
  animation: ${progressAnim} 15s ease-out forwards;
`;

export default function LoadingOverlay({
  message = '문서를 생성하고 있습니다...',
}: LoadingOverlayProps) {
  return (
    <Overlay>
      <Spinner />
      <Message>{message}</Message>
      <ProgressBar>
        <ProgressFill />
      </ProgressBar>
    </Overlay>
  );
}
