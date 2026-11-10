import React from 'react';
import { ChallengeDifficulty } from '../types/challenge.js';

interface DifficultyPillProps {
  difficulty: ChallengeDifficulty | string;
}

export const DifficultyPill: React.FC<DifficultyPillProps> = ({ difficulty }) => {
  switch (difficulty) {
    case 'Fácil':
      return <span className="zoom-pill pill-easy">Fácil</span>;
    case 'Médio':
      return <span className="zoom-pill pill-medium">Médio</span>;
    case 'Difícil':
      return <span className="zoom-pill pill-hard">Difícil</span>;
    default:
      return <span className="zoom-pill">{difficulty}</span>;
  }
};
