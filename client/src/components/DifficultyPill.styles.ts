import styled, { css } from 'styled-components';

interface StyledPillProps {
  $variant?: 'easy' | 'medium' | 'hard';
}

export const StyledPill = styled.span.attrs<StyledPillProps>(props => ({
  className: `zoom-pill ${props.$variant ? `pill-${props.$variant}` : ''}`.trim()
}))<StyledPillProps>`
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-block;

  ${props =>
    props.$variant === 'easy' &&
    css`
      background-color: rgba(16, 185, 129, 0.18);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    `}

  ${props =>
    props.$variant === 'medium' &&
    css`
      background-color: rgba(250, 100, 0, 0.18);
      color: #ff9d5c;
      border: 1px solid rgba(250, 100, 0, 0.4);
    `}

  ${props =>
    props.$variant === 'hard' &&
    css`
      background-color: rgba(239, 68, 68, 0.18);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
    `}
`;
