import React from 'react';
import { useSharkOceanSimulation } from '../../hooks/useSharkOceanSimulation.js';
import { OceanTopBar } from './OceanTopBar.js';
import { OceanAquarium } from './OceanAquarium.js';
import { EatenLogDrawer } from './EatenLogDrawer.js';
import { OceanSimulationContainer } from './SharkOceanSimulation.styles.js';
import '../../SharkOceanSimulation.css';

export const SharkOceanSimulation: React.FC = () => {
  const {
    isRunning,
    sharks,
    fishes,
    eatenLog,
    handleStart,
    handlePause,
    handleReset
  } = useSharkOceanSimulation();

  return (
    <OceanSimulationContainer>
      <OceanTopBar
        sharks={sharks}
        fishCount={fishes.length}
        isRunning={isRunning}
      />

      <OceanAquarium
        isRunning={isRunning}
        sharks={sharks}
        fishes={fishes}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />

      <EatenLogDrawer logs={eatenLog} />
    </OceanSimulationContainer>
  );
};

export default SharkOceanSimulation;
