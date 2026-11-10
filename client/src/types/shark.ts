export type Direction = 'left' | 'right';

export interface Shark {
  id: number;
  name: string;
  x: number;
  y: number;
  speed: number;
  direction: Direction;
  color: string;
  eatenCount: number;
}
