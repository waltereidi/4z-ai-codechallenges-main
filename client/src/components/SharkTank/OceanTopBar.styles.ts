import styled from 'styled-components';

export const TopBarContainer = styled.div.attrs({
  className: 'ocean-top-bar'
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: rgba(3, 19, 38, 0.9);
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
  flex-wrap: wrap;
  gap: 0.75rem;
  z-index: 20;
`;

export const OceanTitleGroup = styled.div.attrs({
  className: 'ocean-title-group'
})`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-heading, 'Poppins', sans-serif);
  font-size: 0.88rem;
  font-weight: 700;
  color: #00e5ff;
`;

export const ThreadPillsGroup = styled.div.attrs({
  className: 'ocean-thread-pills'
})`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

interface TelemetryBadgeProps {
  $borderColor?: string;
}

export const TelemetryBadge = styled.div.attrs<TelemetryBadgeProps>({
  className: 'thread-telemetry-badge'
})<TelemetryBadgeProps>`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid ${props => props.$borderColor || 'rgba(0, 229, 255, 0.4)'};
  font-size: 0.74rem;
  font-family: var(--font-mono, monospace);
  color: #e0f2fe;
`;

interface TelemetryDotProps {
  $isActive?: boolean;
}

export const TelemetryDot = styled.span.attrs<TelemetryDotProps>({
  className: 'dot'
})<TelemetryDotProps>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${props => (props.$isActive ? '#10b981' : '#f59e0b')};
  box-shadow: 0 0 8px currentColor;
`;
