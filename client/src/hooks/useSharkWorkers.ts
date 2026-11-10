import { useState, useEffect, useRef, useCallback } from 'react';
import { Shark, Direction } from '../types/shark.js';
import { INITIAL_SHARKS } from '../utils/constants.js';
import { SHARK_WORKER_CODE } from '../utils/workerCode.js';

interface WorkerMessageData {
  x: number;
  y: number;
  speed: number;
  direction: Direction;
}

export function useSharkWorkers() {
  const [sharks, setSharks] = useState<Shark[]>(INITIAL_SHARKS);
  const workersRef = useRef<Worker[]>([]);

  useEffect(() => {
    const blob = new Blob([SHARK_WORKER_CODE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    workersRef.current = INITIAL_SHARKS.map((shark, index) => {
      const worker = new Worker(workerUrl);

      worker.postMessage({
        action: 'INIT',
        initialX: shark.x,
        initialY: shark.y
      });

      worker.onmessage = (e: MessageEvent<WorkerMessageData>) => {
        const { x, y, speed, direction } = e.data;
        setSharks(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = {
              ...next[index],
              x,
              y,
              speed,
              direction
            };
          }
          return next;
        });
      };

      return worker;
    });

    return () => {
      workersRef.current.forEach(w => w.terminate());
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  const startWorkers = useCallback(() => {
    workersRef.current.forEach(worker => {
      worker.postMessage({ action: 'START' });
    });
  }, []);

  const pauseWorkers = useCallback(() => {
    workersRef.current.forEach(worker => {
      worker.postMessage({ action: 'PAUSE' });
    });
  }, []);

  const resetWorkers = useCallback(() => {
    const starts = [8, 45, 75];
    workersRef.current.forEach((worker, idx) => {
      worker.postMessage({ action: 'RESET', initialX: starts[idx] });
    });
  }, []);

  return {
    sharks,
    setSharks,
    startWorkers,
    pauseWorkers,
    resetWorkers
  };
}
