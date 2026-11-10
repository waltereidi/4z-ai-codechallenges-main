import React from 'react';
import { Fish } from '../../types/fish.js';
import { FishEntityContainer } from './FishEntity.styles.js';

interface FishEntityProps {
  fish: Fish;
}

export const FishEntity: React.FC<FishEntityProps> = ({ fish }) => {
  return (
    <FishEntityContainer
      $x={fish.x}
      $y={fish.y}
      $size={fish.tamanho}
    >
      <svg viewBox="0 0 40 25" width="100%" height="100%" fill="none">
        <path
          d="M5 12 C12 4, 28 4, 38 12 C28 20, 12 20, 5 12 Z"
          fill={fish.cor}
          opacity="0.9"
        />
        <path d="M5 12 L0 5 L0 19 Z" fill={fish.cor} />
        <circle cx="32" cy="11" r="1.8" fill="#ffffff" />
        <circle cx="32.5" cy="11" r="0.9" fill="#000000" />
      </svg>
    </FishEntityContainer>
  );
};
