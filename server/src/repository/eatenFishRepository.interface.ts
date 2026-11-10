import { EatenFish } from '../domain/eatenFish.js';
import { SharkCount } from '../domain/tankStats.js';

export interface IEatenFishRepository {
  record(eatenFish: EatenFish): void;
  countByShark(sharkId: number): number;
  countAll(): number;
  getSharkCounts(): SharkCount[];
  getRecentHistory(limit?: number): EatenFish[];
  deleteAll(): void;
}
