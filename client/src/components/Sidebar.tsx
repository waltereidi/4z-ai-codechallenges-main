import React from 'react';
import { Waves } from 'lucide-react';
import { Challenge } from '../types/challenge.js';
import { DifficultyPill } from './DifficultyPill.js';
import {
  SidebarContainer,
  SidebarHeader,
  SidebarHeaderTitle,
  ChallengeList,
  ChallengeItem,
  ChallengeItemTitle,
  ChallengeItemMeta,
  EmptyChallengesMessage
} from './Sidebar.styles.js';

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
    <SidebarContainer $isOpen={sidebarOpen}>
      <SidebarHeader>
        <SidebarHeaderTitle>Desafios ({challenges.length})</SidebarHeaderTitle>
        <Waves size={16} color="#b03af0" />
      </SidebarHeader>

      <ChallengeList>
        {challenges.length === 0 ? (
          <EmptyChallengesMessage>
            Nenhum desafio cadastrado.
          </EmptyChallengesMessage>
        ) : (
          challenges.map(c => (
            <ChallengeItem
              key={c.id}
              $isActive={selectedChallenge?.id === c.id}
              onClick={() => onSelectChallenge(c.id)}
            >
              <ChallengeItemTitle>{c.title}</ChallengeItemTitle>
              <ChallengeItemMeta>
                <span>{c.category}</span>
                <DifficultyPill difficulty={c.difficulty} />
              </ChallengeItemMeta>
            </ChallengeItem>
          ))
        )}
      </ChallengeList>
    </SidebarContainer>
  );
};
