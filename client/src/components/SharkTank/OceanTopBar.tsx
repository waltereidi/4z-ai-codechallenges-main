import React from 'react';
import { Waves, Database } from 'lucide-react';
import { Shark } from '../../types/shark.js';

interface OceanTopBarProps {
  sharks: Shark[];
  fishCount: number;
  isRunning: boolean;
}

export const OceanTopBar: React.FC<OceanTopBarProps> = ({ sharks, fishCount, isRunning }) => {
  return (
    <div className="ocean-top-bar">
      <div className="ocean-title-group">
        <Waves size={20} color="#00e5ff" />
        <span>Shark Tank</span>
      </div>
      <div className="ocean-thread-pills">
        <div className="thread-telemetry-badge" style={{ borderColor: '#38bdf8' }}>
          <Database size={12} color="#38bdf8" />
          <span>Peixes no Tanque: <strong>{fishCount}</strong></span>
        </div>
        {sharks.map(s => (
          <div key={s.id} className="thread-telemetry-badge" style={{ borderColor: s.color }}>
            <span className="dot" style={{ backgroundColor: isRunning ? '#10b981' : '#f59e0b' }} />
            <strong>{s.name}:</strong> Comeu {s.eatenCount} 🐟
          </div>
        ))}
      </div>
    </div>
  );
};
