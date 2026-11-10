import { useState, useEffect, useCallback } from 'react';
import { Fish } from '../types/fish.js';
import { EatenLogItem } from '../types/simulation.js';
import { sharkTankService } from '../services/api.js';
import { useSharkWorkers } from './useSharkWorkers.js';
import { useFishSpawner } from './useFishSpawner.js';
import { useCollisionDetection } from './useCollisionDetection.js';

export function useSharkOceanSimulation() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [eatenLog, setEatenLog] = useState<EatenLogItem[]>([]);

  const {
    sharks,
    setSharks,
    startWorkers,
    pauseWorkers,
    resetWorkers
  } = useSharkWorkers();

  // Load initial statistics
  useEffect(() => {
    sharkTankService.getStats()
      .then(stats => {
        if (stats.sharksCounts) {
          setSharks(prev =>
            prev.map(s => {
              const found = stats.sharksCounts.find(item => item.tubarao_id === s.id);
              return { ...s, eatenCount: found ? found.count : 0 };
            })
          );
        }
        if (stats.historicoRecente) {
          setEatenLog(stats.historicoRecente);
        }
      })
      .catch(() => {});
  }, [setSharks]);

  // Spawn fishes
  useFishSpawner(isRunning, fishes, setFishes);

  // Detect collisions
  useCollisionDetection(isRunning, sharks, fishes, setSharks, setFishes, setEatenLog);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    startWorkers();
  }, [startWorkers]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    pauseWorkers();
  }, [pauseWorkers]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    resetWorkers();
    setFishes([]);
    sharkTankService.reset()
      .then(() => {
        setSharks(prev => prev.map(s => ({ ...s, eatenCount: 0 })));
        setEatenLog([]);
      })
      .catch(() => {});
  }, [resetWorkers, setSharks]);

  return {
    isRunning,
    sharks,
    fishes,
    eatenLog,
    handleStart,
    handlePause,
    handleReset
  };
}
