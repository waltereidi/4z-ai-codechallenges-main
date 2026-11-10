import styled from 'styled-components';

export const AppWrapper = styled.div.attrs({
  className: 'app-wrapper'
})`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

export const WorkspaceLayout = styled.div.attrs({
  className: 'zoom-workspace'
})`
  display: flex;
  flex: 1;
  width: 100%;
  position: relative;
`;

export const SidebarBackdrop = styled.div.attrs({
  className: 'sidebar-backdrop'
})`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 99;
  }
`;

export const DetailArea = styled.main.attrs({
  className: 'zoom-detail-area'
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main, #0c0814);
  min-width: 0;
  overflow-y: visible;
`;

export const DetailTopCard = styled.div.attrs({
  className: 'detail-top-card'
})`
  padding: 1.25rem 2rem;
  background: linear-gradient(180deg, var(--bg-surface, #1a122c) 0%, var(--bg-main, #0c0814) 100%);
  border-bottom: 1px solid var(--border-subtle, rgba(176, 58, 240, 0.18));
`;

export const ChallengeTitleRow = styled.div.attrs({
  className: 'challenge-title-row'
})`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;

  h2 {
    font-family: var(--font-heading, 'Poppins', sans-serif);
    font-size: 1.35rem;
    font-weight: 700;
  }
`;

export const CategoryPill = styled.span.attrs({
  className: 'zoom-pill'
})`
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.08);
  color: #d1c4e9;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-block;
`;

export const ChallengeDescription = styled.p.attrs({
  className: 'challenge-text-desc'
})`
  line-height: 1.6;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: #f3e8ff;
  font-weight: 500;
`;

export const SimulationContainer = styled.div`
  flex: 1;
  padding: 1.25rem;
  display: flex;
  min-height: 520px;
`;

export const EmptySelectionMessage = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-muted, #b3a9c7);
`;
