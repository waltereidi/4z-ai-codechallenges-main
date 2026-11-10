import React from 'react';
import { Menu, X } from 'lucide-react';
import {
  HeaderBar,
  BrandGroup,
  MobileMenuButton,
  LogoImage,
  PlatformBadge
} from './Navbar.styles.js';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, onToggleSidebar }) => {
  return (
    <HeaderBar>
      <BrandGroup>
        <MobileMenuButton
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </MobileMenuButton>
        <LogoImage src="/logo-4zoom-branco.png" alt="4zOOm Logo" />
        <PlatformBadge>AI Challenges</PlatformBadge>
      </BrandGroup>
    </HeaderBar>
  );
};
