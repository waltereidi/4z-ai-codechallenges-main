import styled from 'styled-components';

export const HeaderBar = styled.header.attrs({
  className: 'zoom-navbar'
})`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: rgba(12, 8, 20, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle, rgba(176, 58, 240, 0.18));
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
  }
`;

export const BrandGroup = styled.div.attrs({
  className: 'zoom-brand-group'
})`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const MobileMenuButton = styled.button.attrs({
  className: 'mobile-menu-btn'
})`
  display: none;
  background: none;
  border: none;
  color: var(--text-main, #ffffff);
  cursor: pointer;
  padding: 0.4rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const LogoImage = styled.img.attrs({
  className: 'zoom-logo-img'
})`
  height: 34px;
  object-fit: contain;
`;

export const PlatformBadge = styled.span.attrs({
  className: 'zoom-badge-platform'
})`
  background: linear-gradient(90deg, rgba(99, 36, 132, 0.6), rgba(176, 58, 240, 0.3));
  border: 1px solid rgba(176, 58, 240, 0.4);
  color: #f3e8ff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;
