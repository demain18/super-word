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
    background: #FFD814;
    border: 1px solid #FCD200;
    color: #0F1111;
    border-radius: 20px;
    &:hover:not(:disabled) {
      background: #F7CA00;
      border-color: #F2C200;
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
