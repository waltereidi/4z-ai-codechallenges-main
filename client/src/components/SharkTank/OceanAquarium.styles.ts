import styled, { keyframes } from 'styled-components';

const floatUp = keyframes`
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { opacity: 0.6; }
  80% { opacity: 0.6; }
  100% { transform: translateY(-560px) scale(1.2); opacity: 0; }
`;

export const AquariumArea = styled.div.attrs({
  className: 'ocean-aquarium'
})`
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 460px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #02203e 0%, #031428 50%, #010813 100%);
`;

export const WaterLayer = styled.div.attrs({
  className: 'ocean-water-layer'
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 10%, rgba(0, 229, 255, 0.12) 0%, transparent 70%);
  pointer-events: none;
`;

export const BubblesContainer = styled.div.attrs({
  className: 'ocean-bubbles'
})`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

interface BubbleItemProps {
  $left?: string;
  $size?: string;
  $duration?: string;
  $delay?: string;
}

export const BubbleItem = styled.span.attrs<BubbleItemProps>({
  className: 'bubble'
})<BubbleItemProps>`
  position: absolute;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: ${floatUp} ${props => props.$duration || '8s'} infinite linear;
  animation-delay: ${props => props.$delay || '0s'};
  left: ${props => props.$left || '50%'};
  width: ${props => props.$size || '10px'};
  height: ${props => props.$size || '10px'};
`;

export const StartOverlay = styled.div.attrs({
  className: 'start-overlay'
})`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(1, 8, 19, 0.65);
  backdrop-filter: blur(4px);
  z-index: 30;
  transition: opacity 0.3s ease;
`;

export const StartButton = styled.button.attrs({
  className: 'btn-ocean-start'
})`
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 2.2rem;
  border-radius: 50px;
  background: linear-gradient(135deg, #fa6400 0%, #ff8533 100%);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.4);
  font-family: var(--font-heading, 'Poppins', sans-serif);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(250, 100, 0, 0.5), 0 0 20px rgba(250, 100, 0, 0.3);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 14px 40px rgba(250, 100, 0, 0.7), 0 0 30px rgba(250, 100, 0, 0.5);
    background: linear-gradient(135deg, #ff7214 0%, #ffa05c 100%);
  }
`;

export const OceanFloor = styled.div.attrs({
  className: 'ocean-floor'
})`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  pointer-events: none;
  z-index: 5;
`;

interface SeabedHillProps {
  $variant?: 'h1' | 'h2';
}

export const SeabedHill = styled.div.attrs<SeabedHillProps>(props => ({
  className: `seabed-hill ${props.$variant || 'h1'}`
}))<SeabedHillProps>`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #091a2d 0%, #030811 100%);
  border-radius: 50% 50% 0 0 / 25px 25px 0 0;

  ${props =>
    props.$variant === 'h2' &&
    `
      opacity: 0.6;
      transform: scaleX(1.3) translateX(-10%);
    `}
`;

export const ControlsArea = styled.div.attrs({
  className: 'ocean-bottom-right-controls'
})`
  position: absolute;
  bottom: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 35;
`;

export const PauseButton = styled.button.attrs({
  className: 'btn-ocean-pause'
})`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  border-radius: 30px;
  background: linear-gradient(135deg, #632484 0%, #b03af0 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: var(--font-heading, 'Poppins', sans-serif);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(176, 58, 240, 0.4);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #75299c 0%, #c155fa 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(176, 58, 240, 0.6);
  }
`;

export const ResetButton = styled.button.attrs({
  className: 'btn-ocean-reset'
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 1);
    color: #ffffff;
    transform: rotate(-45deg);
  }
`;
