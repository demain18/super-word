'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

interface CardProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

const StyledCard = styled.div<{
  $selected: boolean;
  $clickable: boolean;
  $hoverable: boolean;
}>`
  background: #ffffff;
  border: ${({ $selected }) =>
    $selected ? `2px solid #E77600` : `1px solid ${theme.colors.cardBorder}`};
  border-radius: 8px;
  padding: 14px 18px;
  box-shadow: ${({ $selected }) =>
    $selected
      ? '0 0 3px 2px rgba(228, 121, 17, 0.5)'
      : theme.shadows.card};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all ${theme.transitions.fast};

  ${({ $hoverable, $selected }) =>
    $hoverable &&
    !$selected &&
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
}: CardProps) {
  return (
    <StyledCard
      $selected={selected}
      $clickable={!!onClick}
      $hoverable={hoverable}
      onClick={onClick}
    >
      {children}
    </StyledCard>
  );
}
