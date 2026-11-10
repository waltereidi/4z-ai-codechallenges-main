import { Shark } from '../types/shark.js';

export const API_BASE: string = import.meta.env.VITE_API_URL || '/api';

export const INITIAL_SHARKS: Shark[] = [
  { id: 1, name: 'Tubarão Branco', x: 8, y: 22, speed: 2.1, direction: 'right', color: '#60a5fa', eatenCount: 0 },
  { id: 2, name: 'Tubarão Martelo', x: 45, y: 50, speed: 3.2, direction: 'left', color: '#fa6400', eatenCount: 0 },
  { id: 3, name: 'Tubarão Tigre', x: 75, y: 76, speed: 1.9, direction: 'right', color: '#c084fc', eatenCount: 0 }
];

export const FISH_COLORS: string[] = [
  '#f43f5e',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#06b6d4',
  '#eab308',
  '#10b981',
  '#f97316'
];
