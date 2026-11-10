import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Shark } from '../../types/shark.js';
import { Fish } from '../../types/fish.js';
import { SharkEntity } from './SharkEntity.js';
import { FishEntity } from './FishEntity.js';
import {
  AquariumArea,
  WaterLayer,
  BubblesContainer,
  BubbleItem,
  StartOverlay,
  StartButton,
  OceanFloor,
  SeabedHill,
  ControlsArea,
  PauseButton,
  ResetButton
} from './OceanAquarium.styles.js';

interface OceanAquariumProps {
  isRunning: boolean;
  sharks: Shark[];
  fishes: Fish[];
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const OceanAquarium: React.FC<OceanAquariumProps> = ({
  isRunning,
  sharks,
  fishes,
  onStart,
  onPause,
  onReset
}) => {
  return (
    <AquariumArea>
      <WaterLayer />
      <BubblesContainer>
        <BubbleItem $left="15%" $size="14px" $duration="9s" $delay="1s" />
        <BubbleItem $left="35%" $size="8px" $duration="6s" $delay="2s" />
        <BubbleItem $left="55%" $size="18px" $duration="11s" $delay="0.5s" />
        <BubbleItem $left="75%" $size="10px" $duration="7s" $delay="3s" />
        <BubbleItem $left="90%" $size="12px" $duration="8.5s" $delay="1.5s" />
      </BubblesContainer>

      {!isRunning && (
        <StartOverlay>
          <StartButton onClick={onStart}>
            <Play size={28} fill="#ffffff" />
            <span>INICIAR</span>
          </StartButton>
        </StartOverlay>
      )}

      {fishes.map(fish => (
        <FishEntity key={fish.id} fish={fish} />
      ))}

      {sharks.map(shark => (
        <SharkEntity key={shark.id} shark={shark} />
      ))}

      <OceanFloor>
        <SeabedHill $variant="h1" />
        <SeabedHill $variant="h2" />
      </OceanFloor>

      <ControlsArea>
        <PauseButton
          onClick={isRunning ? onPause : onStart}
        >
          {isRunning ? (
            <>
              <Pause size={18} fill="#ffffff" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play size={18} fill="#ffffff" />
              <span>Retomar</span>
            </>
          )}
        </PauseButton>
        <ResetButton onClick={onReset} aria-label="Resetar simulação">
          <RotateCcw size={16} />
        </ResetButton>
      </ControlsArea>
    </AquariumArea>
  );
};
