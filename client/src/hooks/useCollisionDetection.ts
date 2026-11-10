import { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { Shark } from '../types/shark.js';
import { Fish } from '../types/fish.js';
import { EatenLogItem } from '../types/simulation.js';
import { sharkTankService } from '../services/api.js';

export function useCollisionDetection(
  isRunning: boolean,
  sharks: Shark[],
  fishes: Fish[],
  setSharks: Dispatch<SetStateAction<Shark[]>>,
  setFishes: Dispatch<SetStateAction<Fish[]>>,
  setEatenLog: Dispatch<SetStateAction<EatenLogItem[]>>
) {
  const sharksRef = useRef<Shark[]>(sharks);
  const fishesRef = useRef<Fish[]>(fishes);

  useEffect(() => {
    sharksRef.current = sharks;
  }, [sharks]);

  useEffect(() => {
    fishesRef.current = fishes;
  }, [fishes]);

  useEffect(() => {
    if (!isRunning) return;

    const collisionDetector = setInterval(() => {
      const currentSharks = sharksRef.current;
      const currentFishes = fishesRef.current;
      if (currentFishes.length === 0) return;

      const remainingFishes: Fish[] = [];
      const consumedMap: Record<number, number> = {};

      currentFishes.forEach(fish => {
        let eatenBy: Shark | null = null;

        for (const shark of currentSharks) {
          const dx = Math.abs(shark.x - fish.x);
          const dy = Math.abs(shark.y - fish.y);

          if (dx < 7.5 && dy < 12.0) {
            eatenBy = shark;
            break;
          }
        }

        if (eatenBy) {
          consumedMap[eatenBy.id] = (consumedMap[eatenBy.id] || 0) + 1;

          sharkTankService.recordEat({
            peixe_id: fish.id,
            tubarao_id: eatenBy.id,
            tubarao_nome: eatenBy.name,
            x_captura: fish.x,
            y_captura: fish.y
          })
            .then(data => {
              if (data && data.success && eatenBy) {
                setEatenLog(prev => [
                  {
                    id: Date.now(),
                    peixe_id: fish.id,
                    tubarao_nome: eatenBy!.name,
                    tamanho_peixe: fish.tamanho,
                    conteudo_peixe: fish.conteudo,
                    hora_comeu: data.hora_comeu || new Date().toISOString()
                  },
                  ...prev.slice(0, 9)
                ]);
              }
            })
            .catch(() => {});
        } else {
          remainingFishes.push(fish);
        }
      });

      if (remainingFishes.length !== currentFishes.length) {
        setFishes(remainingFishes);
      }

      if (Object.keys(consumedMap).length > 0) {
        setSharks(prev =>
          prev.map(s => {
            const added = consumedMap[s.id] || 0;
            return added > 0 ? { ...s, eatenCount: s.eatenCount + added } : s;
          })
        );
      }
    }, 80);

    return () => clearInterval(collisionDetector);
  }, [isRunning, setSharks, setFishes, setEatenLog]);
}
