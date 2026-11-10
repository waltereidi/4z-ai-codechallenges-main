import React from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, onToggleSidebar }) => {
  return (
    <header className="zoom-navbar">
      <div className="zoom-brand-group">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <img src="/logo-4zoom-branco.png" alt="4zOOm Logo" className="zoom-logo-img" />
        <span className="zoom-badge-platform">AI Challenges</span>
      </div>
    </header>
  );
};
