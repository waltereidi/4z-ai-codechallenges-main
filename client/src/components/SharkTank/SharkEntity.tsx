import React from 'react';
import { Shark } from '../../types/shark.js';
import {
  SharkEntityContainer,
  SharkTag,
  SpeedLabel,
  SharkBodyWrapper,
  SharkSvg,
  StomachBadge,
  StomachCount,
  StomachIcon
} from './SharkEntity.styles.js';

interface SharkEntityProps {
  shark: Shark;
}

export const SharkEntity: React.FC<SharkEntityProps> = ({ shark }) => {
  const isFacingLeft = shark.direction === 'left';

  return (
    <SharkEntityContainer
      $x={shark.x}
      $y={shark.y}
      $isFacingLeft={isFacingLeft}
    >
      <SharkTag
        $isFacingLeft={isFacingLeft}
        $borderColor={shark.color}
      >
        <span>{shark.name}</span>
        <SpeedLabel>{shark.speed.toFixed(1)} nós</SpeedLabel>
      </SharkTag>

      <SharkBodyWrapper>
        <SharkSvg
          viewBox="0 0 160 70"
          width="150"
          height="70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 35 C35 15, 80 10, 140 32 C125 45, 80 55, 30 48 C20 48, 15 42, 15 35 Z"
            fill={shark.color}
            opacity="0.9"
          />
          <path d="M65 20 L80 0 L90 22 Z" fill={shark.color} />
          <path d="M75 42 L88 62 L100 44 Z" fill={shark.color} opacity="0.95" />
          <path d="M18 35 L0 12 L10 35 L0 58 Z" fill={shark.color} />
          <circle cx="125" cy="30" r="3" fill="#ffffff" />
          <circle cx="126" cy="30" r="1.5" fill="#000000" />
          <line x1="105" y1="28" x2="103" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="110" y1="28" x2="108" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="115" y1="28" x2="113" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        </SharkSvg>

        <StomachBadge $isFacingLeft={isFacingLeft}>
          <StomachCount>{shark.eatenCount}</StomachCount>
          <StomachIcon>🐟</StomachIcon>
        </StomachBadge>
      </SharkBodyWrapper>
    </SharkEntityContainer>
  );
};
