import React from 'react';
import { Waves } from 'lucide-react';
import { Challenge } from '../types/challenge.js';
import { DifficultyPill } from './DifficultyPill.js';

interface SidebarProps {
  challenges: Challenge[];
  selectedChallenge: Challenge | null;
  sidebarOpen: boolean;
  onSelectChallenge: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  challenges,
  selectedChallenge,
  sidebarOpen,
  onSelectChallenge
}) => {
  return (
    <aside className={`zoom-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-header-title">Desafios ({challenges.length})</span>
        <Waves size={16} color="#b03af0" />
      </div>

      <div className="challenge-list">
        {challenges.length === 0 ? (
          <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
            Nenhum desafio cadastrado.
          </div>
        ) : (
          challenges.map(c => (
            <div
              key={c.id}
              className={`challenge-item ${selectedChallenge?.id === c.id ? 'active' : ''}`}
              onClick={() => onSelectChallenge(c.id)}
            >
              <div className="challenge-item-title">{c.title}</div>
              <div className="challenge-item-meta">
                <span>{c.category}</span>
                <DifficultyPill difficulty={c.difficulty} />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
