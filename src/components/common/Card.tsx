'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

interface CardProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
  disabled?: boolean;
}

const StyledCard = styled.div<{
  $selected: boolean;
  $clickable: boolean;
  $hoverable: boolean;
  $disabled: boolean;
}>`
  background: ${({ $disabled }) => ($disabled ? '#F4F4F4' : '#ffffff')};
  border: ${({ $selected }) =>
    $selected ? `2px solid #E77600` : `1px solid ${theme.colors.cardBorder}`};
  border-radius: 8px;
  padding: 14px 18px;
  box-shadow: ${({ $selected, $disabled }) =>
    $disabled
      ? 'none'
      : $selected
        ? '0 0 3px 2px rgba(228, 121, 17, 0.5)'
        : theme.shadows.card};
  cursor: ${({ $clickable, $disabled }) =>
    $disabled ? 'not-allowed' : $clickable ? 'pointer' : 'default'};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  filter: ${({ $disabled }) => ($disabled ? 'grayscale(0.4)' : 'none')};
  transition: all ${theme.transitions.fast};

  ${({ $hoverable, $selected, $disabled }) =>
    $hoverable &&
    !$selected &&
    !$disabled &&
    `
    &:hover {
      box-shadow: ${theme.shadows.cardHover};
      border-color: #B6B6B6;
    }
  `}
`;

export default function Card({
  children,
  selected = false,
  onClick,
  hoverable = true,
  disabled = false,
}: CardProps) {
  return (
    <StyledCard
      $selected={selected}
      $clickable={!!onClick}
      $hoverable={hoverable}
      $disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
    >
      {children}
    </StyledCard>
  );
}
