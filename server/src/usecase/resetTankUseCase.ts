import { IFishRepository } from '../repository/fishRepository.interface.js';
import { IEatenFishRepository } from '../repository/eatenFishRepository.interface.js';

export class ResetTankUseCase {
  constructor(
    private readonly fishRepository: IFishRepository,
    private readonly eatenFishRepository: IEatenFishRepository
  ) {}

  execute(): { success: boolean } {
    this.fishRepository.deleteAll();
    this.eatenFishRepository.deleteAll();
    return { success: true };
  }
}
