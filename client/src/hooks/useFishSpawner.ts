import { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { Fish } from '../types/fish.js';
import { sharkTankService } from '../services/api.js';
import { generateRandomContent, getRandomElement } from '../utils/random.js';
import { FISH_COLORS } from '../utils/constants.js';

export function useFishSpawner(
  isRunning: boolean,
  fishes: Fish[],
  setFishes: Dispatch<SetStateAction<Fish[]>>
) {
  const fishesRef = useRef<Fish[]>(fishes);

  useEffect(() => {
    fishesRef.current = fishes;
  }, [fishes]);

  useEffect(() => {
    if (!isRunning) return;

    const fishSpawner = setInterval(() => {
      if (fishesRef.current.length >= 18) return;

      const randomTamanho = Math.floor(Math.random() * 26) + 14;
      const rawContent = generateRandomContent();
      const randomContent = rawContent.normalize('NFD');
      const randomColor = getRandomElement(FISH_COLORS);

      const tiers = [
        Math.random() * 20 + 15,
        Math.random() * 25 + 40,
        Math.random() * 20 + 65
      ];
      const targetY = tiers[Math.floor(Math.random() * tiers.length)];

      const newFish: Fish = {
        id: 'fish_' + Math.random().toString(36).substring(2, 9),
        conteudo: randomContent,
        tamanho: randomTamanho,
        x: Math.random() * 84 + 6,
        y: targetY,
        cor: randomColor,
        criado_em: new Date().toISOString()
      };

      sharkTankService.createFish(newFish).catch(() => {});
      setFishes(prev => [...prev, newFish]);
    }, 1800);

    return () => clearInterval(fishSpawner);
  }, [isRunning, setFishes]);
}
