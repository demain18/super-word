import { css } from '@emotion/react';
import { theme } from './theme';

export const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Noto Sans KR', ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.textPrimary};
    background-color: ${theme.colors.background};
    line-height: ${theme.typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${theme.colors.textLink};
    text-decoration: none;
    &:hover {
      color: ${theme.colors.textLinkHover};
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.backgroundLight};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.borderGray};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.mediumGray};
  }
`;
