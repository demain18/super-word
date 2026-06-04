'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: `
    background: linear-gradient(to bottom, #F7DFA5, #F0C14B);
    border: 1px solid #a88734;
    color: #0F1111;
    &:hover:not(:disabled) {
      background: linear-gradient(to bottom, #F5D78E, #EEB933);
      border-color: #9c7e31;
    }
    &:active:not(:disabled) {
      background: #F0C14B;
      box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
    }
  `,
  cta: `
    background: linear-gradient(to bottom, #FFE03D 0%, #FFD814 55%, #F7C600 100%);
    border: 1px solid #E5B800;
    color: #0F1111;
    border-radius: 20px;
    transition: box-shadow 220ms ease, filter 220ms ease, transform 120ms ease;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -1px 0 rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.16);
    &:hover:not(:disabled) {
      filter: brightness(1.03);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85),
        inset 0 -1px 0 rgba(0, 0, 0, 0.08), 0 5px 14px rgba(0, 0, 0, 0.2);
    }
    &:active:not(:disabled) {
      transform: translateY(1px);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.18), 0 1px 2px rgba(0, 0, 0, 0.12);
    }
  `,
  secondary: `
    background: #FFA41C;
    border: 1px solid #FF8F00;
    color: #0F1111;
    border-radius: 20px;
    &:hover:not(:disabled) {
      background: #FA8900;
      border-color: #E47911;
    }
  `,
  ghost: `
    background: #FFFFFF;
    border: 1px solid #D5D9D9;
    color: #0F1111;
    box-shadow: 0 2px 5px 0 rgba(213, 217, 217, 0.5);
    &:hover:not(:disabled) {
      background: #F7FAFA;
      border-color: #B6B6B6;
    }
  `,
};

const sizeStyles = {
  sm: `padding: 4px 12px; font-size: 13px;`,
  md: `padding: 8px 16px; font-size: 14px;`,
  lg: `padding: 12px 24px; font-size: 16px;`,
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $fullWidth: boolean;
  $size: 'sm' | 'md' | 'lg';
}>`
  border-radius: 8px;
  font-weight: 400;
  cursor: pointer;
  line-height: 1.4;
  transition: all ${theme.transitions.fast};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:focus {
    outline: none;
    box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`;

export default function Button({
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <StyledButton $variant={variant} $fullWidth={fullWidth} $size={size} {...props}>
      {children}
    </StyledButton>
  );
}
