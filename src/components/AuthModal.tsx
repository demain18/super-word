'use client';

import { useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onGoogle: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 17, 17, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const Dialog = styled.div`
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 380px;
  padding: 28px 24px 24px;
  box-shadow: ${theme.shadows.cardHover};
  text-align: center;
`;

const Title = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px;
`;

const Desc = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0 0 20px;
`;

const GoogleButton = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  color: #0f1111;
  border: 1px solid #d5d9d9;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all ${theme.transitions.fast};

  &:hover {
    background: #f7fafa;
    border-color: #b6b6b6;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
  }
`;

const Hint = styled.p`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin: 14px 0 0;
`;

const CloseButton = styled.button`
  margin-top: 14px;
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.2 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.5 5.5C41.9 36.2 44 30.6 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function AuthModal({ open, onClose, onGoogle }: AuthModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>다운로드하려면 로그인하세요</Title>
        <Desc>
          지금까지 만든 작업물은 그대로 유지됩니다.
          <br />
          로그인 후 이용권을 구매하면 바로 다운로드할 수 있어요.
        </Desc>
        <GoogleButton type="button" onClick={onGoogle}>
          <GoogleIcon />
          Google로 계속하기
        </GoogleButton>
        <Hint>로그인과 회원가입이 한번에 진행됩니다</Hint>
        <CloseButton type="button" onClick={onClose}>
          나중에 하기
        </CloseButton>
      </Dialog>
    </Overlay>
  );
}
