import styled from 'styled-components';

export const DrawerContainer = styled.div.attrs({
  className: 'eaten-log-drawer'
})`
  background: rgba(7, 4, 13, 0.95);
  border-top: 1px solid rgba(176, 58, 240, 0.25);
  padding: 0.6rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 20;
`;

export const DrawerTitle = styled.div.attrs({
  className: 'eaten-log-title'
})`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-muted, #b3a9c7);
`;

export const DrawerGrid = styled.div.attrs({
  className: 'eaten-log-grid'
})`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
`;

export const LogPill = styled.div.attrs({
  className: 'eaten-log-pill'
})`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  background: rgba(21, 15, 36, 0.8);
  border: 1px solid rgba(176, 58, 240, 0.3);
  font-size: 0.72rem;
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
`;

export const LogShark = styled.span.attrs({
  className: 'log-shark'
})`
  font-weight: 700;
  color: #60a5fa;
`;

export const LogTime = styled.span.attrs({
  className: 'log-time'
})`
  color: var(--text-subtle, #7a708d);
`;

export const LogTam = styled.span.attrs({
  className: 'log-tam'
})`
  color: #fbbf24;
`;

export const LogContent = styled.span.attrs({
  className: 'log-content'
})`
  color: #34d399;
`;
