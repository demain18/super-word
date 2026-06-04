'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const slideDown = keyframes`
  from { transform: translate(-50%, -140%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
`;

// 다운로드 화살표가 트레이로 통통 떨어지는 느낌
const bounce = keyframes`
  0%, 100% { transform: translateY(-1.5px); }
  45% { transform: translateY(2.5px); }
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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 22px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #34d399 0%, #10b981 55%, #059669 100%);
  box-shadow: 0 8px 26px rgba(16, 185, 129, 0.45);
  max-width: min(92vw, 540px);
`;

const IconWrap = styled.span`
  flex: none;
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;

  .arrow {
    transform-origin: center;
    animation: ${bounce} 0.9s ease-in-out infinite;
  }
`;

function DownloadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g className="arrow">
        <line x1="12" y1="3.5" x2="12" y2="14" />
        <polyline points="7.5,10 12,14.5 16.5,10" />
      </g>
      <path d="M5 19.5 h14" />
    </svg>
  );
}

export default function Toast({ message }: { message: string }) {
  return (
    <Wrap role="status" aria-live="polite">
      <Card>
        <IconWrap>
          <DownloadIcon />
        </IconWrap>
        {message}
      </Card>
    </Wrap>
  );
}
