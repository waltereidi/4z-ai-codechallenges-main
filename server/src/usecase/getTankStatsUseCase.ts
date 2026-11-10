import { TankStats } from '../domain/tankStats.js';
import { IFishRepository } from '../repository/fishRepository.interface.js';
import { IEatenFishRepository } from '../repository/eatenFishRepository.interface.js';

export class GetTankStatsUseCase {
  constructor(
    private readonly fishRepository: IFishRepository,
    private readonly eatenFishRepository: IEatenFishRepository
  ) {}

  execute(): TankStats {
    const totalPeixesCriados = this.fishRepository.countAll();
    const totalPeixesComidos = this.eatenFishRepository.countAll();
    const sharksCounts = this.eatenFishRepository.getSharkCounts();
    const historicoRecente = this.eatenFishRepository.getRecentHistory(10);

    return {
      totalPeixesCriados,
      totalPeixesComidos,
      sharksCounts,
      historicoRecente
    };
  }
}
