import styled, { keyframes } from 'styled-components';

const fishWiggle = keyframes`
  0% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
  50% { transform: translate(-50%, -50%) translateY(-3px) rotate(4deg); }
  100% { transform: translate(-50%, -50%) translateY(3px) rotate(-4deg); }
`;

interface FishEntityContainerProps {
  $x: number;
  $y: number;
  $size: number;
}

export const FishEntityContainer = styled.div.attrs<FishEntityContainerProps>({
  className: 'fish-entity'
})<FishEntityContainerProps>`
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 8;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
  animation: ${fishWiggle} 1.5s infinite ease-in-out alternate;
  pointer-events: auto;
  cursor: pointer;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  width: ${props => props.$size}px;
  height: ${props => Math.round(props.$size * 0.65)}px;
`;
