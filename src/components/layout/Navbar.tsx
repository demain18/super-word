'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { theme } from '@/styles/theme';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  currentStep: 1 | 2 | 3 | null;
  user: User | null;
  onSignOut: () => void;
  points?: number | null;
}

const Nav = styled.nav`
  background-color: #131921;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: ${theme.shadows.nav};
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 3px;
  border: 1px solid transparent;
  color: #ffffff;

  &:hover {
    border-color: #ffffff;
  }
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: ${theme.colors.secondaryHover};
`;

const AvatarFallback = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
`;

const UserName = styled.span`
  font-size: 13px;
  font-weight: 500;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: ${theme.breakpoints.mobile}) {
    display: none;
  }
`;

const PointBadge = styled.button`
  background: linear-gradient(135deg, #FFD93D 0%, #FF9F1A 55%, #E47911 100%);
  color: #1f0f00;
  border: 1px solid #B86B00;
  border-radius: 999px;
  padding: 6px 14px 6px 10px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.25);
  transition: transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -2px 0 rgba(0, 0, 0, 0.15),
      0 4px 8px rgba(0, 0, 0, 0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow:
      inset 0 2px 3px rgba(0, 0, 0, 0.25),
      0 1px 2px rgba(0, 0, 0, 0.2);
  }
  &:focus {
    outline: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      0 0 0 3px rgba(255, 215, 0, 0.45);
  }
`;

const PointCoin = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #5a2a00;
  background: radial-gradient(circle at 30% 30%, #FFF3A3 0%, #FFD542 55%, #C98600 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.9),
    inset 0 -1px 1px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(110, 60, 0, 0.5);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
`;

function formatPoints(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const SignOutButton = styled.button`
  background: transparent;
  color: #ffffff;
  border: 1px solid #565959;
  border-radius: 3px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color ${theme.transitions.fast}, background ${theme.transitions.fast};

  &:hover {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
  }
`;

const Logo = styled.div`
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  user-select: none;
  &:hover {
    border-color: #ffffff;
  }
`;

const LogoAccent = styled.span`
  color: ${theme.colors.primary};
`;

const SubNav = styled.div`
  background-color: #232f3e;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  gap: 0;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  color: ${({ $active, $completed }) =>
    $active ? '#ffffff' : $completed ? theme.colors.primary : '#cccccc'};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  padding: 6px 14px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default;

  ${({ $active }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${theme.colors.primary};
    }
  `}
`;

const StepNumber = styled.span<{ $active: boolean; $completed: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $active, $completed }) =>
    $active
      ? theme.colors.primary
      : $completed
        ? theme.colors.success
        : 'transparent'};
  color: ${({ $active, $completed }) =>
    $active || $completed ? '#ffffff' : '#cccccc'};
  border: ${({ $active, $completed }) =>
    $active || $completed ? 'none' : '1px solid #cccccc'};
`;

const StepDivider = styled.span`
  color: #565959;
  margin: 0 4px;
  font-size: 16px;
`;

const STEPS = [
  { num: 1, label: '보고서 선택' },
  { num: 2, label: '양식 스타일' },
  { num: 3, label: '내용 작성' },
];

export default function Navbar({ currentStep, user, onSignOut, points }: NavbarProps) {
  const router = useRouter();
  const meta = (user?.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const displayName = meta.full_name || meta.name || user?.email || '';
  const avatarUrl = meta.avatar_url || meta.picture || '';
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();
  const showSteps = currentStep !== null;

  return (
    <>
      <Nav>
        <Logo onClick={() => router.push('/')}>
          <LogoAccent>Super</LogoAccent>Word
        </Logo>
        {user && (
          <UserMenu>
            <PointBadge type="button" onClick={() => router.push('/point')} title="포인트 페이지로 이동">
              <PointCoin aria-hidden>P</PointCoin>
              {`${formatPoints(typeof points === 'number' ? points : 0)} P`}
            </PointBadge>
            <UserInfo>
              {avatarUrl ? (
                <Avatar src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" />
              ) : (
                <AvatarFallback>{initial}</AvatarFallback>
              )}
              <UserName>{displayName}</UserName>
            </UserInfo>
            <SignOutButton type="button" onClick={onSignOut}>
              로그아웃
            </SignOutButton>
          </UserMenu>
        )}
      </Nav>
      {showSteps && (
        <SubNav>
          {STEPS.map((step, i) => (
            <span key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
              <Step
                $active={currentStep === step.num}
                $completed={currentStep! > step.num}
              >
                <StepNumber
                  $active={currentStep === step.num}
                  $completed={currentStep! > step.num}
                >
                  {currentStep! > step.num ? '✓' : step.num}
                </StepNumber>
                {step.label}
              </Step>
              {i < STEPS.length - 1 && <StepDivider>›</StepDivider>}
            </span>
          ))}
        </SubNav>
      )}
    </>
  );
}
