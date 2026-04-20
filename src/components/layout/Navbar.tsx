'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

interface NavbarProps {
  currentStep: 1 | 2 | 3;
}

const Nav = styled.nav`
  background-color: #131921;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: ${theme.shadows.nav};
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

export default function Navbar({ currentStep }: NavbarProps) {
  return (
    <>
      <Nav>
        <Logo>
          <LogoAccent>Super</LogoAccent>Word
        </Logo>
      </Nav>
      <SubNav>
        {STEPS.map((step, i) => (
          <span key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
            <Step
              $active={currentStep === step.num}
              $completed={currentStep > step.num}
            >
              <StepNumber
                $active={currentStep === step.num}
                $completed={currentStep > step.num}
              >
                {currentStep > step.num ? '✓' : step.num}
              </StepNumber>
              {step.label}
            </Step>
            {i < STEPS.length - 1 && <StepDivider>›</StepDivider>}
          </span>
        ))}
      </SubNav>
    </>
  );
}
