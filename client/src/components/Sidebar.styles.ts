import styled, { css } from 'styled-components';

interface SidebarContainerProps {
  $isOpen?: boolean;
}

export const SidebarContainer = styled.aside.attrs<SidebarContainerProps>(props => ({
  className: `zoom-sidebar ${props.$isOpen ? 'mobile-open' : ''}`.trim()
}))<SidebarContainerProps>`
  width: 320px;
  flex-shrink: 0;
  background-color: var(--bg-card, #150f24);
  border-right: 1px solid var(--border-subtle, rgba(176, 58, 240, 0.18));
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 55px;
  height: calc(100vh - 55px);
  overflow-y: auto;
  transition: transform 0.25s ease;

  @media (max-width: 768px) {
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    z-index: 100;
    width: 280px;
    height: calc(100vh - 50px);
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.6);

    ${props =>
      props.$isOpen &&
      css`
        transform: translateX(0);
      `}
  }
`;

export const SidebarHeader = styled.div.attrs({
  className: 'sidebar-header'
})`
  flex-shrink: 0;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle, rgba(176, 58, 240, 0.18));
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-card, #150f24);
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const SidebarHeaderTitle = styled.span.attrs({
  className: 'sidebar-header-title'
})`
  font-family: var(--font-heading, 'Poppins', sans-serif);
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted, #b3a9c7);
`;

export const ChallengeList = styled.div.attrs({
  className: 'challenge-list'
})`
  flex: 1;
`;

interface ChallengeItemProps {
  $isActive?: boolean;
}

export const ChallengeItem = styled.div.attrs<ChallengeItemProps>(props => ({
  className: `challenge-item ${props.$isActive ? 'active' : ''}`.trim()
}))<ChallengeItemProps>`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(176, 58, 240, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-card-hover, #1e1533);
  }

  ${props =>
    props.$isActive &&
    css`
      background: linear-gradient(90deg, rgba(99, 36, 132, 0.35) 0%, rgba(21, 15, 36, 0.8) 100%);
      border-left: 4px solid var(--brand-orange, #fa6400);
    `}
`;

export const ChallengeItemTitle = styled.div.attrs({
  className: 'challenge-item-title'
})`
  font-weight: 700;
  font-size: 0.92rem;
  margin-bottom: 0.35rem;
  color: var(--text-main, #ffffff);
`;

export const ChallengeItemMeta = styled.div.attrs({
  className: 'challenge-item-meta'
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.76rem;
  color: var(--text-muted, #b3a9c7);
`;

export const EmptyChallengesMessage = styled.div`
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--text-subtle, #7a708d);
  font-size: 0.85rem;
`;
