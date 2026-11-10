import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Shark } from '../../types/shark.js';
import { Fish } from '../../types/fish.js';
import { SharkEntity } from './SharkEntity.js';
import { FishEntity } from './FishEntity.js';

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
    <div className="ocean-aquarium">
      <div className="ocean-water-layer" />
      <div className="ocean-bubbles">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
        <span className="bubble b5" />
      </div>

      {!isRunning && (
        <div className="start-overlay">
          <button className="btn-ocean-start" onClick={onStart}>
            <Play size={28} fill="#ffffff" />
            <span>INICIAR</span>
          </button>
        </div>
      )}

      {fishes.map(fish => (
        <FishEntity key={fish.id} fish={fish} />
      ))}

      {sharks.map(shark => (
        <SharkEntity key={shark.id} shark={shark} />
      ))}

      <div className="ocean-floor">
        <div className="seabed-hill h1" />
        <div className="seabed-hill h2" />
      </div>

      <div className="ocean-bottom-right-controls">
        <button
          className="btn-ocean-pause"
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
        </button>
        <button className="btn-ocean-reset" onClick={onReset} aria-label="Resetar simulação">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
