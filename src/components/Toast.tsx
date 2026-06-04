'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const slideDown = keyframes`
  from { transform: translate(-50%, -140%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrap = styled.div`
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  animation: ${slideDown} 340ms cubic-bezier(0.22, 0.61, 0.36, 1);
`;

const Card = styled.div`
  background: #131921;
  color: #ffffff;
  padding: 13px 22px;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(92vw, 520px);
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

export default function Toast({ message }: { message: string }) {
  return (
    <Wrap role="status" aria-live="polite">
      <Card>
        <Spinner aria-hidden />
        {message}
      </Card>
    </Wrap>
  );
}
