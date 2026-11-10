import React from 'react';
import { ChallengeDifficulty } from '../types/challenge.js';
import { StyledPill } from './DifficultyPill.styles.js';

interface DifficultyPillProps {
  difficulty: ChallengeDifficulty | string;
}

export const DifficultyPill: React.FC<DifficultyPillProps> = ({ difficulty }) => {
  switch (difficulty) {
    case 'Fácil':
      return <StyledPill $variant="easy">Fácil</StyledPill>;
    case 'Médio':
      return <StyledPill $variant="medium">Médio</StyledPill>;
    case 'Difícil':
      return <StyledPill $variant="hard">Difícil</StyledPill>;
    default:
      return <StyledPill>{difficulty}</StyledPill>;
  }
};
