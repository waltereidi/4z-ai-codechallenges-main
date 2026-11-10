import { Fish } from '../domain/fish.js';

export interface IFishRepository {
  create(fish: Fish): void;
  findById(id: string): Fish | null;
  markAsEaten(id: string): void;
  countAll(): number;
  deleteAll(): void;
}
