import React from 'react';
import { Waves, Database } from 'lucide-react';
import { Shark } from '../../types/shark.js';
import {
  TopBarContainer,
  OceanTitleGroup,
  ThreadPillsGroup,
  TelemetryBadge,
  TelemetryDot
} from './OceanTopBar.styles.js';

interface OceanTopBarProps {
  sharks: Shark[];
  fishCount: number;
  isRunning: boolean;
}

export const OceanTopBar: React.FC<OceanTopBarProps> = ({ sharks, fishCount, isRunning }) => {
  return (
    <TopBarContainer>
      <OceanTitleGroup>
        <Waves size={20} color="#00e5ff" />
        <span>Shark Tank</span>
      </OceanTitleGroup>
      <ThreadPillsGroup>
        <TelemetryBadge $borderColor="#38bdf8">
          <Database size={12} color="#38bdf8" />
          <span>Peixes no Tanque: <strong>{fishCount}</strong></span>
        </TelemetryBadge>
        {sharks.map(s => (
          <TelemetryBadge key={s.id} $borderColor={s.color}>
            <TelemetryDot $isActive={isRunning} />
            <strong>{s.name}:</strong> Comeu {s.eatenCount} 🐟
          </TelemetryBadge>
        ))}
      </ThreadPillsGroup>
    </TopBarContainer>
  );
};
