import { EatenFish } from './eatenFish.js';

export interface SharkCount {
  tubarao_id: number;
  tubarao_nome: string;
  count: number;
}

export interface TankStats {
  totalPeixesCriados: number;
  totalPeixesComidos: number;
  sharksCounts: SharkCount[];
  historicoRecente: EatenFish[];
}
