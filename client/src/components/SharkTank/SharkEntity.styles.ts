import styled from 'styled-components';

interface SharkEntityContainerProps {
  $x: number;
  $y: number;
  $isFacingLeft: boolean;
}

export const SharkEntityContainer = styled.div.attrs<SharkEntityContainerProps>({
  className: 'shark-entity'
})<SharkEntityContainerProps>`
  position: absolute;
  pointer-events: none;
  z-index: 10;
  will-change: left, transform;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  transform: translate(-50%, -50%) scaleX(${props => (props.$isFacingLeft ? -1 : 1)});
  transition: left 0.05s linear, top 0.05s linear;
`;

interface SharkTagProps {
  $isFacingLeft: boolean;
  $borderColor?: string;
}

export const SharkTag = styled.div.attrs<SharkTagProps>({
  className: 'shark-thread-tag'
})<SharkTagProps>`
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%) scaleX(${props => (props.$isFacingLeft ? -1 : 1)});
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.18rem 0.55rem;
  border-radius: 9999px;
  background: rgba(3, 14, 28, 0.9);
  border: 1px solid ${props => props.$borderColor || 'rgba(0, 229, 255, 0.4)'};
  font-size: 0.7rem;
  font-family: var(--font-mono, monospace);
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
`;

export const SpeedLabel = styled.span.attrs({
  className: 'speed-label'
})`
  color: #fa6400;
  margin-left: 0.25rem;
`;

export const SharkBodyWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 70px;
`;

export const SharkSvg = styled.svg.attrs({
  className: 'shark-svg'
})`
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.7));
  transition: filter 0.2s ease;
`;

interface StomachBadgeProps {
  $isFacingLeft: boolean;
}

export const StomachBadge = styled.div.attrs<StomachBadgeProps>({
  className: 'shark-stomach-badge'
})<StomachBadgeProps>`
  position: absolute;
  top: 50%;
  left: 45%;
  background: rgba(12, 8, 20, 0.88);
  border: 1.5px solid #fa6400;
  color: #ffffff;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 0 10px rgba(250, 100, 0, 0.6);
  z-index: 15;
  transform: translate(-50%, -50%) scaleX(${props => (props.$isFacingLeft ? -1 : 1)});
`;

export const StomachCount = styled.span.attrs({
  className: 'stomach-count'
})`
  font-family: var(--font-heading, 'Poppins', sans-serif);
  font-weight: 800;
  font-size: 0.8rem;
  color: #ff9d5c;
`;

export const StomachIcon = styled.span.attrs({
  className: 'stomach-icon'
})`
  font-size: 0.72rem;
`;
